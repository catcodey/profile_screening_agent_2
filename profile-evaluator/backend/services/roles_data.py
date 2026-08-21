"""
Loads the predefined role -> skills/weights dataset and resolves whatever
role string the user selected/typed to an entry in it.

Since the frontend allows free-typing a role that isn't in the dropdown, we
can't assume every request maps to a dataset entry. Rather than silently
guessing, we fall back to a clearly-flagged generic profile so the frontend
(and the person reading the result) knows this role wasn't scored against a
predefined skill list.
"""
import json
import logging
from pathlib import Path
from typing import Optional, TypedDict

logger = logging.getLogger("profile_evaluator")

DATA_PATH = Path(__file__).parent.parent / "data" / "roles.json"

DEFAULT_WEIGHTS = {"skills": 0.45, "experience": 0.35, "education": 0.1, "achievements": 0.1}


class RoleCriteria(TypedDict):
    role_name: str
    required_skills: list
    preferred_skills: list
    min_experience_years: int
    weights: dict
    is_predefined: bool


def _load_dataset() -> dict:
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        logger.warning("roles.json not found at %s — falling back to generic criteria for all roles", DATA_PATH)
        return {}
    except json.JSONDecodeError as exc:
        logger.error("roles.json is malformed: %s — falling back to generic criteria for all roles", exc)
        return {}


_ROLES_DATASET = _load_dataset()


def list_roles() -> list:
    return sorted(_ROLES_DATASET.keys())


def get_role_criteria(role_name: str) -> RoleCriteria:
    """Case-insensitive exact match against the dataset; falls back to a
    generic (non-predefined) profile if the typed role isn't in it."""
    normalized = role_name.strip().lower()
    for key, entry in _ROLES_DATASET.items():
        if key.strip().lower() == normalized:
            return RoleCriteria(
                role_name=key,
                required_skills=entry.get("required_skills", []),
                preferred_skills=entry.get("preferred_skills", []),
                min_experience_years=entry.get("min_experience_years", 0),
                weights=entry.get("weights", DEFAULT_WEIGHTS),
                is_predefined=True,
            )

    logger.info("Role '%s' not found in predefined dataset — using generic fallback criteria", role_name)
    return RoleCriteria(
        role_name=role_name,
        required_skills=[],
        preferred_skills=[],
        min_experience_years=0,
        weights=DEFAULT_WEIGHTS,
        is_predefined=False,
    )
