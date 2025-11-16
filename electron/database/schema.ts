/**
 * Database schema definitions for PC Activity Tracker
 * Uses SQLite for local data storage
 */

export const SCHEMA_VERSION = 1

/**
 * SQL statements to create all tables
 */
export const createTablesSQL = `
-- Activities table: Main table for tracking all activity events
CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  app_name TEXT NOT NULL,
  window_title TEXT,
  url TEXT,
  process_name TEXT,
  idle_time INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  duration INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Screenshots table: Stores screenshot metadata and file paths
CREATE TABLE IF NOT EXISTS screenshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  thumbnail_path TEXT,
  activity_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

-- Applications table: Unique apps with categorization
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_name TEXT UNIQUE NOT NULL,
  display_name TEXT,
  category TEXT DEFAULT 'Other',
  is_productive BOOLEAN DEFAULT NULL,
  icon_path TEXT,
  total_time INTEGER DEFAULT 0,
  last_used DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories table: App categories for productivity tracking
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  color TEXT,
  is_productive BOOLEAN DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Daily summaries table: Aggregated daily statistics
CREATE TABLE IF NOT EXISTS daily_summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE UNIQUE NOT NULL,
  total_active_time INTEGER DEFAULT 0,
  total_idle_time INTEGER DEFAULT 0,
  app_count INTEGER DEFAULT 0,
  screenshot_count INTEGER DEFAULT 0,
  productivity_score REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Settings table: App configuration
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Excluded apps table: Apps to ignore during tracking
CREATE TABLE IF NOT EXISTS excluded_apps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_name TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Browser history table: Detailed browser URL tracking
CREATE TABLE IF NOT EXISTS browser_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  browser TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  domain TEXT,
  duration INTEGER DEFAULT 0,
  activity_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

-- Input events table: Keyboard and mouse activity levels
CREATE TABLE IF NOT EXISTS input_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  keyboard_events INTEGER DEFAULT 0,
  mouse_events INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  scrolls INTEGER DEFAULT 0,
  activity_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);
`

/**
 * SQL statements to create indexes for better query performance
 */
export const createIndexesSQL = `
-- Activity indexes
CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp);
CREATE INDEX IF NOT EXISTS idx_activities_app_name ON activities(app_name);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(DATE(timestamp));

-- Screenshot indexes
CREATE INDEX IF NOT EXISTS idx_screenshots_timestamp ON screenshots(timestamp);
CREATE INDEX IF NOT EXISTS idx_screenshots_activity_id ON screenshots(activity_id);

-- Application indexes
CREATE INDEX IF NOT EXISTS idx_applications_app_name ON applications(app_name);
CREATE INDEX IF NOT EXISTS idx_applications_category ON applications(category);
CREATE INDEX IF NOT EXISTS idx_applications_last_used ON applications(last_used);

-- Browser history indexes
CREATE INDEX IF NOT EXISTS idx_browser_history_timestamp ON browser_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_browser_history_domain ON browser_history(domain);
CREATE INDEX IF NOT EXISTS idx_browser_history_activity_id ON browser_history(activity_id);

-- Daily summary indexes
CREATE INDEX IF NOT EXISTS idx_daily_summaries_date ON daily_summaries(date);

-- Input events indexes
CREATE INDEX IF NOT EXISTS idx_input_events_timestamp ON input_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_input_events_activity_id ON input_events(activity_id);
`

/**
 * Default categories to populate on first run
 */
export const defaultCategories = [
  { name: 'Development', color: '#3b82f6', is_productive: true },
  { name: 'Communication', color: '#8b5cf6', is_productive: true },
  { name: 'Productivity', color: '#10b981', is_productive: true },
  { name: 'Entertainment', color: '#f59e0b', is_productive: false },
  { name: 'Social Media', color: '#ef4444', is_productive: false },
  { name: 'Gaming', color: '#ec4899', is_productive: false },
  { name: 'Utilities', color: '#6b7280', is_productive: null },
  { name: 'Other', color: '#9ca3af', is_productive: null },
]

/**
 * Default settings
 */
export const defaultSettings = {
  trackingInterval: '5',
  screenshotInterval: '60',
  screenshotQuality: '80',
  dataRetentionDays: '30',
  autoStart: 'true',
  minimizeToTray: 'true',
  trackingEnabled: 'true',
  privacyMode: 'false',
  blurScreenshots: 'false',
}
