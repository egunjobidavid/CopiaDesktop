import { app, Tray, Menu, BrowserWindow, nativeImage } from 'electron';
import * as path from 'path';

let tray: Tray | null = null;

export function setupTray(mainWindow: BrowserWindow | null): void {
  const iconPath = path.join(__dirname, '../../build/tray-icon.png');
  let icon: Electron.NativeImage;

  try {
    icon = nativeImage.createFromPath(iconPath);
  } catch {
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open CopiaOS',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    { type: 'separator' },
    {
      label: 'Dashboard',
      click: () => mainWindow?.webContents.send('navigate', '/dashboard'),
    },
    {
      label: 'New Sale (POS)',
      click: () => mainWindow?.webContents.send('navigate', '/pos'),
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        (app as any).isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('CopiaOS');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}
