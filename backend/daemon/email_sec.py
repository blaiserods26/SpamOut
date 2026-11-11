import os
import sys
import time
import email
import imaplib
import smtplib
from email import policy
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from jinja2 import Environment, FileSystemLoader
from dotenv import load_dotenv

# Ensure parent directory is in Python path to import core
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

from core.scanner import EmailSecurityScanner

# Load environment configuration
load_dotenv(dotenv_path=BASE_DIR / ".env")

IMAP_SERVER = os.getenv("IMAP_SERVER", "imap.gmail.com")
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
EMAIL_ACCOUNT = os.getenv("EMAIL_ACCOUNT")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
VT_API_KEY = os.getenv("VT_API_KEY")
CHECK_INTERVAL = int(os.getenv("CHECK_INTERVAL", "10"))

TEMPLATES_DIR = Path(__file__).resolve().parent / "templates"
jinja_env = Environment(loader=FileSystemLoader(str(TEMPLATES_DIR)))

scanner = EmailSecurityScanner(vt_api_key=VT_API_KEY)

def extract_body(msg) -> str:
    """Extract plain text or HTML body from email message."""
    body = ""
    if msg.is_multipart():
        for part in msg.walk():
            ctype = part.get_content_type()
            cdispo = str(part.get("Content-Disposition"))
            if ctype in ["text/html", "text/plain"] and "attachment" not in cdispo:
                try:
                    payload = part.get_payload(decode=True)
                    if payload:
                        body += payload.decode(part.get_content_charset() or "utf-8", errors="replace")
                except Exception:
                    pass
    else:
        try:
            payload = msg.get_payload(decode=True)
            if payload:
                body = payload.decode(msg.get_content_charset() or "utf-8", errors="replace")
        except Exception:
            pass
    return body

def extract_attachments(msg):
    """Extract attachments into bytes and filenames."""
    attachments = []
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_maintype() == 'multipart':
                continue
            filename = part.get_filename()
            if filename:
                payload = part.get_payload(decode=True)
                if payload:
                    attachments.append({
                        "filename": filename,
                        "content": payload
                    })
    return attachments

def send_analysis_report(recipient_email: str, report: dict):
    """Render HTML template and send analysis report back to recipient."""
    try:
        template = jinja_env.get_template("report.html")
        html_content = template.render(report=report)

        plain_text = (
            f"SpamOut Security Analysis Report\n\n"
            f"Sender: {report['email']}\n"
            f"Domain: {report['domain']}\n"
            f"Overall Score: {report['overall_score']}/100 (Grade: {report['overall_grade']})\n"
            f"Status: {report['status_text']}\n\n"
            f"SPF: {report['spf'].get('grade')} | DKIM: {report['dkim'].get('grade')} | DMARC: {report['dmarc'].get('grade')}\n"
            f"Suspicious Links: {len(report['links'].get('suspicious_links', []))}\n"
            f"Attachments Checked: {len(report.get('attachments', {}))}\n"
        )

        msg = MIMEMultipart("alternative")
        msg["From"] = EMAIL_ACCOUNT
        msg["To"] = recipient_email
        msg["Subject"] = f"[{report['status_text'].upper()}] SpamOut Security Analysis: {report['domain']}"

        msg.attach(MIMEText(plain_text, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_ACCOUNT, EMAIL_PASSWORD)
            server.send_message(msg)

        print(f"[+] Security report successfully sent to {recipient_email}")
    except Exception as e:
        print(f"[-] Failed to send analysis report to {recipient_email}: {e}")

def process_inbox():
    """Poll IMAP mailbox for UNSEEN forwarded emails and analyze them."""
    if not EMAIL_ACCOUNT or not EMAIL_PASSWORD:
        print("[-] EMAIL_ACCOUNT or EMAIL_PASSWORD not set in environment. Exiting poll loop.")
        return

    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER)
        mail.login(EMAIL_ACCOUNT, EMAIL_PASSWORD)
        mail.select("INBOX")

        status, messages = mail.search(None, "UNSEEN")
        if status != "OK":
            return

        message_ids = messages[0].split()
        if message_ids:
            print(f"[*] Found {len(message_ids)} new unread email(s) for analysis...")

        for msg_id in message_ids:
            status, data = mail.fetch(msg_id, "(RFC822)")
            if status != "OK":
                continue

            raw_email = data[0][1]
            msg = email.message_from_bytes(raw_email, policy=policy.default)

            forwarder_sender = msg.get("From")
            subject = msg.get("Subject", "(no subject)")
            print(f"[*] Processing email from: {forwarder_sender} | Subject: {subject}")

            body = extract_body(msg)
            attachments = extract_attachments(msg)

            # Analyze email security
            report = scanner.analyze_email(
                sender=forwarder_sender,
                body=body,
                attachments=attachments
            )

            # Reply to the user who submitted the email
            send_analysis_report(forwarder_sender, report)

            # Mark email as read/seen
            mail.store(msg_id, "+FLAGS", "\\Seen")

        mail.logout()
    except Exception as e:
        print(f"[-] IMAP error during inbox polling: {e}")

def run_daemon():
    """Continuously monitor inbox at set interval."""
    print("=" * 60)
    print(" SpamOut Automated Email Daemon Started")
    print(f" Account: {EMAIL_ACCOUNT or '(not configured)'}")
    print(f" Polling Interval: {CHECK_INTERVAL}s")
    print("=" * 60)

    while True:
        process_inbox()
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    run_daemon()
