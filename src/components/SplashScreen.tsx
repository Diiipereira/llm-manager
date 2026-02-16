import { useState, useEffect } from 'react';
import { SpinnerGap } from '@phosphor-icons/react';
import splashImage from '../assets/splash.png';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Iniciando...');
  const [version, setVersion] = useState('');

  useEffect(() => {
    window.api.app.getVersion().then(v => setVersion(v));
  }, []);

  useEffect(() => {
    const messages = [
      'Iniciando...',
      'Carregando configurações...',
      'Conectando ao serviço...',
      'Verificando modelos...',
      'Preparando interface...',
    ];

    let currentProgress = 0;
    let messageIndex = 0;

    const interval = setInterval(() => {
      currentProgress += Math.random() * 15 + 5;

      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(onComplete, 300);
      }

      setProgress(Math.min(currentProgress, 100));

      const newIndex = Math.floor((currentProgress / 100) * messages.length);
      if (newIndex !== messageIndex && newIndex < messages.length) {
        messageIndex = newIndex;
        setStatus(messages[messageIndex]);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="h-full w-full bg-app flex items-center justify-center font-quicksand">
      <div className="flex flex-col items-center">
        <img
          src={splashImage}
          alt="LLM Manager"
          className="w-64 h-64 object-contain"
        />
        <p className="text-sm text-text-muted mt-3 mb-5">Gerenciador Local de Modelos</p>

        <div className="w-48 flex flex-col items-center">
          <div className="w-full h-1 bg-hover rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-accent rounded-full transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center gap-2 text-text-muted">
            <SpinnerGap size={14} className="animate-spin" />
            <span className="text-xs">{status}</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 text-[10px] text-text-muted opacity-50">
        v{version}
      </div>
    </div>
  );
}
