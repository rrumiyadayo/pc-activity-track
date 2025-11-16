import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),

  // Activity tracking
  onTrackingToggle: (callback: (enabled: boolean) => void) => {
    ipcRenderer.on('toggle-tracking', (_event, enabled) => callback(enabled))
  },

  // Database operations
  getActivities: (params: { startDate?: string; endDate?: string; limit?: number }) =>
    ipcRenderer.invoke('db:get-activities', params),
  getActivityStats: (params: { startDate?: string; endDate?: string }) =>
    ipcRenderer.invoke('db:get-activity-stats', params),
  getAppUsage: (params: { startDate?: string; endDate?: string }) =>
    ipcRenderer.invoke('db:get-app-usage', params),
  getScreenshots: (params: { startDate?: string; endDate?: string; limit?: number }) =>
    ipcRenderer.invoke('db:get-screenshots', params),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings: Record<string, unknown>) =>
    ipcRenderer.invoke('settings:update', settings),

  // Privacy
  deleteDataRange: (params: { startDate: string; endDate: string }) =>
    ipcRenderer.invoke('privacy:delete-range', params),
  pauseTracking: () => ipcRenderer.invoke('tracking:pause'),
  resumeTracking: () => ipcRenderer.invoke('tracking:resume'),
  getTrackingStatus: () => ipcRenderer.invoke('tracking:status'),

  // Export
  exportData: (params: { format: 'csv' | 'json'; startDate?: string; endDate?: string }) =>
    ipcRenderer.invoke('export:data', params),
})

// Type definitions for TypeScript
export type ElectronAPI = {
  getAppVersion: () => Promise<string>
  minimizeToTray: () => Promise<void>
  onTrackingToggle: (callback: (enabled: boolean) => void) => void
  getActivities: (params: {
    startDate?: string
    endDate?: string
    limit?: number
  }) => Promise<unknown[]>
  getActivityStats: (params: { startDate?: string; endDate?: string }) => Promise<unknown>
  getAppUsage: (params: { startDate?: string; endDate?: string }) => Promise<unknown[]>
  getScreenshots: (params: {
    startDate?: string
    endDate?: string
    limit?: number
  }) => Promise<unknown[]>
  getSettings: () => Promise<Record<string, unknown>>
  updateSettings: (settings: Record<string, unknown>) => Promise<void>
  deleteDataRange: (params: { startDate: string; endDate: string }) => Promise<void>
  pauseTracking: () => Promise<void>
  resumeTracking: () => Promise<void>
  getTrackingStatus: () => Promise<{ isTracking: boolean }>
  exportData: (params: {
    format: 'csv' | 'json'
    startDate?: string
    endDate?: string
  }) => Promise<string>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
