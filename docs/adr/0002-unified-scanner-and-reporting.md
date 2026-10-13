# 2. Unified Scanner Engine and Self-Contained Reporting

We decided to build a shared `backend/core/scanner.py` engine that produces a standardized, JSON-serializable `AnalysisReport` data structure used by both the background IMAP daemon and the Flask REST API. Furthermore, email analysis reports are made entirely self-contained by embedding attachment scan results directly into the HTML email template, removing external dependencies on GitHub Pages or local Git automation scripts.

### Considered Options
- External GitHub Pages deployment for attachment reports (`conn.py`): Rejected because it relied on hardcoded local machine paths and synchronous `git push` operations that fail without git credentials and add latency.
- Separate scanning routines for Daemon and Web API: Rejected because it resulted in inconsistent scoring formulas and duplicate DNS/VirusTotal queries.
- Monolithic root environment file: Rejected in favor of scoped `backend/.env` and `frontend/.env.local` to prevent leaking private backend secrets into the Next.js client bundle.

### Consequences
- Both the daemon and the web API will produce identical scoring metrics and recommendations for any given email.
- The daemon no longer requires external git publishing permissions or secondary hosting to deliver attachment scan findings.
- Secrets are scoped cleanly between backend and client-facing layers.
