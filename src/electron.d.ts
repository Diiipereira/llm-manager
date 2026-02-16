export interface OllamaModel {
  name: string;
  id: string;
  size: string;
  modified: string;
  modified_at?: string;
}

export interface OllamaStatus {
  installed: boolean;
  running: boolean;
}

export interface AppSettings {
  startWithWindows: boolean;
  minimizeToTray: boolean;
}

export interface SettingsResult {
  success: boolean;
  settings: AppSettings;
  error?: string;
}

export interface DiskInfo {
  drive: string;
  label: string;
  totalGB: number;
  freeGB: number;
  usedGB: number;
  modelsPath: string;
}

declare global {
  interface Window {
    api: {
      ollama: {
        getStatus: () => Promise<OllamaStatus>;
        start: () => Promise<string>;
        stop: () => Promise<string>;
        listModels: () => Promise<OllamaModel[]>;
        getPort: () => Promise<number>;
        getRam: () => Promise<number>;
        getDiskInfo: () => Promise<DiskInfo>;
        pullModel: (name: string) => Promise<{ success: boolean; error?: string }>;
        deleteModel: (name: string) => Promise<{ success: boolean; error?: string }>;
        getVersion: () => Promise<string | null>;
        checkUpdate: () => Promise<string | null>;
        openDownload: () => Promise<void>;
      };
      window: {
        minimize: () => Promise<void>;
        close: () => Promise<void>;
      };
      settings: {
        get: () => Promise<AppSettings>;
        save: (settings: AppSettings) => Promise<SettingsResult>;
        reset: () => Promise<SettingsResult>;
      };
      app: {
        getVersion: () => Promise<string>;
      };
    };
  }
}
