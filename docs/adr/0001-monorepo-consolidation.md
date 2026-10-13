# 1. Monorepo Consolidation and Modular Architecture

We decided to consolidate both `HackSphere_CodeBreakers` and `SpamOut` into a single modular monorepo hosted in `HackSphere_CodeBreakers` (preserving full Git commit history across all services). The codebase is structured into `frontend/` (Next.js dashboard) and `backend/` (with a shared `core/` scanner engine, an IMAP `daemon/`, a Flask `api/`, and `ml/`).

### Considered Options
- Maintaining separate repositories: Rejected because core scanning logic diverged and changes had to be duplicated across repositories.
- Consolidating into `SpamOut`: Rejected because `HackSphere_CodeBreakers` held the complete commit history for the web dashboard, OAuth integration, and ML models.
- Flat directory structure: Rejected because mixing the IMAP daemon scripts with Flask REST endpoints and ML utilities introduced dependency confusion and unmaintainable coupling.

### Consequences
- Scanning logic will be centralized into a reusable `backend/core/` package, eliminating discrepancies between forwarded email reports and web dashboard scans.
- Legacy duplicates (`email-guard/`, redundant copy scripts) are pruned.
- All secrets (email credentials, Google OAuth, VirusTotal API keys) are extracted to `.env` configurations.
