import { CubeIcon, TrashIcon, SpinnerGapIcon } from '@phosphor-icons/react';
import { useLlm } from '../context/LlmContext';
import { useNavigate } from 'react-router-dom';

export function ModelsPage() {
  const { models, status, handleDelete, deletingId } = useLlm();
  const navigate = useNavigate();

  const formatSize = (size: string) => {
    return size;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';

    const match = dateString.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();

      const unitMap: Record<string, string> = {
        'second': 'segundo',
        'minute': 'minuto',
        'hour': 'hora',
        'day': 'dia',
        'week': 'semana',
        'month': 'mês',
        'year': 'ano'
      };

      const pluralMap: Record<string, string> = {
        'second': 'segundos',
        'minute': 'minutos',
        'hour': 'horas',
        'day': 'dias',
        'week': 'semanas',
        'month': 'meses',
        'year': 'anos'
      };

      if (unit === 'day' && value === 0) return 'hoje';
      if (unit === 'day' && value === 1) return 'ontem';
      if (unit === 'hour' && value < 24) return `há ${value} ${value === 1 ? unitMap[unit] : pluralMap[unit]}`;

      return `há ${value} ${value === 1 ? unitMap[unit] : pluralMap[unit]}`;
    }

    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('pt-BR');
      }
    } catch {
    }

    return dateString;
  };

  if (!status.running || models.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full px-6 fade-in">
        <div className="w-32 h-32 bg-card rounded-3xl flex items-center justify-center mb-6 border border-white/5">
          <CubeIcon size={64} weight="duotone" className="text-text-muted opacity-50" />
        </div>

        <h1 className="text-xl font-bold text-text-main mb-2">
          Nenhum Modelo Encontrado
        </h1>

        <p className="text-xs text-text-muted text-center mb-8 max-w-60 opacity-70 leading-relaxed">
          {!status.running
            ? 'O serviço está offline. Inicie o serviço para ver os modelos disponíveis.'
            : 'Sua biblioteca está vazia. Baixe um modelo pelo dashboard para começar a usar sua IA local.'}
        </p>

        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-accent text-on-accent rounded-full font-semibold text-sm flex items-center gap-2 hover:brightness-110 transition-all cursor-pointer border-none"
        >
          <CubeIcon size={18} weight="bold" />
          <span>Ir para Dashboard</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full px-5 py-4 fade-in overflow-hidden">
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <CubeIcon size={22} weight="duotone" className="text-accent" />
        <h2 className="text-lg font-bold text-text-main">Modelos Instalados</h2>
        <span className="bg-hover px-2 py-0.5 rounded-full text-[11px] text-text-muted font-semibold">
          {models.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2 custom-scroll">
        {models.map(model => (
          <div
            key={model.name}
            className="bg-card border border-white/5 rounded-2xl p-4 flex items-center justify-between transition-all duration-200 hover:border-accent/30 hover:bg-hover/50 shrink-0"
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-text-main">{model.name}</span>
              <div className="flex gap-3 text-[10px] text-text-muted font-mono">
                <span>{formatSize(model.size)}</span>
                <span>•</span>
                <span>{formatDate(model.modified || model.modified_at)}</span>
              </div>
            </div>

            <button
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-error/10 text-text-muted cursor-pointer transition-all duration-200 hover:bg-error/20 hover:text-error border-none"
              onClick={() => handleDelete(model.name)}
              disabled={deletingId === model.name}
            >
              {deletingId === model.name ? <SpinnerGapIcon size={16} className="animate-spin" /> : <TrashIcon size={16} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
