import { MagnifyingGlassIcon, DownloadSimpleIcon, SpinnerGapIcon } from '@phosphor-icons/react';
import { useLlm } from '../../context/LlmContext';

export function ModelInput() {
  const { status, newModelInput, setNewModelInput, handlePull, isPulling, pullStatus } = useLlm();

  return (
    <div className="w-full">
      <div className="bg-card/80 rounded-full flex items-center px-5 py-3 gap-3 border border-white/5 transition-colors focus-within:border-accent/30">
        <MagnifyingGlassIcon size={18} className="text-text-muted opacity-50 shrink-0" />
        <input
          className="flex-1 bg-transparent border-none text-text-main text-sm placeholder:text-text-muted/50 outline-none"
          placeholder="Adicionar Modelo (ex: llama3:8b)"
          value={newModelInput}
          onChange={(e) => setNewModelInput(e.target.value)}
          disabled={!status.running || isPulling}
          onKeyDown={(e) => e.key === 'Enter' && handlePull(newModelInput)}
        />
        <button
          className="w-8 h-8 rounded-full bg-hover/50 text-text-muted flex items-center justify-center cursor-pointer transition-all hover:bg-accent hover:text-on-accent disabled:opacity-30 disabled:cursor-not-allowed shrink-0 border-none"
          onClick={() => handlePull(newModelInput)}
          disabled={!status.running || !newModelInput || isPulling}
        >
          {isPulling ? (
            <SpinnerGapIcon className="animate-spin" size={16} />
          ) : (
            <DownloadSimpleIcon size={16} weight="bold" />
          )}
        </button>
      </div>

      <div className="h-5 mt-1 flex items-center justify-center">
        {(pullStatus || isPulling) && (
          <span className="text-xs font-medium text-accent animate-pulse">{pullStatus}</span>
        )}
      </div>
    </div>
  );
}
