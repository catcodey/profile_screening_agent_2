import TopQuestions from './TopQuestions'

export default function StandaloneQuestionsPanel({ data }) {
  if (!data) return null

  return (
    <div className="results-wrap">
      <div className="score-card standalone-card">
        <div className="standalone-meta">
          <span className="badge badge-standalone">Role-based questions — no profile evaluated</span>
          <h2 className="score-candidate">{data.role}</h2>
          <p className="score-role">calibrated for <strong>{data.experience_range}</strong> of experience</p>
        </div>
      </div>

      <TopQuestions questions={data.questions} title={`${data.questions.length} screening questions for this role`} />

      <p className="disclaimer">
        These are general screening questions for the role and experience range selected — no
        candidate profile was analyzed to produce them.
      </p>
    </div>
  )
}
