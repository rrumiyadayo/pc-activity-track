import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'

// Placeholder components - will be implemented later
import Dashboard from './components/Dashboard'
import Timeline from './components/Timeline'
import Analytics from './components/Analytics'
import Settings from './components/Settings'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')

  return (
    <Router>
      <div className="app">
        <nav className="sidebar">
          <div className="sidebar-header">
            <h1>Activity Tracker</h1>
          </div>
          <ul className="nav-menu">
            <li>
              <Link
                to="/"
                className={currentView === 'dashboard' ? 'active' : ''}
                onClick={() => setCurrentView('dashboard')}
              >
                📊 Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/timeline"
                className={currentView === 'timeline' ? 'active' : ''}
                onClick={() => setCurrentView('timeline')}
              >
                ⏱️ Timeline
              </Link>
            </li>
            <li>
              <Link
                to="/analytics"
                className={currentView === 'analytics' ? 'active' : ''}
                onClick={() => setCurrentView('analytics')}
              >
                📈 Analytics
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className={currentView === 'settings' ? 'active' : ''}
                onClick={() => setCurrentView('settings')}
              >
                ⚙️ Settings
              </Link>
            </li>
          </ul>
          <div className="sidebar-footer">
            <button className="tray-button" onClick={() => window.electronAPI?.minimizeToTray()}>
              Minimize to Tray
            </button>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
