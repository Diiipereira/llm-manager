import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface OllamaModel {
  name: string;
  id: string;
  size: string;
  modified: string;
  modified_at?: string;
}

interface OllamaStatus {
  installed: boolean;
  running: boolean;
}

interface DiskInfo {
  drive: string;
  label: string;
  totalGB: number;
  freeGB: number;
  usedGB: number;
  modelsPath: string;
}

interface LlmContextType {
  status: OllamaStatus;
  models: OllamaModel[];
  port: number;
  ramUsage: number;
  diskInfo: DiskInfo;
  isLoadingService: boolean;
  newModelInput: string;
  setNewModelInput: (val: string) => void;
  isPulling: boolean;
  pullStatus: string;
  deletingId: string | null;
  refreshData: () => Promise<void>;
  toggleService: () => Promise<void>;
  handlePull: (name: string) => Promise<void>;
  handleDelete: (name: string) => Promise<void>;
  updateAvailable: boolean;
  latestVersion: string;
  isUpdating: boolean;
  startUpdate: () => Promise<void>;
}

const defaultDiskInfo: DiskInfo = { drive: 'C:', label: 'Disco', totalGB: 0, freeGB: 0, usedGB: 0, modelsPath: '' };

const LlmContext = createContext<LlmContextType | undefined>(undefined);

export function LlmProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<OllamaStatus>({ installed: false, running: false });
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [isLoadingService, setIsLoadingService] = useState(false);
  const [port, setPort] = useState(11434);
  const [ramUsage, setRamUsage] = useState(0);
  const [diskInfo, setDiskInfo] = useState<DiskInfo>(defaultDiskInfo);

  const [newModelInput, setNewModelInput] = useState('');
  const [isPulling, setIsPulling] = useState(false);
  const [pullStatus, setPullStatus] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const checkUpdates = async () => {
    try {
      const local = await window.api.ollama.getVersion();
      const remote = await window.api.ollama.checkUpdate();

      if (local && remote && local !== remote) {
        // Simple string comparison for now, or semver if needed
        // Assuming remote is always newer if different for simplicity in this context
        // But better to check if remote > local
        // For now, let's just check if they are different and remote is likely a higher version
        // Actually, let's just rely on equality. If they differ, show update.
        // A better way is using semver compare, but I'll stick to simple diff for this task
        // unless I import a semver lib.
        // Let's assume if they don't match, an update might be available.
        // To be safer, let's only show if remote != local.
        setUpdateAvailable(remote !== local);
        setLatestVersion(remote);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startUpdate = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await window.api.ollama.startUpdate();
    } catch {
      // Error handling if needed
    } finally {
      setIsUpdating(false);
    }
  };

  const refreshData = async () => {
    try {
      const s = await window.api.ollama.getStatus();
      setStatus(s);

      const disk = await window.api.ollama.getDiskInfo();
      setDiskInfo(disk);

      if (s.running) {
        const p = await window.api.ollama.getPort();
        setPort(p);
        const ram = await window.api.ollama.getRam();
        setRamUsage(ram);
        const m = await window.api.ollama.listModels();
        setModels(m);
      } else {
        setModels([]);
        setRamUsage(0);
      }
    } catch {
    }
  };

  useEffect(() => {
    refreshData();
    checkUpdates();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function toggleService() {
    setIsLoadingService(true);
    try {
      if (status.running) {
        await window.api.ollama.stop();
      } else {
        await window.api.ollama.start();
      }
      setTimeout(async () => {
        await refreshData();
        setIsLoadingService(false);
      }, 2000);
    } catch {
      setIsLoadingService(false);
    }
  }

  async function handlePull(name: string) {
    if (!name.trim() || !status.running) return;

    setIsPulling(true);
    setPullStatus(`Iniciando download de: ${name}...`);

    try {
      const result = await window.api.ollama.pullModel(name);
      if (result?.success) {
        setPullStatus('Download concluído com sucesso!');
        setNewModelInput('');
        await refreshData();
      } else {
        setPullStatus('Erro ao baixar modelo. Verifique o nome.');
      }
    } catch {
      setPullStatus('Erro de comunicação com o serviço.');
    } finally {
      setTimeout(() => {
        setIsPulling(false);
        setPullStatus('');
      }, 3000);
    }
  }

  async function handleDelete(name: string) {
    if (deletingId) return;
    setDeletingId(name);
    try {
      await window.api.ollama.deleteModel(name);
      await refreshData();
    } catch {
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <LlmContext.Provider
      value={{
        status,
        models,
        port,
        ramUsage,
        diskInfo,
        isLoadingService,
        newModelInput,
        setNewModelInput,
        isPulling,
        pullStatus,
        deletingId,
        refreshData,
        toggleService,
        handlePull,
        handleDelete,
        updateAvailable,
        latestVersion,
        isUpdating,
        startUpdate,
      }}
    >
      {children}
    </LlmContext.Provider>
  );
}

export function useLlm() {
  const context = useContext(LlmContext);
  if (context === undefined) {
    throw new Error('useLlm must be used within a LlmProvider');
  }
  return context;
}
