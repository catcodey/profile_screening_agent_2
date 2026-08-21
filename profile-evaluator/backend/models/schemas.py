from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class Verdict(str, Enum):
    SELECTED = "SELECTED"
    REJECTED = "REJECTED"
    BORDERLINE = "BORDERLINE"


class GapItem(BaseModel):
    area: str = Field(..., description="The skill/experience area that is lacking")
    detail: str = Field(..., description="Explanation of the gap")
    severity: str = Field(..., description="high | medium | low")


class CriterionScore(BaseModel):
    criterion: str = Field(..., description="skills | experience | education | achievements")
    weight: float = Field(..., ge=0, le=1)
    raw_score: float = Field(..., ge=0, le=100, description="Model's 0-100 score for this criterion alone")
    weighted_contribution: float = Field(..., ge=0, le=100, description="raw_score * weight")


class EvaluationResult(BaseModel):
    role: str
    candidate_name: Optional[str] = "Not detected"
    score: float = Field(..., ge=0, le=100)
    score_breakdown: List[CriterionScore] = Field(default_factory=list)
    is_predefined_role: bool = Field(
        default=True,
        description="False if the typed role wasn't found in the predefined skills dataset "
        "(criteria were inferred generically instead).",
    )
    verdict: Verdict
    summary: str
    strengths: List[str] = Field(default_factory=list)
    gap_analysis: List[GapItem] = Field(default_factory=list)
    top_questions: List[str] = Field(default_factory=list)
    flagged_for_review: bool = False
    disclaimer: str = (
        "This is an AI-generated assessment intended to assist, not replace, "
        "human judgment. Please verify before making final decisions."
    )

    @field_validator("top_questions")
    @classmethod
    def cap_questions(cls, v: List[str]) -> List[str]:
        return v[:10]


class EvaluationError(BaseModel):
    detail: str
