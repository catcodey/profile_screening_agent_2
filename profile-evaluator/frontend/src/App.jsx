import { useState } from 'react'
import AnalyticsTab from './components/AnalyticsTab'
import DashboardTab from './components/DashboardTab'
import EvaluateTab from './components/EvaluateTab'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('evaluate')

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

      <nav className="app-tabs" aria-label="Main navigation">
        <button className={activeTab === 'evaluate' ? 'tab-active' : ''} onClick={() => setActiveTab('evaluate')}>
          Evaluate
        </button>
        <button className={activeTab === 'dashboard' ? 'tab-active' : ''} onClick={() => setActiveTab('dashboard')}>
          Dashboard
        </button>
        <button className={activeTab === 'analytics' ? 'tab-active' : ''} onClick={() => setActiveTab('analytics')}>
          Analytics
        </button>
      </nav>

      {activeTab === 'evaluate' && <EvaluateTab />}
      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
    </div>
  )
}