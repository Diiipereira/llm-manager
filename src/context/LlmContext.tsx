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
