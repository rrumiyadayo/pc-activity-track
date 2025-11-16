import { useState } from 'react'
import './Settings.css'

interface SettingsData {
  trackingInterval: number
  screenshotInterval: number
  screenshotQuality: number
  dataRetentionDays: number
  excludedApps: string[]
  autoStart: boolean
  minimizeToTray: boolean
}

function Settings() {
  const [settings, setSettings] = useState<SettingsData>({
    trackingInterval: 5,
    screenshotInterval: 60,
    screenshotQuality: 80,
    dataRetentionDays: 30,
    excludedApps: [],
    autoStart: true,
    minimizeToTray: true,
  })

  const handleSave = () => {
    // TODO: Save settings via Electron API
    console.log('Saving settings:', settings)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-description">Configure tracking preferences and privacy options</p>
      </div>

      <div className="settings-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Tracking Settings</h2>
            <p className="card-subtitle">Configure how activity is tracked</p>
          </div>

          <div className="setting-item">
            <label className="setting-label">
              Tracking Interval (seconds)
              <span className="setting-description">How often to record activity</span>
            </label>
            <input
              type="number"
              className="setting-input"
              value={settings.trackingInterval}
              onChange={e =>
                setSettings({ ...settings, trackingInterval: parseInt(e.target.value) })
              }
              min="1"
              max="60"
            />
          </div>

          <div className="setting-item">
            <label className="setting-label">
              Screenshot Interval (seconds)
              <span className="setting-description">How often to capture screenshots</span>
            </label>
            <input
              type="number"
              className="setting-input"
              value={settings.screenshotInterval}
              onChange={e =>
                setSettings({ ...settings, screenshotInterval: parseInt(e.target.value) })
              }
              min="10"
              max="3600"
            />
          </div>

          <div className="setting-item">
            <label className="setting-label">
              Screenshot Quality (%)
              <span className="setting-description">Higher quality = larger file size</span>
            </label>
            <input
              type="range"
              className="setting-slider"
              value={settings.screenshotQuality}
              onChange={e =>
                setSettings({ ...settings, screenshotQuality: parseInt(e.target.value) })
              }
              min="20"
              max="100"
            />
            <span className="setting-value">{settings.screenshotQuality}%</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Privacy & Data</h2>
            <p className="card-subtitle">Manage your data and privacy</p>
          </div>

          <div className="setting-item">
            <label className="setting-label">
              Data Retention (days)
              <span className="setting-description">
                Automatically delete data older than this
              </span>
            </label>
            <input
              type="number"
              className="setting-input"
              value={settings.dataRetentionDays}
              onChange={e =>
                setSettings({ ...settings, dataRetentionDays: parseInt(e.target.value) })
              }
              min="1"
              max="365"
            />
          </div>

          <div className="setting-item">
            <label className="setting-checkbox">
              <input
                type="checkbox"
                checked={settings.autoStart}
                onChange={e => setSettings({ ...settings, autoStart: e.target.checked })}
              />
              <span>Auto-start on system boot</span>
            </label>
          </div>

          <div className="setting-item">
            <label className="setting-checkbox">
              <input
                type="checkbox"
                checked={settings.minimizeToTray}
                onChange={e => setSettings({ ...settings, minimizeToTray: e.target.checked })}
              />
              <span>Minimize to system tray on close</span>
            </label>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Excluded Applications</h2>
            <p className="card-subtitle">Apps that won't be tracked</p>
          </div>

          <div className="empty-state">
            <div className="empty-state-icon">🚫</div>
            <div className="empty-state-title">No Excluded Apps</div>
            <div className="empty-state-description">
              Add applications you don't want to track
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Data Management</h2>
            <p className="card-subtitle">Export or delete your data</p>
          </div>

          <div className="setting-actions">
            <button className="action-button secondary">Export Data (CSV)</button>
            <button className="action-button secondary">Export Data (JSON)</button>
            <button className="action-button danger">Delete All Data</button>
          </div>
        </div>
      </div>

      <div className="settings-footer">
        <button className="action-button primary" onClick={handleSave}>
          Save Settings
        </button>
      </div>
    </div>
  )
}

export default Settings
