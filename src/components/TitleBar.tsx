import { XIcon, MinusIcon } from '@phosphor-icons/react';

export function TitleBar() {
  const handleMinimize = () => {
    window.api.window.minimize();
  };

  const handleClose = () => {
    window.api.window.close();
  };

  return (
    <div className="h-9 bg-titlebar flex items-center justify-between px-4 shrink-0 border-b border-white/5">
      <div className="flex-1 h-full flex items-center [-webkit-app-region:drag]">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_rgba(168,199,250,0.4)]" />
          <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
            LLM Manager
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 [-webkit-app-region:no-drag]">
        <button
          onClick={handleMinimize}
          className="w-6 h-6 flex items-center justify-center rounded-lg bg-transparent text-text-muted hover:bg-hover hover:text-text-main transition-all cursor-pointer border-none"
          title="Minimizar"
        >
          <MinusIcon size={14} weight="bold" />
        </button>
        <button
          onClick={handleClose}
          className="w-6 h-6 flex items-center justify-center rounded-lg bg-transparent text-text-muted hover:bg-error hover:text-[#3e0000] transition-all cursor-pointer border-none"
          title="Fechar"
        >
          <XIcon size={14} weight="bold" />
        </button>
      </div>
    </div>
  );
}
