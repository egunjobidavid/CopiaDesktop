import { app, Menu, BrowserWindow, MenuItemConstructorOptions } from 'electron';

export function setupMenu(mainWindow: BrowserWindow): void {
  const isMac = process.platform === 'darwin';

  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? ([
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ] as MenuItemConstructorOptions[],
          },
        ] as MenuItemConstructorOptions[])
      : []),

    {
      label: 'File',
      submenu: [
        {
          label: 'New Sale',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('navigate', '/pos'),
        },
        { type: 'separator' },
        isMac ? ({ role: 'close' } as MenuItemConstructorOptions) : ({ role: 'quit' } as MenuItemConstructorOptions),
      ] as MenuItemConstructorOptions[],
    },

    {
      label: 'Edit',
      submenu: ([
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ]) as MenuItemConstructorOptions[],
    },

    {
      label: 'View',
      submenu: ([
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ]) as MenuItemConstructorOptions[],
    },

    {
      label: 'Window',
      submenu: ([
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? ([
              { type: 'separator' },
              { role: 'front' },
              { type: 'separator' },
              { role: 'window' },
            ] as MenuItemConstructorOptions[])
          : [{ role: 'close' } as MenuItemConstructorOptions]),
      ]) as MenuItemConstructorOptions[],
    },

    {
      label: 'Help',
      submenu: [
        {
          label: 'About CopiaOS',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox({
              type: 'info',
              title: 'About CopiaOS',
              message: 'CopiaOS v1.0.0',
              detail: 'Complete ERP for Nigerian SMBs.\nBuilt with Electron + React + NestJS.',
            });
          },
        },
      ] as MenuItemConstructorOptions[],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
