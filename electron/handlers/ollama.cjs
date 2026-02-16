const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { windowsHide: true, maxBuffer: 1024 * 1024 * 5 }, (error, stdout) => {
      if (error) {
        reject(error.message);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

module.exports = {
  handleOllamaEvents: (ipcMain) => {
    ipcMain.handle('ollama:status', async () => {
      try {
        const output = await runCommand('tasklist');
        const isRunning = /ollama\.exe/i.test(output) || /ollama app\.exe/i.test(output);
        if (isRunning) return { installed: true, running: true };
        const version = await runCommand('ollama --version').catch(() => null);
        return { installed: !!version, running: false };
      } catch {
        return { installed: false, running: false };
      }
    });

    ipcMain.handle('ollama:start', async () => {
      const homeDir = os.homedir();
      const env = {
        ...process.env,
        OLLAMA_HOST: '127.0.0.1:11434',
      };

      const localAppData = process.env.LOCALAPPDATA;
      const ollamaCliPath = path.join(localAppData, 'Programs', 'Ollama', 'ollama.exe');

      if (fs.existsSync(ollamaCliPath)) {
        const ollamaProcess = spawn(ollamaCliPath, ['serve'], {
          detached: true,
          stdio: 'ignore',
          windowsHide: true,
          env: env,
        });
        ollamaProcess.unref();
      }

      return 'Started';
    });

    ipcMain.handle('ollama:stop', async () => {
      const commands = [
        'taskkill /F /IM "Ollama App.exe" /T',
      ];
      for (const cmd of commands) {
        await runCommand(cmd).catch(() => { });
      }
      return 'Stopped';
    });

    ipcMain.handle('ollama:list-models', async () => {
      try {
        const output = await runCommand('ollama list');
        if (!output) return [];
        const lines = output.split('\n').slice(1);
        const models = lines
          .map((line) => {
            const parts = line.trim().split(/\s+/);
            if (parts.length < 4) return null;
            return {
              name: parts[0],
              id: parts[1],
              size: `${parts[2]} ${parts[3]}`,
              modified: parts.slice(4).join(' '),
            };
          })
          .filter(Boolean);
        return models;
      } catch {
        return [];
      }
    });

    ipcMain.handle('ollama:get-port', async () => {
      try {
        const cmd = `
          $p = Get-Process -Name ollama, "ollama app" -ErrorAction SilentlyContinue; 
          if ($p) { 
            Get-NetTCPConnection -State Listen -OwningProcess $p.Id -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty LocalPort 
          }
        `;
        const output = await runCommand(`powershell -Command "${cmd.replace(/\n/g, ' ')}"`);
        const port = parseInt(output.trim());
        return isNaN(port) ? 11434 : port;
      } catch {
        return 11434;
      }
    });

    ipcMain.handle('ollama:get-ram', async () => {
      try {
        const cmd = `Get-Process -Name ollama, "ollama app", "ollama_llama_server" -ErrorAction SilentlyContinue | Measure-Object -Property WorkingSet64 -Sum | Select-Object -ExpandProperty Sum`;
        const output = await runCommand(`powershell -Command "${cmd}"`);
        const bytes = parseInt(output.trim());
        if (isNaN(bytes)) return 0;
        return Math.round((bytes / 1024 / 1024 / 1024) * 10) / 10;
      } catch {
        return 0;
      }
    });

    ipcMain.handle('ollama:disk-info', async () => {
      try {
        const modelsPath =
          process.env.OLLAMA_MODELS || path.join(os.homedir(), '.ollama', 'models');
        const modelsDrive = modelsPath.charAt(0).toUpperCase();

        const cmd = `Get-Volume -DriveLetter ${modelsDrive} | Select-Object DriveLetter, FileSystemLabel, @{N='SizeGB';E={[math]::Round($_.Size/1GB,1)}}, @{N='FreeGB';E={[math]::Round($_.SizeRemaining/1GB,1)}} | ConvertTo-Json`;
        const output = await runCommand(`powershell -Command "${cmd}"`);
        const data = JSON.parse(output);

        return {
          drive: data.DriveLetter + ':',
          label: data.FileSystemLabel || 'Disco Local',
          totalGB: data.SizeGB,
          freeGB: data.FreeGB,
          usedGB: Math.round((data.SizeGB - data.FreeGB) * 10) / 10,
          modelsPath: modelsPath,
        };
      } catch {
        return { drive: 'C:', label: 'Disco', totalGB: 0, freeGB: 0, usedGB: 0, modelsPath: '' };
      }
    });

    ipcMain.handle('ollama:pull-model', async (_, modelName) => {
      try {
        await runCommand(`ollama pull ${modelName}`);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.toString() };
      }
    });

    ipcMain.handle('ollama:delete-model', async (_, modelName) => {
      try {
        await runCommand(`ollama rm ${modelName}`);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.toString() };
      }
    });

    ipcMain.handle('ollama:version', async () => {
      try {
        const output = await runCommand('ollama --version');
        // Output format: "ollama version is 0.1.24" or "ollama version 0.1.24"
        const match = output.match(/version\s+(?:is\s+)?v?(\d+\.\d+\.\d+)/i);
        return match ? match[1] : null;
      } catch {
        return null;
      }
    });

    ipcMain.handle('ollama:check-update', async () => {
      try {
        // Fetch latest release from GitHub
        // process.versions.electron includes 'node' property, so we can use fetch if node version >= 18
        // Or use 'https' module. Using fetch for simplicity as Electron usually has modern Node.
        const response = await fetch('https://api.github.com/repos/ollama/ollama/releases/latest');
        if (!response.ok) return null;
        const data = await response.json();
        const latestVersion = data.tag_name.replace(/^v/, '');
        return latestVersion;
      } catch (e) {
        console.error('Failed to check for updates:', e);
        return null;
      }
    });

    ipcMain.handle('ollama:open-download', async () => {
      const { shell } = require('electron');
      await shell.openExternal('https://ollama.com/download');
    });
  },
};
