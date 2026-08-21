import { useEffect, useState } from 'react'
import RoleSelector from './components/RoleSelector'
import FileUpload from './components/FileUpload'
import ExperienceSelector from './components/ExperienceSelector'
import ResultsPanel from './components/ResultsPanel'
import StandaloneQuestionsPanel from './components/StandaloneQuestionsPanel'
import { fetchRoles, fetchExperienceRanges, evaluateProfile, generateQuestions } from './api/api'
import './App.css'

const FALLBACK_ROLES = [
  'Software Engineer',
  'Data Scientist',
  'Product Manager',
  'UI/UX Designer',
  'DevOps Engineer',
]

const FALLBACK_EXPERIENCE_RANGES = ['0-2 years', '2-5 years', '5-8 years', '8+ years']

export default function App() {
  const [roles, setRoles] = useState(FALLBACK_ROLES)
  const [role, setRole] = useState('')
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState(null)

  const [experienceRanges, setExperienceRanges] = useState(FALLBACK_EXPERIENCE_RANGES)
  const [experienceRange, setExperienceRange] = useState('')

  // 'eval' -> full scored evaluation result, 'questions' -> standalone questions-only result
  const [mode, setMode] = useState(null)
  const [result, setResult] = useState(null)
  const [questionsData, setQuestionsData] = useState(null)

  const [evalLoading, setEvalLoading] = useState(false)
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [apiError, setApiError] = useState(null)

  const loading = evalLoading || questionsLoading

  useEffect(() => {
    fetchRoles()
      .then((r) => r?.length && setRoles(r))
      .catch(() => {})
    fetchExperienceRanges()
      .then((r) => r?.length && setExperienceRanges(r))
      .catch(() => {})
  }, [])

  const canEvaluate = role.trim().length > 0 && file && !loading
  // Always available regardless of file upload or score — only needs a role + experience range.
  const canGenerateQuestions = role.trim().length > 0 && experienceRange.length > 0 && !loading

  async function handleEvaluate(e) {
    e.preventDefault()
    if (!canEvaluate) return
    setEvalLoading(true)
    setApiError(null)
    setResult(null)
    setQuestionsData(null)
    setProgress(0)
    try {
      const data = await evaluateProfile(role.trim(), file, (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100))
      })
      setResult(data)
      setMode('eval')
    } catch (err) {
      setApiError(err.message)
      setMode(null)
    } finally {
      setEvalLoading(false)
    }
  }

  async function handleGenerateQuestions() {
    if (!canGenerateQuestions) return
    setQuestionsLoading(true)
    setApiError(null)
    setResult(null)
    setQuestionsData(null)
    try {
      const data = await generateQuestions(role.trim(), experienceRange)
      setQuestionsData(data)
      setMode('questions')
    } catch (err) {
      setApiError(err.message)
      setMode(null)
    } finally {
      setQuestionsLoading(false)
    }
  }

  function handleReset() {
    setRole('')
    setFile(null)
    setFileError(null)
    setExperienceRange('')
    setResult(null)
    setQuestionsData(null)
    setMode(null)
    setApiError(null)
    setProgress(0)
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">PE</div>
          <div>
            <p className="brand-title">Profile Evaluator</p>
            <p className="brand-sub">AI-assisted candidate screening</p>
          </div>
        </div>
        <span className="header-tag">Groq-powered</span>
      </header>

      <main className="app-main">
        <section className="form-column">
          <div className="form-card">
            <h1 className="form-heading">Screen a candidate profile</h1>
            <p className="form-lede">
              Choose a role, upload the candidate's profile, and get an instant, evidence-based
              score with either a gap analysis or tailored interview questions — or skip the
              profile entirely and generate role-based screening questions on their own.
            </p>

            <form onSubmit={handleEvaluate}>
              <RoleSelector role={role} setRole={setRole} roles={roles} disabled={loading} />
              <ExperienceSelector
                experienceRange={experienceRange}
                setExperienceRange={setExperienceRange}
                ranges={experienceRanges}
                disabled={loading}
              />
              <FileUpload
                file={file}
                setFile={setFile}
                disabled={loading}
                error={fileError}
                setError={setFileError}
              />

              {apiError && (
                <div className="alert alert-error" role="alert">
                  {apiError}
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={!canEvaluate}>
                  {evalLoading ? `Evaluating… ${progress}%` : 'Evaluate profile'}
                </button>
                {(result || questionsData || apiError) && (
                  <button type="button" className="btn-ghost" onClick={handleReset} disabled={loading}>
                    Start over
                  </button>
                )}
              </div>
            </form>

            <div className="standalone-block">
              <button
                type="button"
                className="btn-secondary"
                disabled={!canGenerateQuestions}
                onClick={handleGenerateQuestions}
              >
                {questionsLoading ? 'Generating…' : 'Generate questions'}
              </button>
              <p className="field-hint">
                Works without uploading a profile and regardless of any score — just role + experience range.
              </p>
            </div>

            <ul className="trust-strip">
              <li>Score threshold ≥ 70 → shortlisted + interview questions</li>
              <li>Score threshold &lt; 30 → rejected + gap analysis</li>
              <li>30–69 → borderline, flagged for manual review</li>
            </ul>
          </div>
        </section>

        <section className="results-column">
          {loading && (
            <div className="loading-state">
              <div className="spinner" />
              <p>{evalLoading ? 'Analyzing profile against role requirements…' : 'Generating role-based questions…'}</p>
            </div>
          )}
          {!loading && !result && !questionsData && !apiError && (
            <div className="empty-state">
              <div className="empty-icon">◎</div>
              <p className="empty-title">No evaluation yet</p>
              <p className="empty-sub">
                Fill in the role and upload a profile to see the score, gap analysis, and interview
                questions here — or pick an experience range and generate role-based questions
                without a profile.
              </p>
            </div>
          )}
          {!loading && mode === 'eval' && result && <ResultsPanel result={result} />}
          {!loading && mode === 'questions' && questionsData && <StandaloneQuestionsPanel data={questionsData} />}
        </section>
      </main>
    </div>
  )
}
