import { powerMonitor } from 'electron'

/**
 * Idle Tracker
 * Detects when the user is idle (no keyboard/mouse activity)
 */

let idleCheckInterval: NodeJS.Timeout | null = null
let isMonitoring = false
let idleThresholdSeconds = 300 // 5 minutes default
let lastIdleState = false
let idleCallbacks: Array<(isIdle: boolean, idleTime: number) => void> = []

/**
 * Get the current idle time in seconds
 */
export function getIdleTime(): number {
  return powerMonitor.getSystemIdleTime()
}

/**
 * Check if the system is currently idle
 */
export function isSystemIdle(): boolean {
  const idleTime = getIdleTime()
  return idleTime >= idleThresholdSeconds
}

/**
 * Register a callback for idle state changes
 */
export function onIdleStateChange(callback: (isIdle: boolean, idleTime: number) => void) {
  idleCallbacks.push(callback)
}

/**
 * Remove a callback
 */
export function removeIdleCallback(callback: (isIdle: boolean, idleTime: number) => void) {
  idleCallbacks = idleCallbacks.filter(cb => cb !== callback)
}

/**
 * Notify all callbacks of idle state change
 */
function notifyIdleStateChange(isIdle: boolean, idleTime: number) {
  for (const callback of idleCallbacks) {
    try {
      callback(isIdle, idleTime)
    } catch (error) {
      console.error('Error in idle state callback:', error)
    }
  }
}

/**
 * Check idle state and trigger callbacks if state changed
 */
function checkIdleState() {
  const idleTime = getIdleTime()
  const currentIdleState = idleTime >= idleThresholdSeconds

  // Check if state changed
  if (currentIdleState !== lastIdleState) {
    console.log(
      `Idle state changed: ${currentIdleState ? 'IDLE' : 'ACTIVE'} (idle time: ${idleTime}s)`
    )
    notifyIdleStateChange(currentIdleState, idleTime)
    lastIdleState = currentIdleState
  }
}

/**
 * Start monitoring idle state
 */
export function startIdleMonitoring(thresholdSeconds: number = 300) {
  if (isMonitoring) {
    console.log('Idle monitoring already running')
    return
  }

  console.log(`Starting idle monitoring (threshold: ${thresholdSeconds}s)...`)
  isMonitoring = true
  idleThresholdSeconds = thresholdSeconds

  // Initial state check
  lastIdleState = isSystemIdle()

  // Check idle state every 10 seconds
  idleCheckInterval = setInterval(() => {
    checkIdleState()
  }, 10000)

  // Also listen for system events
  powerMonitor.on('suspend', () => {
    console.log('System suspended')
    notifyIdleStateChange(true, idleThresholdSeconds)
  })

  powerMonitor.on('resume', () => {
    console.log('System resumed')
    notifyIdleStateChange(false, 0)
  })

  powerMonitor.on('lock-screen', () => {
    console.log('Screen locked')
    notifyIdleStateChange(true, idleThresholdSeconds)
  })

  powerMonitor.on('unlock-screen', () => {
    console.log('Screen unlocked')
    notifyIdleStateChange(false, 0)
  })

  console.log('Idle monitoring started')
}

/**
 * Stop monitoring idle state
 */
export function stopIdleMonitoring() {
  if (!isMonitoring) {
    console.log('Idle monitoring not running')
    return
  }

  console.log('Stopping idle monitoring...')
  isMonitoring = false

  if (idleCheckInterval) {
    clearInterval(idleCheckInterval)
    idleCheckInterval = null
  }

  // Remove all event listeners
  powerMonitor.removeAllListeners('suspend')
  powerMonitor.removeAllListeners('resume')
  powerMonitor.removeAllListeners('lock-screen')
  powerMonitor.removeAllListeners('unlock-screen')

  console.log('Idle monitoring stopped')
}

/**
 * Check if idle monitoring is active
 */
export function isIdleMonitoringActive(): boolean {
  return isMonitoring
}

/**
 * Update idle threshold
 */
export function updateIdleThreshold(seconds: number) {
  idleThresholdSeconds = seconds
  console.log(`Idle threshold updated to ${seconds}s`)
}

/**
 * Get current idle statistics
 */
export function getIdleStats() {
  return {
    isIdle: isSystemIdle(),
    idleTime: getIdleTime(),
    threshold: idleThresholdSeconds,
    isMonitoring: isMonitoring,
  }
}

/**
 * Get idle time as human-readable string
 */
export function getIdleTimeFormatted(): string {
  const seconds = getIdleTime()

  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m ${seconds % 60}s`
  }

  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m`
}

export default {
  getIdleTime,
  isSystemIdle,
  startIdleMonitoring,
  stopIdleMonitoring,
  isIdleMonitoringActive,
  updateIdleThreshold,
  getIdleStats,
  getIdleTimeFormatted,
  onIdleStateChange,
  removeIdleCallback,
}
