import { getDatabase } from './init'

/**
 * Activity tracking queries
 */

export interface Activity {
  id?: number
  timestamp: string
  app_name: string
  window_title?: string
  url?: string
  process_name?: string
  idle_time?: number
  is_active?: boolean
  duration?: number
}

export function insertActivity(activity: Activity) {
  const db = getDatabase()
  const stmt = db.prepare(`
    INSERT INTO activities (timestamp, app_name, window_title, url, process_name, idle_time, is_active, duration)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const result = stmt.run(
    activity.timestamp,
    activity.app_name,
    activity.window_title || null,
    activity.url || null,
    activity.process_name || null,
    activity.idle_time || 0,
    activity.is_active !== false ? 1 : 0,
    activity.duration || 0
  )

  return result.lastInsertRowid
}

export function getActivities(params: { startDate?: string; endDate?: string; limit?: number }) {
  const db = getDatabase()

  let query = 'SELECT * FROM activities WHERE 1=1'
  const queryParams: unknown[] = []

  if (params.startDate) {
    query += ' AND timestamp >= ?'
    queryParams.push(params.startDate)
  }

  if (params.endDate) {
    query += ' AND timestamp <= ?'
    queryParams.push(params.endDate)
  }

  query += ' ORDER BY timestamp DESC'

  if (params.limit) {
    query += ' LIMIT ?'
    queryParams.push(params.limit)
  }

  return db.prepare(query).all(...queryParams)
}

export function getActivityStats(params: { startDate?: string; endDate?: string }) {
  const db = getDatabase()

  let query = `
    SELECT
      COUNT(*) as total_activities,
      SUM(duration) as total_active_time,
      SUM(idle_time) as total_idle_time,
      COUNT(DISTINCT app_name) as unique_apps,
      AVG(CASE WHEN is_active = 1 THEN duration ELSE 0 END) as avg_session_duration
    FROM activities
    WHERE 1=1
  `
  const queryParams: unknown[] = []

  if (params.startDate) {
    query += ' AND timestamp >= ?'
    queryParams.push(params.startDate)
  }

  if (params.endDate) {
    query += ' AND timestamp <= ?'
    queryParams.push(params.endDate)
  }

  return db.prepare(query).get(...queryParams)
}

/**
 * Application queries
 */

export function getAppUsage(params: { startDate?: string; endDate?: string }) {
  const db = getDatabase()

  let query = `
    SELECT
      app_name,
      COUNT(*) as usage_count,
      SUM(duration) as total_time,
      MAX(timestamp) as last_used
    FROM activities
    WHERE 1=1
  `
  const queryParams: unknown[] = []

  if (params.startDate) {
    query += ' AND timestamp >= ?'
    queryParams.push(params.startDate)
  }

  if (params.endDate) {
    query += ' AND timestamp <= ?'
    queryParams.push(params.endDate)
  }

  query += ' GROUP BY app_name ORDER BY total_time DESC'

  return db.prepare(query).all(...queryParams)
}

export function upsertApplication(appName: string, displayName?: string, category?: string) {
  const db = getDatabase()
  const stmt = db.prepare(`
    INSERT INTO applications (app_name, display_name, category, last_used)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(app_name) DO UPDATE SET
      last_used = CURRENT_TIMESTAMP,
      display_name = COALESCE(?, display_name),
      category = COALESCE(?, category)
  `)

  return stmt.run(appName, displayName || appName, category || 'Other', displayName, category)
}

/**
 * Screenshot queries
 */

export interface Screenshot {
  timestamp: string
  file_path: string
  file_size?: number
  thumbnail_path?: string
  activity_id?: number
}

export function insertScreenshot(screenshot: Screenshot) {
  const db = getDatabase()
  const stmt = db.prepare(`
    INSERT INTO screenshots (timestamp, file_path, file_size, thumbnail_path, activity_id)
    VALUES (?, ?, ?, ?, ?)
  `)

  return stmt.run(
    screenshot.timestamp,
    screenshot.file_path,
    screenshot.file_size || null,
    screenshot.thumbnail_path || null,
    screenshot.activity_id || null
  )
}

export function getScreenshots(params: { startDate?: string; endDate?: string; limit?: number }) {
  const db = getDatabase()

  let query = 'SELECT * FROM screenshots WHERE 1=1'
  const queryParams: unknown[] = []

  if (params.startDate) {
    query += ' AND timestamp >= ?'
    queryParams.push(params.startDate)
  }

  if (params.endDate) {
    query += ' AND timestamp <= ?'
    queryParams.push(params.endDate)
  }

  query += ' ORDER BY timestamp DESC'

  if (params.limit) {
    query += ' LIMIT ?'
    queryParams.push(params.limit)
  }

  return db.prepare(query).all(...queryParams)
}

/**
 * Browser history queries
 */

export function insertBrowserHistory(data: {
  timestamp: string
  browser: string
  url: string
  title?: string
  domain?: string
  duration?: number
  activity_id?: number
}) {
  const db = getDatabase()
  const stmt = db.prepare(`
    INSERT INTO browser_history (timestamp, browser, url, title, domain, duration, activity_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  return stmt.run(
    data.timestamp,
    data.browser,
    data.url,
    data.title || null,
    data.domain || null,
    data.duration || 0,
    data.activity_id || null
  )
}

/**
 * Settings queries
 */

export function getSetting(key: string): string | null {
  const db = getDatabase()
  const result = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as
    | { value: string }
    | undefined

  return result ? result.value : null
}

export function getAllSettings(): Record<string, string> {
  const db = getDatabase()
  const results = db.prepare('SELECT key, value FROM settings').all() as Array<{
    key: string
    value: string
  }>

  return results.reduce(
    (acc, row) => {
      acc[row.key] = row.value
      return acc
    },
    {} as Record<string, string>
  )
}

export function updateSetting(key: string, value: string) {
  const db = getDatabase()
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO settings (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `)

  return stmt.run(key, value)
}

export function updateMultipleSettings(settings: Record<string, string>) {
  const db = getDatabase()
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO settings (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `)

  const transaction = db.transaction(() => {
    for (const [key, value] of Object.entries(settings)) {
      stmt.run(key, value)
    }
  })

  transaction()
}

/**
 * Daily summary queries
 */

export function upsertDailySummary(date: string, data: Partial<{
  total_active_time: number
  total_idle_time: number
  app_count: number
  screenshot_count: number
  productivity_score: number
}>) {
  const db = getDatabase()
  const stmt = db.prepare(`
    INSERT INTO daily_summaries (
      date, total_active_time, total_idle_time, app_count, screenshot_count, productivity_score, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(date) DO UPDATE SET
      total_active_time = COALESCE(?, total_active_time),
      total_idle_time = COALESCE(?, total_idle_time),
      app_count = COALESCE(?, app_count),
      screenshot_count = COALESCE(?, screenshot_count),
      productivity_score = COALESCE(?, productivity_score),
      updated_at = CURRENT_TIMESTAMP
  `)

  return stmt.run(
    date,
    data.total_active_time || 0,
    data.total_idle_time || 0,
    data.app_count || 0,
    data.screenshot_count || 0,
    data.productivity_score || null,
    data.total_active_time,
    data.total_idle_time,
    data.app_count,
    data.screenshot_count,
    data.productivity_score
  )
}

export function getDailySummary(date: string) {
  const db = getDatabase()
  return db.prepare('SELECT * FROM daily_summaries WHERE date = ?').get(date)
}

/**
 * Data deletion
 */

export function deleteDataRange(startDate: string, endDate: string) {
  const db = getDatabase()

  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM activities WHERE timestamp >= ? AND timestamp <= ?').run(
      startDate,
      endDate
    )
    db.prepare('DELETE FROM screenshots WHERE timestamp >= ? AND timestamp <= ?').run(
      startDate,
      endDate
    )
    db.prepare('DELETE FROM browser_history WHERE timestamp >= ? AND timestamp <= ?').run(
      startDate,
      endDate
    )
  })

  transaction()
}
