from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
import os
import json
from flask import Flask, request, redirect, session, url_for, jsonify

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'spamout-oauth-secret-dev')

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
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
            include_granted_scopes='true'
        )
        session['state'] = state
        return redirect(authorization_url)
    except Exception as e:
        return f"Error starting OAuth flow: {str(e)}"

@app.route('/oauth2callback')
def oauth2callback():
    try:
        state = session['state']
        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            state=state,
            redirect_uri=url_for('oauth2callback', _external=True)
        )
        authorization_response = request.url
        flow.fetch_token(authorization_response=authorization_response)
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
