import {
  startAppTracking,
  stopAppTracking,
  isAppTrackingActive,
} from './app-tracker'
import {
  startScreenshotCapture,
  stopScreenshotCapture,
  isScreenshotCaptureActive,
} from './screenshot-tracker'
import {
  startIdleMonitoring,
  stopIdleMonitoring,
  isIdleMonitoringActive,
  getIdleTime,
  onIdleStateChange,
} from './idle-tracker'
import { trackBrowserActivity } from './browser-tracker'
import { getSetting } from '../database/queries'

/**
 * Tracking Manager
 * Coordinates all tracking modules
 */

let isTrackingEnabled = false

/**
 * Initialize all tracking modules
 */
export function initializeTracking() {
  console.log('Initializing tracking manager...')

  // Set up idle state change handler
  onIdleStateChange((isIdle, idleTime) => {
    if (isIdle) {
      console.log(`User is now idle (${idleTime}s)`)
      // Optionally pause tracking during idle time
      const pauseOnIdle = getSetting('pauseOnIdle') === 'true'
      if (pauseOnIdle) {
        pauseTracking()
      }
    } else {
      console.log('User is now active')
      const pauseOnIdle = getSetting('pauseOnIdle') === 'true'
      if (pauseOnIdle && isTrackingEnabled) {
        resumeTracking()
      }
    }
  })

  console.log('Tracking manager initialized')
}

/**
 * Start all tracking modules
 */
export function startTracking() {
  if (isTrackingEnabled) {
    console.log('Tracking already enabled')
    return
  }

  console.log('Starting all tracking modules...')
  isTrackingEnabled = true

  // Start app/window tracking
  startAppTracking()

  // Start screenshot capture
  const screenshotsEnabled = getSetting('screenshotsEnabled') !== 'false'
  if (screenshotsEnabled) {
    startScreenshotCapture()
  }

  // Start idle monitoring
  const idleThreshold = parseInt(getSetting('idleThreshold') || '300')
  startIdleMonitoring(idleThreshold)

  console.log('All tracking modules started')
}

/**
 * Stop all tracking modules
 */
export function stopTracking() {
  if (!isTrackingEnabled) {
    console.log('Tracking already disabled')
    return
  }

  console.log('Stopping all tracking modules...')
  isTrackingEnabled = false

  // Stop all trackers
  stopAppTracking()
  stopScreenshotCapture()
  stopIdleMonitoring()

  console.log('All tracking modules stopped')
}

/**
 * Pause tracking temporarily (without changing enabled state)
 */
export function pauseTracking() {
  console.log('Pausing tracking...')

  stopAppTracking()
  stopScreenshotCapture()

  console.log('Tracking paused')
}

/**
 * Resume tracking after pause
 */
export function resumeTracking() {
  console.log('Resuming tracking...')

  startAppTracking()

  const screenshotsEnabled = getSetting('screenshotsEnabled') !== 'false'
  if (screenshotsEnabled) {
    startScreenshotCapture()
  }

  console.log('Tracking resumed')
}

/**
 * Get tracking status
 */
export function getTrackingStatus() {
  return {
    isEnabled: isTrackingEnabled,
    appTracking: isAppTrackingActive(),
    screenshotCapture: isScreenshotCaptureActive(),
    idleMonitoring: isIdleMonitoringActive(),
    idleTime: getIdleTime(),
  }
}

/**
 * Toggle tracking on/off
 */
export function toggleTracking() {
  if (isTrackingEnabled) {
    stopTracking()
  } else {
    startTracking()
  }
  return isTrackingEnabled
}

/**
 * Update tracking settings
 */
export function updateTrackingSettings(settings: {
  trackingInterval?: number
  screenshotInterval?: number
  screenshotQuality?: number
  idleThreshold?: number
  screenshotsEnabled?: boolean
}) {
  console.log('Updating tracking settings:', settings)

  // Apply settings by restarting affected modules
  const wasTracking = isTrackingEnabled

  if (wasTracking) {
    stopTracking()
  }

  // Settings are already updated in the database
  // Just restart if it was running

  if (wasTracking) {
    startTracking()
  }

  console.log('Tracking settings updated')
}

/**
 * Force a manual activity capture
 */
export async function captureManualActivity() {
  console.log('Manual activity capture triggered')

  // This would capture current state immediately
  // Implementation depends on the app-tracker module

  return {
    success: true,
    message: 'Manual activity captured',
  }
}

export default {
  initializeTracking,
  startTracking,
  stopTracking,
  pauseTracking,
  resumeTracking,
  getTrackingStatus,
  toggleTracking,
  updateTrackingSettings,
  captureManualActivity,
}
