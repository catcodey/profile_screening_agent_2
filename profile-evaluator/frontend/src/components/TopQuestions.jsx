export default function TopQuestions({ questions, title }) {
  if (!questions || questions.length === 0) return null

  return (
    <section className="panel">
      <h3 className="panel-title">
        <span className="panel-eyebrow">Questions</span>
        {title || `Top ${questions.length} questions for this candidate`}
      </h3>
      <ol className="question-list">
        {questions.map((q, i) => (
          <li key={i} className="question-item">
            <span className="question-index">{String(i + 1).padStart(2, '0')}</span>
            <span className="question-text">{q}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
