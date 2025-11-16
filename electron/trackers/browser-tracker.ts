import activeWin from 'active-win'
import { insertBrowserHistory } from '../database/queries'

/**
 * Browser URL Tracker
 * Extracts and tracks URLs from browser windows
 */

interface BrowserInfo {
  browser: string
  url: string
  title: string
  domain: string
}

// List of supported browsers
const SUPPORTED_BROWSERS = [
  'chrome',
  'firefox',
  'edge',
  'safari',
  'brave',
  'opera',
  'vivaldi',
  'chromium',
]

/**
 * Check if an app is a browser
 */
function isBrowser(appName: string): boolean {
  const lowerAppName = appName.toLowerCase()
  return SUPPORTED_BROWSERS.some(browser => lowerAppName.includes(browser))
}

/**
 * Extract URL from window title
 * Different browsers have different title formats
 */
function extractUrlFromBrowserTitle(title: string, appName: string): string | null {
  // Try to find URL pattern in title
  const urlPattern =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/

  const match = title.match(urlPattern)
  if (match) {
    return match[0]
  }

  // Some browsers show URL in different formats
  // Chrome: "Page Title - Chrome"
  // Firefox: "Page Title — Mozilla Firefox"
  // Edge: "Page Title - Microsoft​ Edge"

  // If no direct URL match, we can't reliably extract the URL from just the title
  return null
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return ''
  }
}

/**
 * Extract page title from browser window title
 */
function extractPageTitle(windowTitle: string, browser: string): string {
  // Remove browser name from end of title
  const browserPatterns = [
    / - Google Chrome$/,
    / - Chrome$/,
    / — Mozilla Firefox$/,
    / - Firefox$/,
    / - Microsoft​ Edge$/,
    / - Edge$/,
    / - Brave$/,
    / - Opera$/,
    / - Vivaldi$/,
    / - Safari$/,
  ]

  let title = windowTitle
  for (const pattern of browserPatterns) {
    title = title.replace(pattern, '')
  }

  return title.trim()
}

/**
 * Track browser activity
 */
export async function trackBrowserActivity(activityId?: number): Promise<void> {
  try {
    const window = await activeWin()

    if (!window) {
      return
    }

    const appName = window.owner.name

    // Check if it's a browser
    if (!isBrowser(appName)) {
      return
    }

    // Extract URL from title
    const url = extractUrlFromBrowserTitle(window.title, appName)

    if (!url) {
      // No URL found, might be on a new tab page or settings
      return
    }

    const domain = extractDomain(url)
    const pageTitle = extractPageTitle(window.title, appName)

    // Insert browser history record
    insertBrowserHistory({
      timestamp: new Date().toISOString(),
      browser: appName,
      url: url,
      title: pageTitle,
      domain: domain,
      activity_id: activityId,
    })

    console.log(`Tracked browser: ${appName} - ${url}`)
  } catch (error) {
    console.error('Error tracking browser activity:', error)
  }
}

/**
 * Get browser name from app name
 */
export function getBrowserName(appName: string): string | null {
  const lowerAppName = appName.toLowerCase()

  for (const browser of SUPPORTED_BROWSERS) {
    if (lowerAppName.includes(browser)) {
      return browser.charAt(0).toUpperCase() + browser.slice(1)
    }
  }

  return null
}

/**
 * Advanced URL extraction using platform-specific methods
 * This would require additional native modules for each platform
 * For now, this is a placeholder for future implementation
 */
export async function extractBrowserUrlNative(
  browser: string,
  platform: string
): Promise<string | null> {
  // TODO: Implement native URL extraction for each platform
  // Windows: Use UI Automation or accessibility APIs
  // macOS: Use AppleScript to get URL from browsers
  // Linux: Use D-Bus or X11 properties

  // Example for macOS (would need to run AppleScript):
  // tell application "Google Chrome" to get URL of active tab of first window

  console.log('Native URL extraction not yet implemented for', browser, 'on', platform)
  return null
}

export default {
  trackBrowserActivity,
  getBrowserName,
  isBrowser,
}
