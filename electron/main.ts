import { app, BrowserWindow, ipcMain, shell, session, WebContents } from 'electron';
import path from 'path';
import os from 'os';

// Memory Optimization Flags
app.commandLine.appendSwitch('enable-features', 'ResourceSaver,BackgroundTabThrottling,AutomaticTabDiscarding');
app.commandLine.appendSwitch('disable-renderer-backgrounding', 'false');
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=512');

// Modern standard macOS Chrome User Agent to guarantee WhatsApp, Google Chat, and Slack compatibility
const CHROME_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

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
    backgroundColor: '#00000000',
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
    mainWindow?.show();
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Global WebContents setup (UserAgent, Permissions, and External Links)
app.on('web-contents-created', (_event, contents) => {
  // Apply standard Chrome user agent
  contents.setUserAgent(CHROME_USER_AGENT);

  // Enable microphone, camera, and notification permissions for chat calls
  contents.session.setPermissionRequestHandler((_webContents, permission, callback) => {
    const allowedPermissions = ['media', 'geolocation', 'notifications', 'midi', 'camera', 'microphone'];
    callback(allowedPermissions.includes(permission));
  });

  // Handle new window / link clicks
  contents.setWindowOpenHandler(({ url }) => {
    // Keep OAuth / auth popups internal if needed, else open in system browser
    if (
      url.includes('accounts.google.com') ||
      url.includes('appleid.apple.com') ||
      url.includes('github.com/login') ||
      url.includes('oauth')
    ) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
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
});

ipcMain.handle('chatty:set-badge-count', (_event, count: number) => {
  if (app.dock) {
    if (count > 0) {
      app.dock.setBadge(count > 99 ? '99+' : count.toString());
    } else {
      app.dock.setBadge('');
    }
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
