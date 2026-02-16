const { app } = require('electron');
const path = require('path');
const fs = require('fs');

const settingsPath = path.join(app.getPath('userData'), 'settings.json');

const defaultSettings = {
  startWithWindows: false,
  minimizeToTray: false,
};

function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch {
    return { ...defaultSettings };
  }
  return { ...defaultSettings };
}

function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch {
    return false;
  }
}

function setAutoStart(enabled) {
  try {
    if (process.platform === 'win32') {
      app.setLoginItemSettings({
        openAtLogin: enabled,
        path: app.getPath('exe'),
        args: []
      });
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

function getAutoStartStatus() {
  try {
    const settings = app.getLoginItemSettings();
    return settings.openAtLogin;
  } catch {
    return false;
  }
}

function handleSettingsEvents(ipcMain) {
  ipcMain.handle('settings:get', () => {
    const settings = loadSettings();
    const autoStartEnabled = getAutoStartStatus();
    return { ...settings, startWithWindows: autoStartEnabled };
  });

  ipcMain.handle('settings:save', async (_, newSettings) => {
    try {
      setAutoStart(newSettings.startWithWindows);
      saveSettings(newSettings);
      const autoStartEnabled = getAutoStartStatus();
      return { success: true, settings: { ...newSettings, startWithWindows: autoStartEnabled } };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('settings:reset', async () => {
    try {
      setAutoStart(false);
      saveSettings(defaultSettings);
      const autoStartEnabled = getAutoStartStatus();
      return { success: true, settings: { startWithWindows: autoStartEnabled, minimizeToTray: false } };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('settings:getMinimizeToTray', () => {
    const settings = loadSettings();
    return settings.minimizeToTray;
  });
}

module.exports = { handleSettingsEvents, loadSettings };
