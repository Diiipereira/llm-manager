import { useLlm } from '../../context/LlmContext';

export function StatusCard() {
  const { status, diskInfo, ramUsage } = useLlm();

  return (
    <div className="bg-card w-full rounded-3xl p-5 flex flex-col border border-white/5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-text-main tracking-tight">
          {status.running ? 'Sistema Online' : 'Sistema Offline'}
        </h1>
        <div
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.running
            ? 'border-success text-success bg-success/10'
            : 'border-error text-error bg-error/10'
            }`}
        >
          {status.running ? 'Online' : 'Offline'}
        </div>
      </div>

      <p className="text-xs text-text-muted mb-5 leading-relaxed opacity-70">
        {status.running
          ? 'Serviço de inferência ativo e pronto para processar.'
          : 'Serviço parado. Inicie para carregar modelos.'}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-app rounded-xl p-3 flex flex-col border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-2 opacity-60">
            RAM em uso
          </span>
          <span className="text-lg font-bold text-text-main">{ramUsage} GB</span>
        </div>

        <div className="bg-app rounded-xl p-3 flex flex-col border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-2 opacity-60">
            Modelos ({diskInfo.drive})
          </span>
          <span className="text-lg font-bold text-text-main">{diskInfo.freeGB} GB</span>
          <span className="text-[10px] text-text-muted opacity-60">livre de {diskInfo.totalGB} GB</span>
        </div>
      </div>
    </div>
  );
}
