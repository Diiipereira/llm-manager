import { Outlet } from 'react-router-dom';
import { TitleBar } from './TitleBar';
import { BottomNav } from './BottomNav';
import { useLlm } from '../context/LlmContext';
import { WarningIcon } from '@phosphor-icons/react';

export function Layout() {
  const { updateAvailable, startUpdate, latestVersion } = useLlm();

  return (
    <div className="h-full flex flex-col bg-app overflow-hidden font-quicksand">
      <TitleBar />

      {updateAvailable && (
        <div className="bg-accent/10 border-b border-accent/20 px-4 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-accent">
            <WarningIcon size={16} weight="fill" />
            <span>Nova versão do Ollama disponível! ({latestVersion})</span>
          </div>
          <button
            onClick={startUpdate}
            className="text-xs bg-accent text-on-accent px-3 py-1 rounded-full font-semibold hover:brightness-110 transition-all cursor-pointer border-none"
          >
            Atualizar Agora
          </button>
        </div>
      )}

      <main className="flex-1 overflow-hidden flex flex-col min-h-0">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
