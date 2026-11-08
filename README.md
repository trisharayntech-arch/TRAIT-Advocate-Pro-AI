# TRAIT Advocate Pro AI

> **Autonomous AI-Powered Legal Practice Workspace for Advocates, Law Firms & Legal Consultants**  
> Tailored for Indian Jurisprudence (Supreme Court, High Courts, IPC/BNS, CrPC/BNSS, CPC, Commercial Courts Act)

---

## 🏛️ OVERVIEW

**TRAIT Advocate Pro AI** is a commercial-grade legal SaaS platform built with:
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, React Router.
- **Backend**: Python 3.11, FastAPI, SQLAlchemy, Pydantic v2, JWT authentication.
- **Database**: PostgreSQL (Neon-compatible) with SQLite development fallback.
- **AI Processing**: Configurable Gemini & OpenAI providers with an automated Indian Statutory Jurisprudence fallback engine.
- **Legal Document Intelligence**: PyMuPDF / pypdf text extraction, paragraph chunking (RAG), and formatted `.docx` generation.

---

## 🎨 DESIGN PALETTE

- **Midnight Navy**: `#101A2C`
- **Electric Blue**: `#2563EB`
- **Background**: `#F5F7FB`
- **Text Main**: `#172033`
- **Muted Text**: `#8290A5`
- **Card Background**: `#FFFFFF`

---

## ⚡ QUICK START (LOCAL RUN)

### 1. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate   # Windows
# source venv/bin/activate # Linux / macOS

# Install dependencies
pip install -r requirements.txt

# Seed demonstration chamber with authentic sample data
python -m app.seed

# Start FastAPI server on http://localhost:8000
uvicorn app.main:app --reload --port 8000
```
- Interactive API Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### 2. Frontend Setup
```bash
cd frontend

# Install packages
npm install

# Run Vite dev server on http://localhost:5173
npm run dev
```

### 3. Demo Credentials
Click **"Fill Demo Login"** on the login page or use:
- **Email**: `advocate.sharma@traitlaw.in`
- **Password**: `Advocate@2026`

---

## 🧪 TESTING & VERIFICATION

### Run Backend Pytest Suite
```bash
cd backend
.\venv\Scripts\pytest -v
```
All 8 automated test suites verify health, registration, login, client CRUD, case management, document upload, draft generation, full 12-step integration workflow, and multi-user data isolation.

### Run Frontend Production Build
```bash
cd frontend
npm run build
```

---

## 📂 CORE MODULES

1. **Authentication**: Real JWT authentication with bcrypt password hashing and user profiles.
2. **Dashboard**: Real statistics (total clients, active/closed cases, upcoming hearings, recent chamber activity).
3. **Clients**: Litigant registry with contact details, address, confidential notes, and instant search.
4. **Cases**: Docket registry tracking court names (Supreme Court, High Courts, District Courts), case numbers, hearing dates, and status.
5. **Documents & RAG**: Upload PDF, DOCX, TXT files; automatic text extraction, chunking, preview drawer, and downloads.
6. **AI Legal Assistant**: Multi-turn legal chat grounded on uploaded case files or Indian jurisprudence.
7. **Legal Drafting Studio**: AI-assisted generation for Legal Notices (Sec 138 NI Act, dues, eviction), Affidavits, Agreements, and Applications with formatted `.docx` export.
8. **Legal Research**: Structured statutory propositions, judicial ratios (SC/HC precedents), and bookmarking.
9. **Global Search**: Unified multi-table search across all clients, cases, documents, drafts, and research.
10. **Notifications**: In-app hearing reminders and document processing updates.
11. **Settings**: Profile updates, password changes, and system architecture status.

---

## 🚀 DEPLOYMENT

See [DEPLOYMENT.md](file:///C:/TRAIT%20Innovation%20Projects/TRAIT-Advocate-Pro-AI/DEPLOYMENT.md) for full instructions on deploying the frontend to **Vercel** and the backend to **Render / Railway / Linux VPS** connected to a **Neon PostgreSQL** database.
