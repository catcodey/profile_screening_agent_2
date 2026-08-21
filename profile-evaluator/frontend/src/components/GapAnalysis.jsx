const SEVERITY_LABEL = { high: 'High impact', medium: 'Medium impact', low: 'Low impact' }

export default function GapAnalysis({ gaps }) {
  if (!gaps || gaps.length === 0) return null

  return (
    <section className="panel">
      <h3 className="panel-title">
        <span className="panel-eyebrow">Gap analysis</span>
        Why this profile fell short
      </h3>
      <ul className="gap-list">
        {gaps.map((g, i) => (
          <li key={i} className={`gap-item sev-${g.severity}`}>
            <div className="gap-item-head">
              <span className="gap-area">{g.area}</span>
              <span className={`sev-tag sev-tag-${g.severity}`}>{SEVERITY_LABEL[g.severity] || g.severity}</span>
            </div>
            <p className="gap-detail">{g.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
