const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { handleOllamaEvents } = require('./handlers/ollama.cjs');
const { handleSettingsEvents, loadSettings } = require('./handlers/settings.cjs');

let tray = null;
let isQuitting = false;
let mainWindow = null;

function getIconPath() {
  if (process.env.NODE_ENV === 'development') {
    return path.join(__dirname, '../public/logo.ico');
  }
  return path.join(process.resourcesPath, 'public/logo.ico');
}

function createWindow() {
  const iconPath = getIconPath();

  mainWindow = new BrowserWindow({
    width: 500,
    height: 700,
    minWidth: 400,
    minHeight: 600,
    backgroundColor: '#1a1c1e',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    autoHideMenuBar: true,
    frame: false,
    titleBarStyle: 'hidden',
    icon: iconPath,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  ipcMain.handle('window:minimize', () => {
    mainWindow.minimize();
  });

  ipcMain.handle('window:close', () => {
    const settings = loadSettings();
    if (settings.minimizeToTray) {
      mainWindow.hide();
    } else {
      isQuitting = true;
      mainWindow.close();
    }
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      const settings = loadSettings();
      if (settings.minimizeToTray) {
        event.preventDefault();
        mainWindow.hide();
      }
    }
  });

  return mainWindow;
}

function createTray(win) {
  try {
    const iconPath = getIconPath();
    const icon = nativeImage.createFromPath(iconPath);
    const trayIcon = icon.resize({ width: 24, height: 24 });

    tray = new Tray(trayIcon);
    tray.setToolTip('LLM Manager');

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Abrir',
        click: () => win.show()
      },
      {
        label: 'Sair',
        click: () => {
          isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
      win.show();
    });
  } catch {
  }
}

app.whenReady().then(() => {
  handleOllamaEvents(ipcMain);
  handleSettingsEvents(ipcMain);

  ipcMain.handle('app:version', () => {
    return app.getVersion();
  });

  const win = createWindow();
  createTray(win);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const newWin = createWindow();
      createTray(newWin);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
