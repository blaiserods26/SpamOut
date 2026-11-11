# SpamOut

An automated email security analysis platform that inspects suspicious forwarded emails and provides on-demand Gmail inbox threat assessment.

## Language

**Security Score**:
A normalized rating from 0 to 100 representing the overall threat profile of an email, mapped to a category (Secure, Warning, Critical).
_Avoid_: Spam score, safety rating, phishing level

**Analysis Report**:
The structured evaluation returned to the user detailing email authentication (SPF, DKIM, DMARC), URL phishing risks, and attachment virus scans.
_Avoid_: Scan result, audit log, diagnosis

**Email Daemon**:
The background service continuously polling an IMAP mailbox for forwarded suspicious emails, processing them, and sending back HTML analysis reports.
_Avoid_: Mail bot, inbox listener, cron worker

**Web Dashboard**:
The Next.js user interface enabling users to connect their Google account via OAuth and scan their mailbox on demand.
_Avoid_: Frontend app, admin panel, web client

**Scanner Engine**:
The shared core analysis library that evaluates authentication headers, scans links, and submits attachments to VirusTotal.
_Avoid_: Detector, filter, checker
