import { PowerIcon, SpinnerGapIcon } from '@phosphor-icons/react';
import { useLlm } from '../../context/LlmContext';

export function ServiceButton() {
  const { status, toggleService, isLoadingService } = useLlm();

  return (
    <button
      className={`w-full max-w-xs h-12 rounded-full font-semibold text-sm cursor-pointer flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg hover:scale-[1.02] active:scale-[0.98] border-none ${status.running
        ? 'bg-hover text-text-main'
        : 'bg-accent text-on-accent hover:brightness-110'
        }`}
      onClick={toggleService}
      disabled={isLoadingService}
    >
      {isLoadingService ? (
        <SpinnerGapIcon size={18} className="animate-spin" />
      ) : (
        <PowerIcon size={18} weight="bold" />
      )}
      <span>{status.running ? 'Parar Serviço' : 'Iniciar Serviço'}</span>
    </button>
  );
}
