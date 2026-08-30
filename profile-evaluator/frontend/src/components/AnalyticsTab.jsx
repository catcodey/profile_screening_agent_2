import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts'
import { fetchDashboardStats, fetchRoleDistribution } from '../api/api'

const VERDICT_COLORS = {
  Selected: '#1F8A5F',
  Borderline: '#C98A2C',
  Rejected: '#C1443C',
}

export default function AnalyticsTab() {
  const [stats, setStats] = useState(null)
  const [roleDist, setRoleDist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [s, r] = await Promise.all([fetchDashboardStats(), fetchRoleDistribution()])
      setStats(s)
      setRoleDist(r)
    } catch {
      setError('Could not load analytics data. Is the backend running?')
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
        <p>Loading analytics…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="tab-empty">
        <p className="empty-title">Couldn't load analytics</p>
        <p className="empty-sub">{error}</p>
        <button className="btn-ghost" onClick={load}>Retry</button>
      </div>
    )
  }

  const noData = !stats || stats.total_evaluated === 0

  const pieData = [
    { name: 'Selected', value: stats?.selected || 0 },
    { name: 'Borderline', value: stats?.borderline || 0 },
    { name: 'Rejected', value: stats?.rejected || 0 },
  ].filter((d) => d.value > 0)

  return (
    <div className="tab-content">
      <div className="tab-content-header">
        <div>
          <h2 className="tab-title">Analytics</h2>
          <p className="tab-sub">Visual breakdown of every profile evaluated so far.</p>
        </div>
        <button className="btn-ghost" onClick={load}>Refresh</button>
      </div>

      {noData ? (
        <div className="tab-empty">
          <div className="empty-icon">◎</div>
          <p className="empty-title">Nothing to chart yet</p>
          <p className="empty-sub">Evaluate a few profiles first — charts will populate automatically.</p>
        </div>
      ) : (
        <div className="chart-grid">
          {/* Outcome Breakdown Pie Chart */}
          <div className="panel chart-panel">
            <h3 className="panel-title">
              <span className="panel-eyebrow">Outcome breakdown</span>
              Selected vs. borderline vs. rejected
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={VERDICT_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Average Score Per Role (Switched to Top Position) */}
          <div className="panel chart-panel">
            <h3 className="panel-title">
              <span className="panel-eyebrow">By role</span>
              Average score per role
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roleDist} margin={{ top: 8, right: 16, left: -12, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E5ED" />
                <XAxis dataKey="role" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={70} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [value, 'Avg. score']} />
                <Bar dataKey="avg_score" name="Avg. score" fill="#5B6178" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Selection and Rejection Count per Role (Switched to Bottom Position) */}
          <div className="panel chart-panel chart-panel-wide">
            <h3 className="panel-title">
              <span className="panel-eyebrow">Evaluations by Role</span>
              Selection and Rejection Count per Role
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={roleDist} margin={{ top: 16, right: 16, left: -12, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E5ED" />
                <XAxis 
                  dataKey="role" 
                  tick={{ fontSize: 11 }} 
                  interval={0} 
                  angle={-20} 
                  textAnchor="end" 
                  height={70} 
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend />
                <Bar dataKey="selected" name="Selected" fill={VERDICT_COLORS.Selected} radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejected" name="Rejected" fill={VERDICT_COLORS.Rejected} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}