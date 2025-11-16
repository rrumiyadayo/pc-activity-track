import { useEffect, useState } from 'react'

interface Stats {
  totalTimeToday: number
  activeApps: number
  screenshotsTaken: number
  productivityScore: number
}

function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalTimeToday: 0,
    activeApps: 0,
    screenshotsTaken: 0,
    productivityScore: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Load actual data from the database
    setTimeout(() => {
      setStats({
        totalTimeToday: 5.5,
        activeApps: 12,
        screenshotsTaken: 45,
        productivityScore: 78,
      })
      setIsLoading(false)
    }, 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">Overview of your activity today</p>
      </div>

      <div className="grid grid-4">
        <div className="stat-card">
          <div className="stat-label">Active Time Today</div>
          <div className="stat-value">{stats.totalTimeToday}h</div>
          <div className="stat-change positive">↑ 12% from yesterday</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Apps Used</div>
          <div className="stat-value">{stats.activeApps}</div>
          <div className="stat-change">Same as yesterday</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Screenshots</div>
          <div className="stat-value">{stats.screenshotsTaken}</div>
          <div className="stat-change positive">↑ 5 from yesterday</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Productivity</div>
          <div className="stat-value">{stats.productivityScore}%</div>
          <div className="stat-change negative">↓ 3% from yesterday</div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: '20px' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Top Applications</h2>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <div className="empty-state-title">Charts Coming Soon</div>
            <div className="empty-state-description">
              Application usage charts will be displayed here
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Activity Timeline</h2>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">⏱️</div>
            <div className="empty-state-title">Timeline Coming Soon</div>
            <div className="empty-state-description">
              Your activity timeline will be displayed here
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
