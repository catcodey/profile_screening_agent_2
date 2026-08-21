# Profile Evaluator — Backend (FastAPI + Groq)

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# then edit .env and paste your GROQ_API_KEY (free at https://console.groq.com/keys)
```

## Run

```bash
uvicorn main:app --reload --port 8000
```

API will be live at `http://localhost:8000`. Interactive docs: `http://localhost:8000/docs`

## Endpoints

| Method | Path            | Description                                   |
|--------|-----------------|------------------------------------------------|
| GET    | `/api/health`   | Health check / config check                    |
| GET    | `/api/roles`    | Suggested roles for the dropdown                |
| POST   | `/api/evaluate` | multipart form: `role` (text) + `file` (pdf/docx/txt) |

## Guardrails implemented

- File type allow-list (PDF / DOCX / TXT only)
- File size cap (default 5MB, configurable)
- Minimum extracted-text length check (rejects empty/scanned/garbage files)
- Prompt-injection detection & neutralisation on extracted resume text
- Resume text is sent to the LLM as clearly delimited **data**, never merged into instructions
- Forced strict JSON output + Pydantic schema validation, with one automatic retry on malformed output
- Score bands are decided in backend code (not by the model) so results can't be talked out of policy
- Per-IP rate limiting (default 10 requests/minute, configurable)
- Explicit instruction to the model to ignore protected-attribute bias signals
- Centralised error handling — no raw stack traces ever returned to the client
