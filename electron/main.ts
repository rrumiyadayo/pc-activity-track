import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

// Database imports
import { initDatabase, closeDatabase, cleanupOldData } from './database/init'
import * as queries from './database/queries'

// Tracker imports
import {
  initializeTracking,
  startTracking,
  stopTracking,
  pauseTracking,
  resumeTracking,
  getTrackingStatus,
} from './trackers/tracking-manager'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit()
}

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../assets/icon.png'),
  })

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Handle window close to minimize to tray instead
  mainWindow.on('close', event => {
    if (!app.isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

const createTray = () => {
  // Create a simple tray icon (you'll need to add an actual icon file)
  const icon = nativeImage.createEmpty()
  tray = new Tray(icon)

  const updateTrayMenu = (isTracking: boolean) => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: () => {
          mainWindow?.show()
        },
      },
      {
        label: isTracking ? 'Pause Tracking' : 'Resume Tracking',
        click: () => {
          if (isTracking) {
            pauseTracking()
          } else {
            resumeTracking()
          }
          updateTrayMenu(!isTracking)
          mainWindow?.webContents.send('tracking-status-changed', getTrackingStatus())
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.isQuitting = true
          app.quit()
        },
      },
    ])

    tray?.setContextMenu(contextMenu)
  }

  // Initial menu
  const status = getTrackingStatus()
  updateTrayMenu(status.isEnabled)

  tray.setToolTip('PC Activity Tracker')

  tray.on('click', () => {
    mainWindow?.show()
  })
}

// App lifecycle
app.whenReady().then(() => {
  // Initialize database
  console.log('Initializing database...')
  initDatabase()

  // Initialize tracking
  console.log('Initializing tracking manager...')
  initializeTracking()

  // Start tracking if enabled in settings
  const trackingEnabled = queries.getSetting('trackingEnabled')
  if (trackingEnabled !== 'false') {
    console.log('Auto-starting tracking...')
    startTracking()
  }

  // Clean up old data on startup
  cleanupOldData()

  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  app.isQuitting = true

  // Stop tracking
  console.log('Stopping tracking...')
  stopTracking()

  // Close database
  console.log('Closing database...')
  closeDatabase()
})

// ==================== IPC HANDLERS ====================

// App info
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('minimize-to-tray', () => {
  mainWindow?.hide()
})

// Database operations - Activities
ipcMain.handle('db:get-activities', (_event, params) => {
  return queries.getActivities(params)
})

ipcMain.handle('db:get-activity-stats', (_event, params) => {
  return queries.getActivityStats(params)
})

ipcMain.handle('db:get-app-usage', (_event, params) => {
  return queries.getAppUsage(params)
})

// Database operations - Screenshots
ipcMain.handle('db:get-screenshots', (_event, params) => {
  return queries.getScreenshots(params)
})

// Settings
ipcMain.handle('settings:get', () => {
  return queries.getAllSettings()
})

ipcMain.handle('settings:update', (_event, settings) => {
  queries.updateMultipleSettings(settings)
  return { success: true }
})

// Privacy & Data Management
ipcMain.handle('privacy:delete-range', (_event, params) => {
  queries.deleteDataRange(params.startDate, params.endDate)
  return { success: true }
})

// Tracking control
ipcMain.handle('tracking:pause', () => {
  pauseTracking()
  return { success: true }
})

ipcMain.handle('tracking:resume', () => {
  resumeTracking()
  return { success: true }
})

ipcMain.handle('tracking:status', () => {
  return getTrackingStatus()
})

ipcMain.handle('tracking:start', () => {
  startTracking()
  return { success: true }
})

ipcMain.handle('tracking:stop', () => {
  stopTracking()
  return { success: true }
})

// Export data
ipcMain.handle('export:data', (_event, params) => {
  // TODO: Implement CSV export
  if (params.format === 'json') {
    const activities = queries.getActivities({
      startDate: params.startDate,
      endDate: params.endDate,
    })
    return JSON.stringify(activities, null, 2)
  }
  return ''
})

// Export for activity tracking modules
export { mainWindow }
