import logging

from fastapi import FastAPI, File, UploadFile, Form, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import get_settings
from models.schemas import EvaluationResult
from services.file_parser import validate_extension, extract_text
from services.guardrails import sanitize_role, validate_and_clean_text, sanitize_experience_range, EXPERIENCE_RANGES
from services.llm_service import evaluate_profile, generate_standalone_questions

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("profile_evaluator")

settings = get_settings()
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Profile Evaluator API",
    description="Evaluates candidate profiles against a target role using an LLM.",
    version="1.0.0",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

COMMON_ROLES = [
    "Software Engineer",
    "Senior Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Java Developer",
    "Junior AI Engineer",
    "Snowflake and DBT Developer",
    "Data Engineer",
    "Full Stack Developer",
    "Data Scientist",
    "Data Analyst",
    "Machine Learning Engineer",
    "DevOps Engineer",
    "Product Manager",
    "UI/UX Designer",
    "QA Engineer",
    "Business Analyst",
    "HR Manager",
    "Sales Executive",
    "Marketing Manager",
    "Cloud Architect",
    "Cybersecurity Analyst"
    
]


@app.get("/api/health")
def health():
    return {"status": "ok", "model": settings.groq_model, "groq_key_configured": bool(settings.groq_api_key)}


@app.get("/api/roles")
def get_roles():
    """Suggested roles for the dropdown. The frontend still allows free typing."""
    return {"roles": COMMON_ROLES}


@app.get("/api/experience-ranges")
def get_experience_ranges():
    """Fixed experience-range options for the standalone question generator dropdown."""
    return {"experience_ranges": EXPERIENCE_RANGES}


@app.post("/api/evaluate", response_model=EvaluationResult)
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def evaluate(
    request: Request,
    role: str = Form(...),
    file: UploadFile = File(...),
):
    # --- Guardrail: role input ---
    clean_role = sanitize_role(role)

    # --- Guardrail: file presence / type ---
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file was uploaded.")
    ext = validate_extension(file.filename)

    # --- Guardrail: file size ---
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")
    if len(file_bytes) > settings.max_upload_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File is too large. Maximum allowed size is {settings.max_upload_mb} MB.",
        )

    # --- Extract + sanitise text ---
    raw_text = extract_text(file_bytes, ext)
    clean_text = validate_and_clean_text(raw_text)

    # --- Evaluate via LLM ---
    logger.info("Evaluating profile for role='%s' (%d chars)", clean_role, len(clean_text))
    result = evaluate_profile(clean_role, clean_text)
    return result


@app.post("/api/generate-questions")
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def generate_questions(
    request: Request,
    role: str = Form(...),
    experience_range: str = Form(...),
):
    """
    Standalone question generator — no file, no score. Always available.
    Used when the recruiter wants role-based screening questions calibrated to
    a manually chosen experience range, independent of any specific candidate.
    """
    clean_role = sanitize_role(role)
    clean_experience_range = sanitize_experience_range(experience_range)

    logger.info(
        "Generating standalone questions for role='%s', experience='%s'",
        clean_role,
        clean_experience_range,
    )
    questions = generate_standalone_questions(clean_role, clean_experience_range)
    return {
        "role": clean_role,
        "experience_range": clean_experience_range,
        "questions": questions,
    }


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error")
    return JSONResponse(status_code=500, content={"detail": "An unexpected server error occurred."})
