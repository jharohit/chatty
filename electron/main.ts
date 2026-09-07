import { app, BrowserWindow, ipcMain, shell, session } from 'electron';
import path from 'path';
import os from 'os';

// Silence non-actionable Chromium internal logs and dev security warnings
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
app.commandLine.appendSwitch('log-level', '3');
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=512');

// Modern standard macOS Chrome User Agent to guarantee Slack, WhatsApp, Google Chat compatibility
const CHROME_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36';

app.userAgentFallback = CHROME_USER_AGENT;

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 840,
    minWidth: 840,
    minHeight: 560,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 18, y: 18 },
    vibrancy: 'under-window',
    visualEffectState: 'active',
    resizable: true,
    movable: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      webviewTag: true,
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    console.log('🌸 Chatty window ready to show');
    mainWindow?.show();
  });

  // Live tail renderer logs to terminal (filter out noisy Electron security warnings)
  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    if (message.includes('Electron Security Warning')) return;
    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const lvlName = levels[level] || 'LOG';
    const src = sourceId ? path.basename(sourceId) : 'renderer';
    console.log(`[Renderer ${lvlName}] ${message} (${src}:${line})`);
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[Load Error] Code ${errorCode}: ${errorDescription} at ${validatedURL}`);
  });

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    console.error(`[Process Terminated]`, details);
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    console.log(`Connecting to Vite dev server at: ${devServerUrl}`);
    mainWindow.loadURL(devServerUrl);
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log(`Loading production bundle from: ${indexPath}`);
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Global WebContents setup (UserAgent, Permissions, and External Links)
app.on('web-contents-created', (_event, contents) => {
  // Apply standard Chrome user agent
  contents.setUserAgent(CHROME_USER_AGENT);

  // Intercept HTTP request headers to strip any residual Electron identifier
  try {
    contents.session.webRequest.onBeforeSendHeaders(
      { urls: ['*://*/*'] },
      (details, callback) => {
        details.requestHeaders['User-Agent'] = CHROME_USER_AGENT;
        if (details.requestHeaders['sec-ch-ua']) {
          details.requestHeaders['sec-ch-ua'] = '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"';
        }
        callback({ requestHeaders: details.requestHeaders });
      }
    );
  } catch {}

  // Enable microphone, camera, notification, and persistent-storage permissions
  contents.session.setPermissionRequestHandler((_webContents, permission, callback) => {
    const allowedPermissions = [
      'media',
      'geolocation',
      'notifications',
      'midi',
      'camera',
      'microphone',
      'persistent-storage',
      'storage-access',
      'clipboard-read',
      'clipboard-sanitized-write',
    ];
    callback(allowedPermissions.includes(permission));
  });

  contents.session.setPermissionCheckHandler(() => true);

  // Handle new window / link clicks
  contents.setWindowOpenHandler(({ url }) => {
    // Keep OAuth / auth popups internal if needed, else open in system browser
    if (
      url.includes('accounts.google.com') ||
      url.includes('appleid.apple.com') ||
      url.includes('github.com/login') ||
      url.includes('oauth') ||
      url.includes('slack.com/signin') ||
      url.includes('slack.com/oauth')
    ) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Automatically catch and recover from Slack unsupported-browser redirects
  contents.on('will-navigate', (event, navigationUrl) => {
    if (navigationUrl.includes('slack.com/unsupported-browser')) {
      event.preventDefault();
      contents.loadURL('https://slack.com/signin');
    }
  });

  contents.on('did-redirect-navigation', (_event, navigationUrl) => {
    if (navigationUrl.includes('slack.com/unsupported-browser')) {
      contents.loadURL('https://slack.com/signin');
    }
  });
});

// App Lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Bridge Handlers
ipcMain.handle('chatty:get-system-memory', async () => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const appMetrics = app.getAppMetrics();
    const processMem = await process.getProcessMemoryInfo();

    return {
      totalMemBytes: totalMem,
      freeMemBytes: freeMem,
      processMemoryKB: processMem.residentSet,
      appMetrics: appMetrics.map((m) => ({
        pid: m.pid,
        type: m.type,
        cpu: m.cpu.percentCPUUsage,
        memoryMB: Math.round(m.memory.workingSetSize / 1024),
      })),
    };
  } catch (err: any) {
    console.error('Error fetching system memory:', err);
    return {
      totalMemBytes: 0,
      freeMemBytes: 0,
      processMemoryKB: 0,
      appMetrics: [],
    };
  }
});

ipcMain.handle('chatty:set-badge-count', (_event, count: number) => {
  try {
    if (app.dock) {
      if (count > 0) {
        app.dock.setBadge(count > 99 ? '99+' : count.toString());
      } else {
        app.dock.setBadge('');
      }
    }
  } catch (err) {
    console.warn('Could not set dock badge:', err);
  }
  return true;
});

ipcMain.handle('chatty:open-external', (_event, url: string) => {
  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    shell.openExternal(url);
  }
});

ipcMain.handle('chatty:clear-partition-data', async (_event, partition: string) => {
  try {
    const ses = session.fromPartition(partition);
    await ses.clearStorageData({
      storages: ['cookies', 'localstorage', 'indexdb', 'websql', 'serviceworkers', 'cachestorage'],
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
});

ipcMain.handle('chatty:get-user-data-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('chatty:window-control', (_event, action: 'minimize' | 'maximize' | 'close') => {
  if (!mainWindow) return;
  if (action === 'minimize') mainWindow.minimize();
  else if (action === 'maximize') {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  } else if (action === 'close') {
    mainWindow.close();
  }
});
