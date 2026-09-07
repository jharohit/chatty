const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const { build } = require('./build-electron.cjs');

function waitForVite(url, maxRetries = 40) {
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
          setTimeout(check, 250);
        }
      });
    };
    check();
  });
}

async function start() {
  console.log('🌸 Starting Chatty in development mode...');
  
  // 1. Build Electron main/preload scripts first
  await build();

  // 2. Start Vite dev server
  const vite = spawn('npx', ['vite'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.resolve(__dirname, '..')
  });

  try {
    await waitForVite('http://localhost:5173');
    console.log('⚡ Vite dev server is live at http://localhost:5173');

    // 3. Launch Electron with live console output
    console.log('🚀 Launching Electron window...');
    const electron = spawn('npx', ['electron', '.'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        VITE_DEV_SERVER_URL: 'http://localhost:5173',
      },
      cwd: path.resolve(__dirname, '..')
    });

    electron.on('close', (code) => {
      console.log(`Electron closed with code ${code}`);
      vite.kill();
      process.exit(0);
    });

    process.on('SIGINT', () => {
      electron.kill();
      vite.kill();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
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
