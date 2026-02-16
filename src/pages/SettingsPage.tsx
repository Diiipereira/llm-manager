import { useState, useEffect, useCallback } from 'react';
import { GlobeIcon, RocketIcon, TrayIcon, FloppyDiskIcon, ArrowCounterClockwiseIcon, CheckIcon, InfoIcon } from '@phosphor-icons/react';
import { useLlm } from '../context/LlmContext';

interface Settings {
  startWithWindows: boolean;
  minimizeToTray: boolean;
}

const defaultSettings: Settings = {
  startWithWindows: false,
  minimizeToTray: false,
};

export function SettingsPage() {
  const { port } = useLlm();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<Settings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState('');

  useEffect(() => {
    window.api.app.getVersion().then(v => setVersion(v));
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await window.api.settings.get();
      setSettings({ ...data });
      setOriginalSettings({ ...data });
      setHasChanges(false);
      setSaved(false);
    } catch {
      // Use default settings on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    const changed = settings.startWithWindows !== originalSettings.startWithWindows ||
      settings.minimizeToTray !== originalSettings.minimizeToTray;
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const handleToggle = (key: keyof Settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      const result = await window.api.settings.save(settings);
      if (result.success && result.settings) {
        setSettings({ ...result.settings });
        setOriginalSettings({ ...result.settings });
        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // Silently fail
    }
  };

  const handleReset = async () => {
    try {
      const result = await window.api.settings.reset();
      if (result.success && result.settings) {
        setSettings({ ...result.settings });
        setOriginalSettings({ ...result.settings });
        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // Silently fail
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-text-muted">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full px-5 py-4 fade-in">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-text-main mb-1">Configurações</h1>
        <p className="text-xs text-text-muted opacity-70">Configure seu ambiente local de LLM</p>
      </div>

      <div className="mb-5 shrink-0">
        <div className="text-[10px] uppercase tracking-widest text-accent font-bold mb-2">Rede</div>
        <div className="bg-card border border-white/5 p-4 flex items-center gap-4 rounded-2xl">
          <div className="w-9 h-9 bg-app rounded-xl flex items-center justify-center">
            <GlobeIcon size={18} className="text-text-muted" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-text-main">Porta da API</div>
            <div className="text-[10px] text-text-muted opacity-70">Porta para acesso local ao servidor</div>
          </div>
          <div className="bg-app px-3 py-1.5 rounded-xl font-mono text-sm text-accent border border-white/5">{port}</div>
        </div>
      </div>

      <div className="mb-5 shrink-0">
        <div className="text-[10px] uppercase tracking-widest text-accent font-bold mb-2">Aplicativo</div>
        <div className="flex flex-col gap-2">
          <div className="bg-card border border-white/5 p-4 flex items-center gap-4 rounded-2xl">
            <div className="w-9 h-9 bg-app rounded-xl flex items-center justify-center">
              <RocketIcon size={18} className="text-text-muted" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-text-main">Iniciar com Windows</div>
              <div className="text-[10px] text-text-muted opacity-70">Abrir automaticamente ao fazer login</div>
            </div>
            <ToggleSwitch
              enabled={settings.startWithWindows}
              onClick={() => handleToggle('startWithWindows')}
            />
          </div>

          <div className="bg-card border border-white/5 p-4 flex items-center gap-4 rounded-2xl">
            <div className="w-9 h-9 bg-app rounded-xl flex items-center justify-center">
              <TrayIcon size={18} className="text-text-muted" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-text-main">Minimizar para Bandeja</div>
              <div className="text-[10px] text-text-muted opacity-70">Continuar rodando em segundo plano</div>
            </div>
            <ToggleSwitch
              enabled={settings.minimizeToTray}
              onClick={() => handleToggle('minimizeToTray')}
            />
          </div>
        </div>
      </div>

      <div className="mb-5 shrink-0">
        <div className="text-[10px] uppercase tracking-widest text-accent font-bold mb-2">Sobre</div>
        <div className="bg-card border border-white/5 p-4 flex items-center gap-4 rounded-2xl">
          <div className="w-9 h-9 bg-app rounded-xl flex items-center justify-center">
            <InfoIcon size={18} className="text-text-muted" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-text-main">LLM Manager</div>
            <div className="text-[10px] text-text-muted opacity-70">Gerenciador Local de Modelos</div>
          </div>
          <div className="bg-app px-3 py-1.5 rounded-xl font-mono text-sm text-accent border border-white/5">v{version}</div>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center justify-center gap-3 py-3 shrink-0">
        <button
          onClick={handleReset}
          className="px-4 py-2.5 text-text-muted text-sm font-semibold hover:text-text-main transition-colors cursor-pointer bg-transparent border-none flex items-center gap-2"
        >
          <ArrowCounterClockwiseIcon size={16} />
          <span>Restaurar Padrões</span>
        </button>
        <button
          onClick={handleSave}
          disabled={!hasChanges && !saved}
          className={`px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer border-none ${saved
              ? 'bg-success text-on-accent'
              : hasChanges
                ? 'bg-accent text-on-accent hover:brightness-110'
                : 'bg-hover text-text-muted cursor-not-allowed'
            }`}
        >
          {saved ? <CheckIcon size={16} weight="bold" /> : <FloppyDiskIcon size={16} weight="bold" />}
          <span>{saved ? 'Salvo!' : 'Salvar Alterações'}</span>
        </button>
      </div>
    </div>
  );
}

function ToggleSwitch({ enabled, onClick, disabled }: { enabled: boolean; onClick?: () => void; disabled?: boolean }) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`w-11 h-6 rounded-full transition-all duration-200 flex items-center px-0.5 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        } ${enabled ? 'bg-accent' : 'bg-hover'}`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
      />
    </div>
  );
}
