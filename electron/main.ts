import { app, BrowserWindow, ipcMain, shell, session, Notification } from 'electron';
import path from 'path';
import os from 'os';
import fs from 'fs';

// App Identity for macOS Application Menu Bar
app.setName('Chatty');

// Silence non-actionable Chromium internal logs and dev security warnings
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
app.commandLine.appendSwitch('log-level', '3');
app.commandLine.appendSwitch('disable-blink-features', 'AutomationControlled');
app.commandLine.appendSwitch('disable-features', 'ThirdPartyStoragePartitioning,ThirdPartyCookieDeprecation');

// Hardware acceleration & GPU rendering flags for 60/120fps macOS compositing
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-native-gpu-memory-buffers');
app.commandLine.appendSwitch('enable-features', 'CanvasOopRasterization,VaapiVideoDecoder,OverlayScrollbar');

// Modern standard macOS Chrome User Agent matching Electron 44 Chromium 152 build
const CHROME_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.7977.76 Safari/537.36';

// Firefox User Agent for Google Accounts & Gemini authentication
const FIREFOX_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0';

app.userAgentFallback = CHROME_USER_AGENT;

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const iconPath = path.join(__dirname, '../public/icon.png');

  mainWindow = new BrowserWindow({
    title: 'Chatty',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
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
      sandbox: false,
      spellcheck: true,
      webgl: true,
    },
  });

  if (app.dock && fs.existsSync(iconPath)) {
    try {
      app.dock.setIcon(iconPath);
    } catch {}
  }

  mainWindow.webContents.on('preload-error', (_event, preloadPath, error) => {
    console.error(`[Preload Error] ${preloadPath}:`, error);
  });

  mainWindow.once('ready-to-show', () => {
    console.log('🌸 chatty window ready to show');
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
  // Apply standard Chrome user agent by default
  contents.setUserAgent(CHROME_USER_AGENT);

  if (contents.getType() === 'webview') {
    contents.on('console-message', (_e, _level, msg) => {
      if (msg.includes('Google') || msg.includes('oauth') || msg.includes('sign') || msg.includes('Error')) {
        console.log(`[Webview Console] ${msg}`);
      }
    });
  }

  contents.on('will-navigate', (_e, url) => {
    console.log(`[Main will-navigate] ${contents.getType()}:`, url);
  });
  contents.on('did-redirect-navigation', (_e, url) => {
    console.log(`[Main did-redirect] ${contents.getType()}:`, url);
  });
  contents.on('did-navigate', (_e, url) => {
    console.log(`[Main did-navigate] ${contents.getType()}:`, url);
  });

  // Intercept Google OAuth requests and Slack SSB redirects
  try {
    contents.session.webRequest.onBeforeRequest(
      { urls: ['https://accounts.google.com/o/oauth2/auth*', '*://*.slack.com/*'] },
      (details, callback) => {
        // Enforce account chooser for Google OAuth
        if (details.url.includes('accounts.google.com/o/oauth2/auth')) {
          try {
            const urlObj = new URL(details.url);
            const currentPrompt = urlObj.searchParams.get('prompt');
            if (currentPrompt !== 'select_account') {
              urlObj.searchParams.set('prompt', 'select_account');
              console.log('[Google SSO] Enforcing prompt=select_account');
              callback({ redirectURL: urlObj.toString() });
              return;
            }
          } catch {}
        }

        // Intercept Slack Desktop App (SSB) redirects and route to Web Client
        if (details.url.includes('ssb/redirect') || details.url.includes('%2Fssb%2Fredirect')) {
          const webUrl = details.url
            .replace('/ssb/redirect?entry_point=signin', '/client')
            .replace('redir=%2Fssb%2Fredirect%3Fentry_point%3Dsignin', 'redir=%2Fclient');
          console.log('[Slack SSO] Redirecting SSB flow to Web Client flow:', webUrl);
          callback({ redirectURL: webUrl });
          return;
        }

        callback({});
      }
    );
  } catch {}

  // Intercept HTTP response headers from Slack to monitor SSO response
  try {
    contents.session.webRequest.onHeadersReceived(
      { urls: ['*://*.slack.com/*'] },
      (details, callback) => {
        if (details.url.includes('sso/google') || details.url.includes('sso_failed')) {
          console.log(`[Slack Response ${details.statusCode}]:`, details.url);
          if (details.responseHeaders) {
            const loc = details.responseHeaders['location'] || details.responseHeaders['Location'];
            if (loc) console.log('[Slack Location Header]:', loc);
          }
        }
        callback({ responseHeaders: details.responseHeaders });
      }
    );
  } catch {}

  // Intercept HTTP request headers to strip any residual Electron identifier
  try {
    contents.session.webRequest.onBeforeSendHeaders(
      { urls: ['*://*/*'] },
      (details, callback) => {
        const url = details.url.toLowerCase();
        // Identify all Google requests (Gemini, Google Accounts, Google Auth)
        const isGoogle =
          url.includes('google.com') ||
          url.includes('google.co') ||
          url.includes('gstatic.com') ||
          url.includes('googleusercontent.com');

        // Slack requests should maintain consistent Chrome User-Agent
        const isSlack = url.includes('slack.com');

        if (url.includes('slack.com/sso/google')) {
          console.log('[Slack SSO Callback Request]:', details.url);
          console.log(
            '[Slack SSO Cookie Header]:',
            details.requestHeaders['Cookie']
              ? `Present (${details.requestHeaders['Cookie'].length} bytes)`
              : 'MISSING!'
          );
        }

        if (isGoogle && !isSlack) {
          // Send pure Firefox User-Agent across ALL Google requests (Gemini & Google Accounts)
          // Completely eliminates Google's "This browser or app may not be secure" block
          details.requestHeaders['User-Agent'] = FIREFOX_USER_AGENT;
          delete details.requestHeaders['sec-ch-ua'];
          delete details.requestHeaders['sec-ch-ua-mobile'];
          delete details.requestHeaders['sec-ch-ua-platform'];
          delete details.requestHeaders['sec-ch-ua-platform-version'];
          delete details.requestHeaders['sec-ch-ua-arch'];
          delete details.requestHeaders['sec-ch-ua-bitness'];
          delete details.requestHeaders['sec-ch-ua-model'];
          delete details.requestHeaders['sec-ch-ua-full-version'];
          delete details.requestHeaders['sec-ch-ua-full-version-list'];
        } else {
          // Send standard Chrome User-Agent across Slack and all other services
          details.requestHeaders['User-Agent'] = CHROME_USER_AGENT;
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
    console.log('[Main setWindowOpenHandler requested]:', url);

    // Slack: ALL Slack URLs (workspace open, channels, messages, client) MUST load directly in the webview!
    // Never open separate blank floating windows for Slack
    if (url.includes('slack.com')) {
      let targetUrl = url;
      if (targetUrl.includes('ssb/redirect') || targetUrl.includes('slack://')) {
        targetUrl = 'https://app.slack.com/client';
      }
      setImmediate(() => {
        contents.loadURL(targetUrl);
      });
      return { action: 'deny' };
    }

    // Google OAuth (Slack Sign in with Google) & authentication popups:
    // Allow popup window so OAuth handshake can complete and postMessage back to window.opener
    if (
      url.includes('accounts.google.com') ||
      url.includes('google.com/accounts') ||
      url.includes('appleid.apple.com') ||
      url.includes('github.com/login') ||
      url.includes('oauth') ||
      url.includes('auth') ||
      url.includes('login') ||
      url.includes('signin')
    ) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 520,
          height: 680,
          autoHideMenuBar: true,
          title: 'Sign in with Google',
          webPreferences: {
            contextIsolation: true,
            sandbox: false,
          },
        },
      };
    }

    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Automatically catch and recover from Slack unsupported-browser redirects & deep links
  contents.on('will-navigate', (event, navigationUrl) => {
    if (navigationUrl.startsWith('slack://')) {
      event.preventDefault();
      const webUrl = navigationUrl.replace('slack://', 'https://app.slack.com/');
      contents.loadURL(webUrl);
      return;
    }
    if (navigationUrl.includes('slack.com/unsupported-browser')) {
      event.preventDefault();
      contents.loadURL('https://slack.com/workspace-signin');
    }
  });

  contents.on('did-redirect-navigation', (_event, navigationUrl) => {
    if (navigationUrl.includes('slack.com/unsupported-browser')) {
      contents.loadURL('https://slack.com/workspace-signin');
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
      storages: ['cookies', 'localstorage', 'indexdb', 'serviceworkers', 'cachestorage'],
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

ipcMain.handle(
  'chatty:show-notification',
  (_event, { title, body, serviceId }: { title: string; body: string; serviceId?: string }) => {
    try {
      if (Notification.isSupported()) {
        const iconPath = path.join(__dirname, '../public/icon.png');
        const notif = new Notification({
          title: title || 'Chatty',
          body: body || 'New message received',
          icon: fs.existsSync(iconPath) ? iconPath : undefined,
          silent: false,
        });

        notif.on('click', () => {
          if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
            if (serviceId) {
              mainWindow.webContents.send('chatty:activate-service', serviceId);
            }
          }
        });

        notif.show();
        return true;
      }
    } catch (err) {
      console.warn('Could not display notification:', err);
    }
    return false;
  }
);
