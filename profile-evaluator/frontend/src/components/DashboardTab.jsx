import { Fragment, useEffect, useState } from 'react'
import { fetchDashboardStats, fetchDashboardEvaluations } from '../api/api'

const VERDICT_BADGE = {
  SELECTED: { label: 'Selected', cls: 'badge-select' },
  BORDERLINE: { label: 'Borderline', cls: 'badge-border' },
  REJECTED: { label: 'Rejected', cls: 'badge-reject' },
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export default function DashboardTab() {
  const [stats, setStats] = useState(null)
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDetailed, setShowDetailed] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [s, e] = await Promise.all([fetchDashboardStats(), fetchDashboardEvaluations(200)])
      setStats(s)
      setEvaluations(e)
    } catch (err) {
      setError('Could not load dashboard data. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <div className="tab-loading">
        <div className="spinner" />
        <p>Loading dashboard…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="tab-empty">
        <p className="empty-title">Couldn't load the dashboard</p>
        <p className="empty-sub">{error}</p>
        <button className="btn-ghost" onClick={load}>Retry</button>
      </div>
    )
  }

  const noData = !stats || stats.total_evaluated === 0

  return (
    <div className="tab-content">
      <div className="tab-content-header">
        <div>
          <h2 className="tab-title">Screening dashboard</h2>
          <p className="tab-sub">Live counts from every profile evaluated so far.</p>
        </div>
        <button className="btn-ghost" onClick={load}>Refresh</button>
      </div>

      {noData ? (
        <div className="tab-empty">
          <div className="empty-icon">◎</div>
          <p className="empty-title">No evaluations yet</p>
          <p className="empty-sub">Evaluate a profile in the first tab and its results will show up here automatically.</p>
        </div>
      ) : (
        <>
          <div className="stat-cards">
            <div className="stat-card">
              <span className="stat-label">Profiles evaluated</span>
              <span className="stat-value">{stats.total_evaluated}</span>
            </div>
            <div className="stat-card stat-card-select">
              <span className="stat-label">Matching JD</span>
              <span className="stat-value">{stats.matching}</span>
            </div>
            <div className="stat-card stat-card-reject">
              <span className="stat-label">Not matching JD</span>
              <span className="stat-value">{stats.not_matching}</span>
            </div>
          </div>

          <div className="stat-breakdown">
            <span className="badge badge-select">Selected · {stats.selected}</span>
            <span className="badge badge-border">Borderline · {stats.borderline}</span>
            <span className="badge badge-reject">Rejected · {stats.rejected}</span>
          </div>

          <button className="btn-secondary detail-toggle" onClick={() => setShowDetailed((v) => !v)}>
            {showDetailed ? 'Hide detailed report' : 'View detailed report'}
          </button>

          {showDetailed && (
            <div className="panel table-panel">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Candidate name</th>
                    <th>Evaluation date</th>
                    <th>Skill matching summary</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluations.map((ev) => {
                    const badge = VERDICT_BADGE[ev.verdict] || VERDICT_BADGE.BORDERLINE
                    const isOpen = expandedId === ev.id
                    return (
                      <Fragment key={ev.id}>
                        <tr
                          className="data-row"
                          onClick={() => setExpandedId(isOpen ? null : ev.id)}
                        >
                          <td className="data-name">{ev.candidate_name}</td>
                          <td className="data-date">{formatDate(ev.created_at)}</td>
                          <td className="data-summary">{ev.summary}</td>
                          <td>
                            <span className={`badge ${badge.cls}`}>{badge.label}</span>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr className="data-row-expanded">
                            <td colSpan={4}>
                              <div className="expanded-panel">
                                <p className="expanded-meta">
                                  Role: <strong>{ev.role}</strong> · Score: <strong>{ev.score}</strong>
                                  {ev.skills_considered && (
                                    <> · Skills considered: <strong>{ev.skills_considered}</strong></>
                                  )}
                                </p>
                                {ev.gap_analysis?.length > 0 ? (
                                  <ul className="expanded-gap-list">
                                    {ev.gap_analysis.map((g, i) => (
                                      <li key={i}>
                                        <strong>{g.area}</strong> ({g.severity}) — {g.detail}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="expanded-nogaps">No gaps recorded — candidate matched role requirements.</p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
