import ScoreDisplay from './ScoreDisplay'
import GapAnalysis from './GapAnalysis'
import TopQuestions from './TopQuestions'

export default function ResultsPanel({ result }) {
  if (!result) return null

  return (
    <div className="results-wrap">
      <ScoreDisplay result={result} />

      {result.strengths?.length > 0 && (
        <section className="panel">
          <h3 className="panel-title">
            <span className="panel-eyebrow">Highlights</span>
            Key strengths identified
          </h3>
          <ul className="strengths-list">
            {result.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
      )}

      <GapAnalysis gaps={result.gap_analysis} />
      <TopQuestions questions={result.top_questions} />

      <p className="disclaimer">{result.disclaimer}</p>
    </div>
  )
}
