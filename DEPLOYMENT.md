# TRAIT ADVOCATE PRO AI — DEPLOYMENT GUIDE

This guide provides step-by-step instructions for deploying TRAIT Advocate Pro AI to production environments.

---

## 1. ARCHITECTURE OVERVIEW

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS (Vercel-compatible SPA).
- **Backend**: Monolithic FastAPI server with Uvicorn.
- **Database**: PostgreSQL (Fully tested and compatible with Neon serverless PostgreSQL).
- **Document Processing**: PyMuPDF / pypdf text extraction and python-docx generation.
- **AI Integration**: Configurable Google Gemini / OpenAI with built-in Indian legal jurisprudence fallback engine.

---

## 2. DATABASE PROVISIONING (NEON POSTGRESQL)

1. Sign up / log in to [Neon Console](https://neon.tech).
2. Create a new PostgreSQL database (e.g., `trait_advocate_pro_prod`).
3. Copy the pooled connection string:
   ```text
   postgresql://[user]:[password]@[endpoint].us-east-2.aws.neon.tech/trait_advocate_pro_prod?sslmode=require
   ```
4. Provide this as `DATABASE_URL` in the backend environment.

---

## 3. BACKEND DEPLOYMENT (RENDER / RAILWAY / LINUX VM)

### Option A: Render.com
1. Create a new **Web Service**.
2. Connect your repository and set Root Directory to `backend`.
3. Set **Build Command**:
   ```bash
   pip install -r requirements.txt
   ```
4. Set **Start Command**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
5. Add Environment Variables:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `SECRET_KEY`: A high-entropy random string (e.g. 64 characters).
   - `GEMINI_API_KEY`: (Optional) Your Gemini API Key.
   - `OPENAI_API_KEY`: (Optional) Your OpenAI API Key.
6. Verify Health Check Endpoint:
   ```bash
   curl https://your-backend.onrender.com/health
   ```

### Option B: Linux VPS / Docker
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## 4. FRONTEND DEPLOYMENT (VERCEL)

1. Sign in to [Vercel](https://vercel.com).
2. Import repository and set **Root Directory** to `frontend`.
3. Build Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Environment Variables:
   - `VITE_API_URL`: `https://your-backend-domain.com/api/v1`
5. Single-Page Application (SPA) routing is handled automatically by the included `vercel.json` rewrites.

---

## 5. PERSISTENT STORAGE FOR PRODUCTION

- In local development, files are stored in `backend/uploads/`.
- For multi-instance cloud deployments (Render, Heroku, AWS ECS), replace the local disk storage handler in `app/services/document_service.py` with AWS S3 / Cloudflare R2 / Supabase Storage using boto3.

---

## 6. VERIFICATION CHECKLIST

- [ ] Health endpoint returns 200 OK at `/health`.
- [ ] Database tables are auto-created on startup.
- [ ] User registration and JWT authentication succeed.
- [ ] Clients and Cases can be created and persisted.
- [ ] Document uploading and text extraction complete.
- [ ] Legal drafts can be generated and downloaded as `.docx`.
