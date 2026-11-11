import os
import json
from flask import Flask, request, redirect, session, url_for, jsonify
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'spamout-oauth-secret-dev')
OAUTH_STATE_STORE = {}

SCOPES = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/gmail.readonly',
]
CLIENT_SECRETS_FILE = os.getenv('GOOGLE_CLIENT_SECRETS_FILE', "./credentials.json")

@app.route('/')
def index():
    return '''
        <h1>Email Security Analysis Tool</h1>
        <a href="/authorize"><button>Login with Gmail</button></a>
    '''

@app.route('/authorize')
def authorize():
    try:
        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            redirect_uri=url_for('oauth2callback', _external=True)
        )
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='select_account consent'
        )
        session['state'] = state
        code_verifier = getattr(flow, 'code_verifier', None)
        if code_verifier:
            session['code_verifier'] = code_verifier
            OAUTH_STATE_STORE[state] = code_verifier
        return redirect(authorization_url)
    except Exception as e:
        return f"Error starting OAuth flow: {str(e)}"

@app.route('/oauth2callback')
def oauth2callback():
    try:
        state = request.args.get('state') or session.get('state')
        code_verifier = session.get('code_verifier') or (OAUTH_STATE_STORE.pop(state, None) if state else None)
        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            state=state,
            redirect_uri=url_for('oauth2callback', _external=True)
        )
        authorization_response = request.url
        fetch_kwargs = {'authorization_response': authorization_response}
        if code_verifier:
            flow.code_verifier = code_verifier
            fetch_kwargs['code_verifier'] = code_verifier

        flow.fetch_token(**fetch_kwargs)
        credentials = flow.credentials

        creds_data = {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes
        }
        with open('token.json', 'w') as token_file:
            json.dump(creds_data, token_file)

        return "Authentication successful! Tokens saved to token.json."
    except Exception as e:
        return f"Error in OAuth callback: {str(e)}"

if __name__ == '__main__':
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
    app.run(debug=True, port=5000)
