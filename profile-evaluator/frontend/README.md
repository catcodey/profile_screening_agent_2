# Profile Evaluator — Frontend (React + Vite)

## Setup

```bash
cd frontend
npm install
cp .env.example .env   # edit if your backend runs somewhere other than localhost:8000
```

## Run

```bash
npm run dev
```

App will be live at `http://localhost:5173`. Make sure the backend is running first (see `../backend/README.md`).

## What's inside

- `src/components/RoleSelector.jsx` — editable dropdown (select from list **or** type a custom role)
- `src/components/FileUpload.jsx` — drag-and-drop upload with client-side type/size validation
- `src/components/ScoreDisplay.jsx` — circular score gauge + verdict badge
- `src/components/GapAnalysis.jsx` — shown when score < 70
- `src/components/TopQuestions.jsx` — shown when score ≥ 70
- `src/components/ResultsPanel.jsx` — composes strengths + gap analysis + questions
- `src/api/api.js` — thin axios wrapper around the FastAPI backend
