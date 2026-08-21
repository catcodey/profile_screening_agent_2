const VERDICT_META = {
  SELECTED: { label: 'Selected for further questioning', color: 'var(--c-select)', cls: 'badge-select' },
  BORDERLINE: { label: 'Borderline — manual review recommended', color: 'var(--c-warn)', cls: 'badge-border' },
  REJECTED: { label: 'Rejected', color: 'var(--c-reject)', cls: 'badge-reject' },
}

export default function ScoreDisplay({ result }) {
  const { score, verdict, candidate_name, role, summary } = result
  const meta = VERDICT_META[verdict] || VERDICT_META.BORDERLINE

  const radius = 80
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference

  return (
    <div className="score-card">
      <div className="gauge-wrap">
        <svg width="200" height="200" viewBox="0 0 200 200" className="gauge-svg">
          <circle cx="100" cy="100" r={radius} className="gauge-track" strokeWidth="14" fill="none" />
          <circle
            cx="100"
            cy="100"
            r={radius}
            strokeWidth="14"
            fill="none"
            stroke={meta.color}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 100 100)"
            className="gauge-fill"
          />
        </svg>
        <div className="gauge-center">
          <span className="gauge-score">{score}</span>
          <span className="gauge-max">/ 100</span>
        </div>
      </div>

      <div className="score-meta">
        <span className={`badge ${meta.cls}`}>{meta.label}</span>
        <h2 className="score-candidate">{candidate_name}</h2>
        <p className="score-role">evaluated for <strong>{role}</strong></p>
        <p className="score-summary">{summary}</p>
      </div>
    </div>
  )
}
