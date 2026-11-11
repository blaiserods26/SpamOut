# 🛡️ SpamOut

**SpamOut** is an automated email security platform providing both proactive email threat scanning via inbox forwarding and an interactive web dashboard for real-time Gmail mailbox inspection.

---

## 🏗️ Architecture Overview

The system is organized as a modular monorepo:

```text
SpamOut/
├── frontend/                     # Next.js 15 Web Dashboard
│   ├── src/                      # App router, Tailwind UI, Gmail dashboard clone
│   ├── .env.local.example        # Next.js environment template
│   └── package.json
├── backend/                      # Python Security Services
│   ├── core/                     # Shared security analysis engine
│   │   ├── __init__.py
│   │   └── scanner.py            # SPF/DKIM/DMARC, URL phishing & VirusTotal scanning
│   ├── daemon/                   # Background email listener
│   │   ├── email_sec.py          # IMAP listener that auto-replies with HTML reports
│   │   └── templates/            # Responsive HTML email templates
│   │       └── report.html
│   ├── api/                      # Flask REST API & Google OAuth
│   │   ├── server.py             # Endpoints: /analyze_emails, /emails, /scan
│   │   └── oauth_setup.py
│   ├── ml/                       # Machine Learning Phishing Classifier
│   │   ├── run_model.py          # RoBERTa sequence classification pipeline
│   │   └── README.md
│   ├── .env.example              # Backend environment template
│   └── requirements.txt          # Unified Python dependencies
├── docs/                         # Architecture Decision Records (ADRs)
│   └── adr/
│       ├── 0001-monorepo-consolidation.md
│       └── 0002-unified-scanner-and-reporting.md
├── CONTEXT.md                    # Project domain glossary
└── README.md
```

---

## 🚀 Quick Start

### 1. Backend Setup

1. **Create and activate a Python virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Linux/macOS:
   source venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
   * `EMAIL_ACCOUNT` & `EMAIL_PASSWORD`: Gmail account & App Password used by the daemon.
   * `VT_API_KEY`: VirusTotal API key for attachment file checks.
   * `FLASK_SECRET_KEY`: Random secret string for session cookies.

4. **Run the Services**:
   * **Run the automated email forwarding daemon**:
     ```bash
     python daemon/email_sec.py
     ```
   * **Run the Flask Web API**:
     ```bash
     python api/server.py
     ```

---

### 2. Frontend Setup

1. **Install Node dependencies**:
   ```bash
   cd frontend
   npm install
   # or bun install / yarn
   ```

2. **Configure Environment Variables**:
   Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
   Provide your Google OAuth Client ID and Secret if using Google sign-in.

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Access the dashboard at `http://localhost:3000`.

---

## 🔍 How It Works

1. **Email Forwarding Workflow (Daemon)**:
   * A user encounters a suspicious email and forwards it to the configured support inbox (`EMAIL_ACCOUNT`).
   * The `daemon/email_sec.py` service polls IMAP for unread forwarded messages.
   * `core/scanner.py` validates DNS records (SPF, DKIM, DMARC), detects misleading URLs/IP hosts, and checks attachment hashes with VirusTotal.
   * A responsive, color-coded HTML analysis report is returned directly to the user's inbox within seconds.

2. **Web Dashboard Workflow (API + Frontend)**:
   * A user logs into the Next.js web application and connects their Gmail account via OAuth 2.0.
   * The Flask API fetches recent messages and processes them through `core/scanner.py`.
   * The frontend displays an interactive inbox dashboard highlighting threat levels and detailed security breakdowns.

---

## 📚 Documentation
* [CONTEXT.md](CONTEXT.md): Standardized domain terminology and definitions.
* [ADR 0001: Monorepo Consolidation](docs/adr/0001-monorepo-consolidation.md)
* [ADR 0002: Unified Scanner and Reporting](docs/adr/0002-unified-scanner-and-reporting.md)
