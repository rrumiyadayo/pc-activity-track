function Analytics() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Analytics & Insights</h1>
        <p className="page-description">Deep dive into your productivity patterns and habits</p>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Weekly Trends</h2>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">📈</div>
            <div className="empty-state-title">Trend Analysis Coming Soon</div>
            <div className="empty-state-description">
              Weekly and monthly trend charts will be displayed here
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Category Breakdown</h2>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <div className="empty-state-title">Category Analysis Coming Soon</div>
            <div className="empty-state-description">
              Time spent across different categories (Work, Social, Entertainment, etc.)
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Focus Patterns</h2>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">🧠</div>
            <div className="empty-state-title">Focus Analysis Coming Soon</div>
            <div className="empty-state-description">
              Identify your most productive hours and focus patterns
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">ML Insights</h2>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">🤖</div>
            <div className="empty-state-title">AI Insights Coming Soon</div>
            <div className="empty-state-description">
              Machine learning-based habit detection and productivity predictions
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
