const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const { build } = require('./build-electron.cjs');

function isPortOpen(url) {
  return new Promise((resolve) => {
    const req = http.get(url, () => resolve(true));
    req.on('error', () => resolve(false));
    req.setTimeout(500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function waitForVite(url, maxRetries = 40) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    const check = () => {
      http.get(url, () => {
        resolve();
      }).on('error', () => {
        retries++;
        if (retries >= maxRetries) {
          reject(new Error('Vite dev server timed out'));
        } else {
          setTimeout(check, 200);
        }
      });
    };
    check();
  });
}

async function start() {
  console.log('🌸 Starting Chatty in development mode...');

  // 1. Build Electron main/preload scripts
  await build();

  // 2. Check if Vite is already running on port 5173
  const alreadyRunning = await isPortOpen('http://localhost:5173');
  let viteProcess = null;

  if (!alreadyRunning) {
    viteProcess = spawn('npx', ['vite'], {
      stdio: 'inherit',
      shell: true,
      cwd: path.resolve(__dirname, '..'),
    });
    await waitForVite('http://localhost:5173');
  }

  console.log('⚡ Connected to Vite dev server at http://localhost:5173');
  console.log('🚀 Launching Electron window...');

  const electron = spawn('npx', ['electron', '.'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
      VITE_DEV_SERVER_URL: 'http://localhost:5173',
    },
    cwd: path.resolve(__dirname, '..'),
  });

  electron.on('close', (code) => {
    if (viteProcess) viteProcess.kill();
    process.exit(code || 0);
  });

  const cleanup = () => {
    electron.kill();
    if (viteProcess) viteProcess.kill();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

start();
