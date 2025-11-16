import activeWin from 'active-win'
import { insertActivity, upsertApplication } from '../database/queries'
import { getSetting } from '../database/queries'

/**
 * Application and Window Tracker
 * Tracks the currently active application and window title
 */

interface ActiveWindowInfo {
  appName: string
  windowTitle: string
  processName: string
  url?: string
}

let trackingInterval: NodeJS.Timeout | null = null
let isTracking = false
let lastActivity: ActiveWindowInfo | null = null

/**
 * Get information about the currently active window
 */
async function getActiveWindowInfo(): Promise<ActiveWindowInfo | null> {
  try {
    const window = await activeWin()

    if (!window) {
      return null
    }

    return {
      appName: window.owner.name,
      windowTitle: window.title,
      processName: window.owner.processId.toString(),
      url: extractUrlFromTitle(window.title),
    }
  } catch (error) {
    console.error('Error getting active window:', error)
    return null
  }
}

/**
 * Extract URL from window title (common for browsers)
 */
function extractUrlFromTitle(title: string): string | undefined {
  // Common patterns for browser titles
  const urlPattern =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/

  const match = title.match(urlPattern)
  return match ? match[0] : undefined
}

/**
 * Check if an app should be excluded from tracking
 */
async function isAppExcluded(appName: string): Promise<boolean> {
  // TODO: Implement actual check against excluded_apps table
  // For now, return false
  return false
}

/**
 * Record the current activity
 */
async function recordActivity() {
  try {
    const windowInfo = await getActiveWindowInfo()

    if (!windowInfo) {
      return
    }

    // Check if app is excluded
    if (await isAppExcluded(windowInfo.appName)) {
      return
    }

    // Calculate duration since last activity
    const now = new Date().toISOString()
    const interval = parseInt(getSetting('trackingInterval') || '5')
    const duration = interval

    // Insert activity record
    const activityId = insertActivity({
      timestamp: now,
      app_name: windowInfo.appName,
      window_title: windowInfo.windowTitle,
      url: windowInfo.url,
      process_name: windowInfo.processName,
      duration: duration,
      is_active: true,
    })

    // Update or insert application record
    upsertApplication(windowInfo.appName)

    // Update last activity
    lastActivity = windowInfo

    console.log(`Tracked activity: ${windowInfo.appName} - ${windowInfo.windowTitle}`)

    return activityId
  } catch (error) {
    console.error('Error recording activity:', error)
  }
}

/**
 * Start tracking applications and windows
 */
export function startAppTracking() {
  if (isTracking) {
    console.log('App tracking already running')
    return
  }

  console.log('Starting app tracking...')
  isTracking = true

  // Get tracking interval from settings (default 5 seconds)
  const interval = parseInt(getSetting('trackingInterval') || '5') * 1000

  // Record initial activity
  recordActivity()

  // Set up periodic tracking
  trackingInterval = setInterval(() => {
    recordActivity()
  }, interval)

  console.log(`App tracking started (interval: ${interval}ms)`)
}

/**
 * Stop tracking applications and windows
 */
export function stopAppTracking() {
  if (!isTracking) {
    console.log('App tracking not running')
    return
  }

  console.log('Stopping app tracking...')
  isTracking = false

  if (trackingInterval) {
    clearInterval(trackingInterval)
    trackingInterval = null
  }

  console.log('App tracking stopped')
}

/**
 * Check if tracking is currently active
 */
export function isAppTrackingActive(): boolean {
  return isTracking
}

/**
 * Update tracking interval
 */
export function updateTrackingInterval(seconds: number) {
  if (isTracking) {
    stopAppTracking()
    startAppTracking()
  }
}

/**
 * Get the last tracked activity
 */
export function getLastActivity(): ActiveWindowInfo | null {
  return lastActivity
}

export default {
  startAppTracking,
  stopAppTracking,
  isAppTrackingActive,
  updateTrackingInterval,
  getLastActivity,
}
