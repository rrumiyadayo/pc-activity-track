import screenshot from 'screenshot-desktop'
import fs from 'fs'
import path from 'path'
import { getScreenshotsPath } from '../database/init'
import { insertScreenshot } from '../database/queries'
import { getSetting } from '../database/queries'

/**
 * Screenshot Tracker
 * Captures periodic screenshots for activity timeline
 */

let screenshotInterval: NodeJS.Timeout | null = null
let isCapturing = false

/**
 * Generate a screenshot filename based on timestamp
 */
function generateScreenshotFilename(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `screenshot-${timestamp}.jpg`
}

/**
 * Capture a single screenshot
 */
export async function captureScreenshot(activityId?: number): Promise<string | null> {
  try {
    const screenshotsDir = getScreenshotsPath()
    const filename = generateScreenshotFilename()
    const filepath = path.join(screenshotsDir, filename)

    // Get quality setting
    const quality = parseInt(getSetting('screenshotQuality') || '80')

    // Capture screenshot
    console.log('Capturing screenshot...')
    const imgBuffer = await screenshot({ format: 'jpg' })

    // Write to file
    fs.writeFileSync(filepath, imgBuffer)

    const fileSize = fs.statSync(filepath).size

    // Insert screenshot record into database
    insertScreenshot({
      timestamp: new Date().toISOString(),
      file_path: filepath,
      file_size: fileSize,
      activity_id: activityId,
    })

    console.log(`Screenshot captured: ${filepath} (${(fileSize / 1024).toFixed(2)} KB)`)

    return filepath
  } catch (error) {
    console.error('Error capturing screenshot:', error)
    return null
  }
}

/**
 * Capture screenshot of a specific display
 */
export async function captureScreenshotOfDisplay(displayIndex: number): Promise<string | null> {
  try {
    const screenshotsDir = getScreenshotsPath()
    const filename = generateScreenshotFilename()
    const filepath = path.join(screenshotsDir, filename)

    // Capture specific display
    const imgBuffer = await screenshot({ screen: displayIndex, format: 'jpg' })

    fs.writeFileSync(filepath, imgBuffer)
    const fileSize = fs.statSync(filepath).size

    insertScreenshot({
      timestamp: new Date().toISOString(),
      file_path: filepath,
      file_size: fileSize,
    })

    console.log(
      `Screenshot of display ${displayIndex} captured: ${filepath} (${(fileSize / 1024).toFixed(2)} KB)`
    )

    return filepath
  } catch (error) {
    console.error(`Error capturing screenshot of display ${displayIndex}:`, error)
    return null
  }
}

/**
 * List all available displays
 */
export async function listDisplays(): Promise<number> {
  try {
    const displays = await screenshot.listDisplays()
    console.log(`Found ${displays.length} display(s)`)
    return displays.length
  } catch (error) {
    console.error('Error listing displays:', error)
    return 1 // Default to 1 display
  }
}

/**
 * Start periodic screenshot capture
 */
export function startScreenshotCapture() {
  if (isCapturing) {
    console.log('Screenshot capture already running')
    return
  }

  console.log('Starting screenshot capture...')
  isCapturing = true

  // Get screenshot interval from settings (default 60 seconds)
  const interval = parseInt(getSetting('screenshotInterval') || '60') * 1000

  // Capture initial screenshot
  captureScreenshot()

  // Set up periodic capture
  screenshotInterval = setInterval(() => {
    captureScreenshot()
  }, interval)

  console.log(`Screenshot capture started (interval: ${interval}ms)`)
}

/**
 * Stop periodic screenshot capture
 */
export function stopScreenshotCapture() {
  if (!isCapturing) {
    console.log('Screenshot capture not running')
    return
  }

  console.log('Stopping screenshot capture...')
  isCapturing = false

  if (screenshotInterval) {
    clearInterval(screenshotInterval)
    screenshotInterval = null
  }

  console.log('Screenshot capture stopped')
}

/**
 * Check if screenshot capture is active
 */
export function isScreenshotCaptureActive(): boolean {
  return isCapturing
}

/**
 * Update screenshot capture interval
 */
export function updateScreenshotInterval(seconds: number) {
  if (isCapturing) {
    stopScreenshotCapture()
    startScreenshotCapture()
  }
}

/**
 * Delete screenshot file
 */
export function deleteScreenshot(filepath: string): boolean {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath)
      console.log(`Screenshot deleted: ${filepath}`)
      return true
    }
    return false
  } catch (error) {
    console.error('Error deleting screenshot:', error)
    return false
  }
}

/**
 * Clean up old screenshots based on retention policy
 */
export function cleanupOldScreenshots(daysToKeep: number) {
  try {
    const screenshotsDir = getScreenshotsPath()
    const files = fs.readdirSync(screenshotsDir)
    const now = Date.now()
    const maxAge = daysToKeep * 24 * 60 * 60 * 1000 // Convert days to milliseconds

    let deletedCount = 0

    for (const file of files) {
      const filepath = path.join(screenshotsDir, file)
      const stats = fs.statSync(filepath)
      const age = now - stats.mtimeMs

      if (age > maxAge) {
        fs.unlinkSync(filepath)
        deletedCount++
      }
    }

    console.log(`Cleaned up ${deletedCount} old screenshot(s)`)
    return deletedCount
  } catch (error) {
    console.error('Error cleaning up screenshots:', error)
    return 0
  }
}

/**
 * Get total size of screenshots directory
 */
export function getScreenshotsDirectorySize(): number {
  try {
    const screenshotsDir = getScreenshotsPath()
    const files = fs.readdirSync(screenshotsDir)

    let totalSize = 0
    for (const file of files) {
      const filepath = path.join(screenshotsDir, file)
      const stats = fs.statSync(filepath)
      totalSize += stats.size
    }

    return totalSize
  } catch (error) {
    console.error('Error calculating screenshots directory size:', error)
    return 0
  }
}

export default {
  captureScreenshot,
  captureScreenshotOfDisplay,
  listDisplays,
  startScreenshotCapture,
  stopScreenshotCapture,
  isScreenshotCaptureActive,
  updateScreenshotInterval,
  deleteScreenshot,
  cleanupOldScreenshots,
  getScreenshotsDirectorySize,
}
