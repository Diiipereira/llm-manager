const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  ollama: {
    getStatus: () => ipcRenderer.invoke('ollama:status'),
    start: () => ipcRenderer.invoke('ollama:start'),
    stop: () => ipcRenderer.invoke('ollama:stop'),
    listModels: () => ipcRenderer.invoke('ollama:list-models'),
    getPort: () => ipcRenderer.invoke('ollama:get-port'),
    getRam: () => ipcRenderer.invoke('ollama:get-ram'),
    getDiskInfo: () => ipcRenderer.invoke('ollama:disk-info'),
    pullModel: (name) => ipcRenderer.invoke('ollama:pull-model', name),
    deleteModel: (name) => ipcRenderer.invoke('ollama:delete-model', name),
    getVersion: () => ipcRenderer.invoke('ollama:version'),
    checkUpdate: () => ipcRenderer.invoke('ollama:check-update'),
    openDownload: () => ipcRenderer.invoke('ollama:open-download'),
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    close: () => ipcRenderer.invoke('window:close'),
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    save: (settings) => ipcRenderer.invoke('settings:save', settings),
    reset: () => ipcRenderer.invoke('settings:reset'),
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:version'),
  }
});
