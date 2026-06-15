import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Auth
  getAccessToken: () => ipcRenderer.invoke('auth:get-access-token'),
  setAccessToken: (token: string) => ipcRenderer.invoke('auth:set-access-token', token),
  clearTokens: () => ipcRenderer.invoke('auth:clear-tokens'),

  // Printing
  printPDF: (html: string) => ipcRenderer.invoke('print:pdf', html),
  printThermal: (data: string) => ipcRenderer.invoke('print:thermal', data),

  // File dialogs
  saveFile: (buffer: ArrayBuffer, filename: string) =>
    ipcRenderer.invoke('file:save', buffer, filename),
  openFile: (filters?: Array<{ name: string; extensions: string[] }>) =>
    ipcRenderer.invoke('file:open', filters),

  // Updates
  checkForUpdates: () => ipcRenderer.invoke('update:check'),
  downloadUpdate: () => ipcRenderer.invoke('update:download'),
  installUpdate: () => ipcRenderer.invoke('update:install'),
  onUpdateStatus: (callback: (status: string) => void) =>
    ipcRenderer.on('update-status', (_event, status) => callback(status)),
  onUpdateAvailable: (callback: (info: any) => void) =>
    ipcRenderer.on('update-available', (_event, info) => callback(info)),
  onUpdateProgress: (callback: (progress: any) => void) =>
    ipcRenderer.on('update-progress', (_event, progress) => callback(progress)),
  onUpdateReady: (callback: () => void) =>
    ipcRenderer.on('update-ready', () => callback()),
  onUpdateError: (callback: (error: string) => void) =>
    ipcRenderer.on('update-error', (_event, error) => callback(error)),

  // Window controls
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
});
