const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

function waitForVite(url, maxRetries = 30) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    const check = () => {
      http.get(url, (res) => {
        resolve();
      }).on('error', () => {
        retries++;
        if (retries >= maxRetries) {
          reject(new Error('Vite dev server timed out'));
        } else {
          setTimeout(check, 300);
        }
      });
    };
    check();
  });
}

async function start() {
  console.log('🌸 Starting Vite dev server...');
  const vite = spawn('npx', ['vite'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.resolve(__dirname, '..')
  });

  try {
    await waitForVite('http://localhost:5173');
    console.log('⚡ Vite ready, building Electron main process...');

    // Run build electron
    require('./build-electron.cjs');

    console.log('🚀 Launching Electron...');
    const electron = spawn('npx', ['electron', '.'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        VITE_DEV_SERVER_URL: 'http://localhost:5173',
      },
      cwd: path.resolve(__dirname, '..')
    });

    electron.on('close', () => {
      vite.kill();
      process.exit(0);
    });

    process.on('SIGINT', () => {
      electron.kill();
      vite.kill();
      process.exit(0);
    });
  } catch (err) {
    console.error('Failed to start development environment:', err);
    vite.kill();
    process.exit(1);
  }
}

start();
