import os
import sys
import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from flask import Flask, request, redirect, session, url_for, jsonify
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

from core.scanner import EmailSecurityScanner

# Allow OAuth over HTTP and relaxed token scopes for Google OIDC
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'

load_dotenv(dotenv_path=BASE_DIR / ".env")

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "spamout-dev-secret-key-change-in-production")
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False

# Fallback store for PKCE verifiers keyed by OAuth state
OAUTH_STATE_STORE = {}

SCOPES = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/gmail.readonly',
]
CLIENT_SECRETS_FILE = os.getenv("GOOGLE_CLIENT_SECRETS_FILE", str(BASE_DIR / "credentials.json"))
OAUTH_REDIRECT_URI = os.getenv("OAUTH_REDIRECT_URI", "http://localhost:5000/oauth2callback")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000/home")
VT_API_KEY = os.getenv("VT_API_KEY")

scanner = EmailSecurityScanner(vt_api_key=VT_API_KEY)

def get_credentials():
    """Retrieve saved credentials from token.json or session."""
    token_path = BASE_DIR / "token.json"
    if token_path.exists():
        with open(token_path, "r") as f:
            creds_data = json.load(f)
            return Credentials.from_authorized_user_info(creds_data, SCOPES)
    return None

def save_credentials(credentials):
    """Save credentials to token.json."""
    creds_data = {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes
    }
    with open(BASE_DIR / "token.json", "w") as f:
        json.dump(creds_data, f, indent=2)

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'SpamOut Web API'})

@app.route('/auth_status', methods=['GET'])
def auth_status():
    """Check if Gmail credentials are valid and saved."""
    creds = get_credentials()
    if not creds:
        return jsonify({'authorized': False})
    return jsonify({'authorized': True, 'valid': creds.valid if hasattr(creds, 'valid') else True})

@app.route('/authorize', methods=['GET'])
def authorize():
    """Initiate Google OAuth flow with explicit account selection prompt."""
    try:
        # Redirect 127.0.0.1 requests to localhost so cookies and origins match OAUTH_REDIRECT_URI
        if '127.0.0.1' in request.host:
            qs = f"?{request.query_string.decode('utf-8')}" if request.query_string else ""
            return redirect(f"http://localhost:5000/authorize{qs}")

        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            redirect_uri=OAUTH_REDIRECT_URI
        )

        auth_params = {
            'access_type': 'offline',
            'include_granted_scopes': 'true',
            'prompt': 'select_account consent'  # Forces Google account chooser to appear
        }

        login_hint = request.args.get('login_hint')
        if login_hint:
            auth_params['login_hint'] = login_hint

        auth_url, state = flow.authorization_url(**auth_params)
        session['state'] = state

        # Preserve PKCE code_verifier across both Flask session and global state store
        code_verifier = getattr(flow, 'code_verifier', None)
        if code_verifier:
            session['code_verifier'] = code_verifier
            OAUTH_STATE_STORE[state] = code_verifier

        return redirect(auth_url)
    except Exception as e:
        return jsonify({'error': f"Failed to start OAuth: {str(e)}"}), 500

@app.route('/oauth2callback', methods=['GET'])
def oauth2callback():
    """Handle Google OAuth callback and redirect back to frontend."""
    try:
        # Retrieve state and PKCE verifier from query, session, or fallback store
        state = request.args.get('state') or session.get('state')
        code_verifier = session.get('code_verifier') or (OAUTH_STATE_STORE.pop(state, None) if state else None)

        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            state=state,
            redirect_uri=OAUTH_REDIRECT_URI
        )

        fetch_kwargs = {'authorization_response': request.url}
        if code_verifier:
            flow.code_verifier = code_verifier
            fetch_kwargs['code_verifier'] = code_verifier

        flow.fetch_token(**fetch_kwargs)
        credentials = flow.credentials
        save_credentials(credentials)
        return redirect(f"{FRONTEND_URL}?authorized=true")
    except Exception as e:
        return jsonify({'error': f"OAuth callback failed: {str(e)}"}), 500

@app.route('/disconnect_gmail', methods=['GET', 'POST'])
def disconnect_gmail():
    """Remove stored token.json to allow re-authenticating with another account."""
    token_path = BASE_DIR / "token.json"
    if token_path.exists():
        token_path.unlink()
    session.clear()
    return redirect(f"{FRONTEND_URL}?disconnected=true")

@app.route('/emails', methods=['GET'])
def list_emails():
    """Fetch user's recent Gmail messages in parallel."""
    try:
        creds = get_credentials()
        if not creds:
            return jsonify({'error': 'Unauthorized. Please authenticate at /authorize'}), 401

        if creds.expired and creds.refresh_token:
            creds.refresh(Request())

        service = build('gmail', 'v1', credentials=creds)
        res = service.users().messages().list(userId='me', maxResults=10).execute()
        messages = res.get('messages', [])

        def fetch_single(msg_info):
            try:
                msg = service.users().messages().get(userId='me', id=msg_info['id']).execute()
                headers = {h['name'].lower(): h['value'] for h in msg.get('payload', {}).get('headers', [])}
                return {
                    'id': msg['id'],
                    'subject': headers.get('subject', '(no subject)'),
                    'from': headers.get('from', ''),
                    'date': headers.get('date', ''),
                    'snippet': msg.get('snippet', '')
                }
            except Exception:
                return None

        with ThreadPoolExecutor(max_workers=5) as executor:
            email_list = [e for e in executor.map(fetch_single, messages) if e is not None]

        return jsonify({'emails': email_list})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze_emails', methods=['GET'])
def analyze_emails():
    """Analyze recent emails for security threats in parallel."""
    try:
        creds = get_credentials()
        if not creds:
            return jsonify({'error': 'Unauthorized. Please authenticate at /authorize'}), 401

        if creds.expired and creds.refresh_token:
            creds.refresh(Request())

        service = build('gmail', 'v1', credentials=creds)
        res = service.users().messages().list(userId='me', maxResults=10).execute()
        messages = res.get('messages', [])

        def analyze_single(msg_info):
            try:
                msg = service.users().messages().get(userId='me', id=msg_info['id']).execute()
                headers = {h['name'].lower(): h['value'] for h in msg.get('payload', {}).get('headers', [])}
                sender = headers.get('from', '')
                subject = headers.get('subject', '')
                snippet = msg.get('snippet', '')

                report = scanner.analyze_email(sender=sender, body=snippet)
                report['subject'] = subject
                report['sender'] = sender
                report['snippet'] = snippet
                report['id'] = msg['id']
                return report
            except Exception:
                return None

        with ThreadPoolExecutor(max_workers=5) as executor:
            results = [r for r in executor.map(analyze_single, messages) if r is not None]

        return jsonify({'results': results})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/scan', methods=['POST'])
def scan_manual():
    """On-demand scan of raw sender and body."""
    data = request.get_json() or {}
    sender = data.get('sender', '')
    body = data.get('body', '')

    if not sender:
        return jsonify({'error': 'Missing required parameter: sender'}), 400

    report = scanner.analyze_email(sender=sender, body=body)
    return jsonify(report)

if __name__ == '__main__':
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    app.run(host='0.0.0.0', port=port, debug=debug)
