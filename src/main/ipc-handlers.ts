import { ipcMain, BrowserWindow, dialog } from 'electron';
import { writeFile } from 'fs/promises';
import * as path from 'path';

export function registerIpcHandlers(): void {
  // Auth token management
  let accessToken: string | null = null;

  ipcMain.handle('auth:get-access-token', () => accessToken);
  ipcMain.handle('auth:set-access-token', (_event, token: string) => {
    accessToken = token;
  });
  ipcMain.handle('auth:clear-tokens', () => {
    accessToken = null;
  });

  // Print PDF
  ipcMain.handle('print:pdf', async (_event, html: string) => {
    const win = new BrowserWindow({ show: false });
    try {
      await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
      win.webContents.print({ silent: false });
    } finally {
      win.close();
    }
  });

  // Print thermal receipt
  ipcMain.handle('print:thermal', async (_event, _data: string) => {
    const win = new BrowserWindow({ show: false });
    try {
      await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(_data)}`);
      win.webContents.print({ silent: true, deviceName: '' });
    } finally {
      win.close();
    }
  });

  // Save file dialog
  ipcMain.handle('file:save', async (_event, buffer: ArrayBuffer, filename: string) => {
    const result = await dialog.showSaveDialog({
      defaultPath: filename,
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    });

    if (!result.canceled && result.filePath) {
      await writeFile(result.filePath, Buffer.from(buffer));
      return result.filePath;
    }
    return null;
  });

  // Open file dialog
  ipcMain.handle('file:open', async (_event, filters?: Array<{ name: string; extensions: string[] }>) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters,
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });

  // Update
  ipcMain.handle('update:install', () => {
    const { autoUpdater } = require('electron-updater');
    autoUpdater.quitAndInstall();
  });

  // Window controls
  ipcMain.handle('window:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize();
  });
  ipcMain.handle('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win?.isMaximized()) {
      win.unmaximize();
    } else {
      win?.maximize();
    }
  });
  ipcMain.handle('window:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close();
  });
}
