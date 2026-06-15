import { autoUpdater } from 'electron-updater';
import { BrowserWindow, ipcMain } from 'electron';

export function setupAutoUpdater(mainWindow: BrowserWindow): void {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on('checking-for-update', () => {
    mainWindow.webContents.send('update-status', 'checking');
  });

  autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('update-available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });
  });

  autoUpdater.on('update-not-available', () => {
    mainWindow.webContents.send('update-status', 'up-to-date');
  });

  autoUpdater.on('download-progress', (progress) => {
    mainWindow.webContents.send('update-progress', {
      percent: Math.round(progress.percent),
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-ready');
  });

  autoUpdater.on('error', (err) => {
    mainWindow.webContents.send('update-error', err.message);
  });

  // IPC: trigger update check
  ipcMain.handle('update:check', () => {
    try {
      autoUpdater.checkForUpdates();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // IPC: download update
  ipcMain.handle('update:download', () => {
    try {
      autoUpdater.downloadUpdate();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // IPC: install and restart
  ipcMain.handle('update:install', () => {
    autoUpdater.quitAndInstall(true, true);
  });

  // Check for updates after a short delay
  setTimeout(() => {
    try {
      autoUpdater.checkForUpdates();
    } catch {
      // Silently fail in dev mode
    }
  }, 10000);
}
