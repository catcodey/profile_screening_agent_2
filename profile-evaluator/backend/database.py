"""
Lightweight SQLite persistence for evaluation history — powers the Dashboard
and Analytics tabs. Uses the stdlib `sqlite3` module directly, no ORM, to stay
consistent with the rest of this project's "no framework" approach.

Every write here is meant to be best-effort: a database failure should never
break the actual evaluation response the user is waiting on. Callers wrap
insert_evaluation() in try/except accordingly.
"""
import json
import logging
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger("profile_evaluator")

DB_PATH = Path(__file__).parent / "data" / "profile_evaluator.db"


def init_db() -> None:
    """Create the database file/table if they don't exist yet. Safe to call
    every time the app starts — CREATE TABLE IF NOT EXISTS is idempotent."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS evaluations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                candidate_name TEXT,
                role TEXT NOT NULL,
                score REAL NOT NULL,
                verdict TEXT NOT NULL,
                summary TEXT,
                skills_considered TEXT,
                gap_analysis_json TEXT,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.commit()
    logger.info("SQLite database ready at %s", DB_PATH)


@contextmanager
def _connect():
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def insert_evaluation(
    candidate_name: str,
    role: str,
    score: float,
    verdict: str,
    summary: str,
    skills_considered: Optional[str] = None,
    gap_analysis: Optional[List[Dict[str, Any]]] = None,
) -> None:
    """Logs one completed evaluation. Called after every /api/evaluate request."""
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO evaluations
                (candidate_name, role, score, verdict, summary, skills_considered, gap_analysis_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                candidate_name,
                role,
                score,
                verdict,
                summary,
                skills_considered,
                json.dumps(gap_analysis) if gap_analysis else None,
                datetime.now(timezone.utc).isoformat(),
            ),
        )
        conn.commit()


def get_stats() -> Dict[str, Any]:
    """Summary counts for the Dashboard tab's top cards."""
    with _connect() as conn:
        rows = conn.execute(
            "SELECT verdict, COUNT(*) as cnt FROM evaluations GROUP BY verdict"
        ).fetchall()

    counts = {"SELECTED": 0, "BORDERLINE": 0, "REJECTED": 0}
    for row in rows:
        if row["verdict"] in counts:
            counts[row["verdict"]] = row["cnt"]

    total = sum(counts.values())
    return {
        "total_evaluated": total,
        "selected": counts["SELECTED"],
        "borderline": counts["BORDERLINE"],
        "rejected": counts["REJECTED"],
        # Aliases matching the exact terms requested for the summary table:
        # "matching JD" = SELECTED, "not matching JD" = everything that didn't clear the bar.
        "matching": counts["SELECTED"],
        "not_matching": counts["BORDERLINE"] + counts["REJECTED"],
    }


def get_evaluations(limit: int = 200) -> List[Dict[str, Any]]:
    """Detailed row-level history for the Dashboard tab's detailed view table."""
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT id, candidate_name, role, score, verdict, summary,
                   skills_considered, gap_analysis_json, created_at
            FROM evaluations
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()

    results = []
    for row in rows:
        record = dict(row)
        raw_gaps = record.pop("gap_analysis_json")
        record["gap_analysis"] = json.loads(raw_gaps) if raw_gaps else []
        results.append(record)
    return results


def get_role_distribution() -> List[Dict[str, Any]]:
    """Retrieves selected/rejected counts and average score per role for the analytics tab."""
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT 
                role, 
                COUNT(*) as count,
                AVG(score) as avg_score,
                SUM(CASE WHEN verdict = 'SELECTED' THEN 1 ELSE 0 END) as selected,
                SUM(CASE WHEN verdict = 'REJECTED' THEN 1 ELSE 0 END) as rejected
            FROM evaluations
            GROUP BY role
            ORDER BY count DESC
            """
        ).fetchall()
    return [
        {
            "role": r["role"],
            "count": r["count"],
            "avg_score": round(r["avg_score"], 1) if r["avg_score"] is not None else 0.0,
            "selected": r["selected"] or 0,
            "rejected": r["rejected"] or 0,
        }
        for r in rows
    ]