import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { app } from 'electron'
import {
  createTablesSQL,
  createIndexesSQL,
  defaultCategories,
  defaultSettings,
  SCHEMA_VERSION,
} from './schema'

let db: Database.Database | null = null

/**
 * Get the database file path
 */
export function getDatabasePath(): string {
  const userDataPath = app.getPath('userData')
  const dbDir = path.join(userDataPath, 'data')

  // Ensure the directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  return path.join(dbDir, 'activity-tracker.db')
}

/**
 * Get the screenshots directory path
 */
export function getScreenshotsPath(): string {
  const userDataPath = app.getPath('userData')
  const screenshotsDir = path.join(userDataPath, 'screenshots')

  // Ensure the directory exists
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true })
  }

  return screenshotsDir
}

/**
 * Initialize the database
 */
export function initDatabase(): Database.Database {
  if (db) {
    return db
  }

  const dbPath = getDatabasePath()
  console.log('Initializing database at:', dbPath)

  // Create database connection
  db = new Database(dbPath, { verbose: console.log })

  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  // Create tables
  db.exec(createTablesSQL)
  db.exec(createIndexesSQL)

  // Initialize default data
  initializeDefaultData(db)

  console.log('Database initialized successfully')
  return db
}

/**
 * Initialize default categories and settings
 */
function initializeDefaultData(database: Database.Database) {
  // Insert default categories
  const categoryStmt = database.prepare(`
    INSERT OR IGNORE INTO categories (name, color, is_productive)
    VALUES (?, ?, ?)
  `)

  const insertCategories = database.transaction(() => {
    for (const category of defaultCategories) {
      categoryStmt.run(category.name, category.color, category.is_productive)
    }
  })

  insertCategories()

  // Insert default settings
  const settingsStmt = database.prepare(`
    INSERT OR IGNORE INTO settings (key, value)
    VALUES (?, ?)
  `)

  const insertSettings = database.transaction(() => {
    for (const [key, value] of Object.entries(defaultSettings)) {
      settingsStmt.run(key, value)
    }
  })

  insertSettings()

  // Store schema version
  database
    .prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES ('schemaVersion', ?)`)
    .run(SCHEMA_VERSION.toString())
}

/**
 * Get the database instance
 */
export function getDatabase(): Database.Database {
  if (!db) {
    return initDatabase()
  }
  return db
}

/**
 * Close the database connection
 */
export function closeDatabase() {
  if (db) {
    db.close()
    db = null
    console.log('Database connection closed')
  }
}

/**
 * Vacuum the database to reclaim space
 */
export function vacuumDatabase() {
  const database = getDatabase()
  database.exec('VACUUM')
  console.log('Database vacuumed')
}

/**
 * Clean up old data based on retention settings
 */
export function cleanupOldData() {
  const database = getDatabase()

  // Get retention days from settings
  const retentionDays = database
    .prepare('SELECT value FROM settings WHERE key = ?')
    .get('dataRetentionDays') as { value: string } | undefined

  const days = retentionDays ? parseInt(retentionDays.value) : 30

  // Delete old activities
  const deleteStmt = database.prepare(`
    DELETE FROM activities
    WHERE timestamp < datetime('now', '-' || ? || ' days')
  `)

  const result = deleteStmt.run(days)
  console.log(`Cleaned up ${result.changes} old activity records`)

  // Delete old screenshots
  const deleteScreenshotsStmt = database.prepare(`
    DELETE FROM screenshots
    WHERE timestamp < datetime('now', '-' || ? || ' days')
  `)

  deleteScreenshotsStmt.run(days)

  // Vacuum to reclaim space
  vacuumDatabase()
}

/**
 * Export database to JSON
 */
export function exportDatabaseToJSON(startDate?: string, endDate?: string): string {
  const database = getDatabase()

  let query = 'SELECT * FROM activities WHERE 1=1'
  const params: string[] = []

  if (startDate) {
    query += ' AND timestamp >= ?'
    params.push(startDate)
  }

  if (endDate) {
    query += ' AND timestamp <= ?'
    params.push(endDate)
  }

  const activities = database.prepare(query).all(...params)

  return JSON.stringify(activities, null, 2)
}

/**
 * Get database statistics
 */
export function getDatabaseStats() {
  const database = getDatabase()

  const stats = {
    totalActivities: database
      .prepare('SELECT COUNT(*) as count FROM activities')
      .get() as { count: number },
    totalScreenshots: database
      .prepare('SELECT COUNT(*) as count FROM screenshots')
      .get() as { count: number },
    totalApps: database
      .prepare('SELECT COUNT(*) as count FROM applications')
      .get() as { count: number },
    databaseSize: fs.statSync(getDatabasePath()).size,
    oldestRecord: database
      .prepare('SELECT MIN(timestamp) as oldest FROM activities')
      .get() as { oldest: string | null },
    newestRecord: database
      .prepare('SELECT MAX(timestamp) as newest FROM activities')
      .get() as { newest: string | null },
  }

  return stats
}

export default {
  initDatabase,
  getDatabase,
  closeDatabase,
  vacuumDatabase,
  cleanupOldData,
  exportDatabaseToJSON,
  getDatabaseStats,
  getDatabasePath,
  getScreenshotsPath,
}
