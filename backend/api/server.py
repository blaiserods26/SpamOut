import os
import sys
import json
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

load_dotenv(dotenv_path=BASE_DIR / ".env")

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "spamout-dev-secret-key-change-in-production")

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
CLIENT_SECRETS_FILE = os.getenv("GOOGLE_CLIENT_SECRETS_FILE", str(BASE_DIR / "credentials.json"))
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

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'SpamOut Web API'})

@app.route('/authorize', methods=['GET'])
def authorize():
    """Initiate Google OAuth flow."""
    try:
        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            redirect_uri=url_for('oauth2callback', _external=True)
        )
        auth_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true'
        )
        session['state'] = state
        return redirect(auth_url)
    except Exception as e:
        return jsonify({'error': f"Failed to start OAuth: {str(e)}"}), 500

@app.route('/oauth2callback', methods=['GET'])
def oauth2callback():
    """Handle Google OAuth callback."""
    try:
        state = session.get('state')
        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            state=state,
            redirect_uri=url_for('oauth2callback', _external=True)
        )
        flow.fetch_token(authorization_response=request.url)
        credentials = flow.credentials
        save_credentials(credentials)
        return redirect('/analyze_emails')
    except Exception as e:
        return jsonify({'error': f"OAuth callback failed: {str(e)}"}), 500

@app.route('/emails', methods=['GET'])
def list_emails():
    """Fetch user's recent Gmail messages."""
    try:
        creds = get_credentials()
        if not creds:
            return jsonify({'error': 'Unauthorized. Please authenticate at /authorize'}), 401

        if creds.expired and creds.refresh_token:
            creds.refresh(Request())

        service = build('gmail', 'v1', credentials=creds)
        res = service.users().messages().list(userId='me', maxResults=10).execute()
        messages = res.get('messages', [])

        email_list = []
        for msg_info in messages:
            msg = service.users().messages().get(userId='me', id=msg_info['id']).execute()
            headers = {h['name'].lower(): h['value'] for h in msg.get('payload', {}).get('headers', [])}
            email_list.append({
                'id': msg['id'],
                'subject': headers.get('subject', '(no subject)'),
                'from': headers.get('from', ''),
                'date': headers.get('date', ''),
                'snippet': msg.get('snippet', '')
            })

        return jsonify({'emails': email_list})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze_emails', methods=['GET'])
def analyze_emails():
    """Analyze recent emails for security threats."""
    try:
        creds = get_credentials()
        if not creds:
            return jsonify({'error': 'Unauthorized. Please authenticate at /authorize'}), 401

        if creds.expired and creds.refresh_token:
            creds.refresh(Request())

        service = build('gmail', 'v1', credentials=creds)
        res = service.users().messages().list(userId='me', maxResults=10).execute()
        messages = res.get('messages', [])

        results = []
        for msg_info in messages:
            msg = service.users().messages().get(userId='me', id=msg_info['id']).execute()
            headers = {h['name'].lower(): h['value'] for h in msg.get('payload', {}).get('headers', [])}
            sender = headers.get('from', '')
            subject = headers.get('subject', '')
            snippet = msg.get('snippet', '')

            report = scanner.analyze_email(sender=sender, body=snippet)
            report['subject'] = subject
            report['id'] = msg['id']
            results.append(report)

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
