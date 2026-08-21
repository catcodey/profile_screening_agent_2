# Profile Evaluator

An AI agent that screens candidate profiles against a job role, using Groq-hosted
LLMs for fast inference. Select or type a role, upload a resume/profile
(PDF/DOCX/TXT), and get back:

- A **fit score** (0–100) with a visual gauge
- **≥ 70** → marked *Selected*, with **10 tailored interview questions**
- **< 30** → marked *Rejected*, with a **gap analysis** (what's missing, and how severe)
- **30–69** → marked *Borderline*, flagged for manual review, with a lighter version of both

```
profile-evaluator/
├── backend/                  FastAPI + Groq
│   ├── main.py                API routes, CORS, rate limiting, error handling
│   ├── config.py               env-driven settings (thresholds, limits, model)
│   ├── models/schemas.py       Pydantic request/response contracts
│   ├── services/
│   │   ├── file_parser.py      PDF / DOCX / TXT text extraction
│   │   ├── guardrails.py       input validation + prompt-injection defenses
│   │   └── llm_service.py      Groq call, strict-JSON parsing, business rules
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/                 React + Vite
    ├── src/
    │   ├── App.jsx             page layout & state
    │   ├── App.css / index.css design system
    │   ├── components/         RoleSelector, FileUpload, ScoreDisplay,
    │   │                       GapAnalysis, TopQuestions, ResultsPanel
    │   └── api/api.js          backend client
    ├── package.json
    └── .env.example
```

## Quick start

**1. Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # add your GROQ_API_KEY
uvicorn main:app --reload --port 8000
```

**2. Frontend** (new terminal)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## Guardrails built in

- File type/size allow-listing (client + server side)
- Minimum readable-text check (rejects scanned/blank/garbage uploads)
- Prompt-injection detection in resume text, neutralised before reaching the model
- Resume text sent to the LLM as clearly delimited data, never merged into instructions
- Explicit bias guardrail: model instructed to ignore protected attributes
- Forced strict-JSON model output, validated against a Pydantic schema, with one retry on malformed responses
- Score bands (select/borderline/reject) enforced in backend code — the model cannot argue its way around policy
- Per-IP rate limiting
- Centralized error handling — no stack traces ever reach the client
- Every result carries a visible "AI-assisted, not a final decision" disclaimer

## Notes / things you may want to extend

- Add authentication (e.g. an internal SSO) before deploying beyond local use.
- Swap the in-memory rate limiter for Redis if you deploy multiple backend instances.
- Add a persistence layer (Postgres) if you want to store evaluation history.
- Consider OCR (e.g. `pytesseract`) if candidates commonly submit scanned/image PDFs.
