"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// electron/main.ts
var import_electron = require("electron");
var import_path = __toESM(require("path"));
var import_os = __toESM(require("os"));
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
import_electron.app.commandLine.appendSwitch("log-level", "3");
import_electron.app.commandLine.appendSwitch("js-flags", "--max-old-space-size=512");
var CHROME_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.7977.76 Safari/537.36";
import_electron.app.userAgentFallback = CHROME_USER_AGENT;
var mainWindow = null;
function createWindow() {
  mainWindow = new import_electron.BrowserWindow({
    width: 1240,
    height: 840,
    minWidth: 840,
    minHeight: 560,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 18, y: 18 },
    vibrancy: "under-window",
    visualEffectState: "active",
    resizable: true,
    movable: true,
    show: false,
    webPreferences: {
      preload: import_path.default.join(__dirname, "preload.cjs"),
      webviewTag: true,
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: true
    }
  });
  mainWindow.once("ready-to-show", () => {
    console.log("\u{1F338} Chatty window ready to show");
    mainWindow?.show();
  });
  mainWindow.webContents.on("console-message", (_event, level, message, line, sourceId) => {
    if (message.includes("Electron Security Warning")) return;
    const levels = ["DEBUG", "INFO", "WARN", "ERROR"];
    const lvlName = levels[level] || "LOG";
    const src = sourceId ? import_path.default.basename(sourceId) : "renderer";
    console.log(`[Renderer ${lvlName}] ${message} (${src}:${line})`);
  });
  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[Load Error] Code ${errorCode}: ${errorDescription} at ${validatedURL}`);
  });
  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    console.error(`[Process Terminated]`, details);
  });
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    console.log(`Connecting to Vite dev server at: ${devServerUrl}`);
    mainWindow.loadURL(devServerUrl);
  } else {
    const indexPath = import_path.default.join(__dirname, "../dist/index.html");
    console.log(`Loading production bundle from: ${indexPath}`);
    mainWindow.loadFile(indexPath);
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
import_electron.app.on("web-contents-created", (_event, contents) => {
  contents.setUserAgent(CHROME_USER_AGENT);
  try {
    contents.session.webRequest.onBeforeSendHeaders(
      { urls: ["*://*/*"] },
      (details, callback) => {
        details.requestHeaders["User-Agent"] = CHROME_USER_AGENT;
        details.requestHeaders["sec-ch-ua"] = '"Google Chrome";v="152", "Chromium";v="152", "Not_A Brand";v="24"';
        details.requestHeaders["sec-ch-ua-mobile"] = "?0";
        details.requestHeaders["sec-ch-ua-platform"] = '"macOS"';
        callback({ requestHeaders: details.requestHeaders });
      }
    );
  } catch {
  }
  contents.session.setPermissionRequestHandler((_webContents, permission, callback) => {
    const allowedPermissions = [
      "media",
      "geolocation",
      "notifications",
      "midi",
      "camera",
      "microphone",
      "persistent-storage",
      "storage-access",
      "clipboard-read",
      "clipboard-sanitized-write"
    ];
    callback(allowedPermissions.includes(permission));
  });
  contents.session.setPermissionCheckHandler(() => true);
  contents.setWindowOpenHandler(({ url }) => {
    if (url.includes("accounts.google.com") || url.includes("appleid.apple.com") || url.includes("github.com/login") || url.includes("oauth") || url.includes("slack.com/signin") || url.includes("slack.com/oauth")) {
      return { action: "allow" };
    }
    import_electron.shell.openExternal(url);
    return { action: "deny" };
  });
  contents.on("will-navigate", (event, navigationUrl) => {
    if (navigationUrl.includes("slack.com/unsupported-browser")) {
      event.preventDefault();
      contents.loadURL("https://slack.com/signin");
    }
  });
  contents.on("did-redirect-navigation", (_event2, navigationUrl) => {
    if (navigationUrl.includes("slack.com/unsupported-browser")) {
      contents.loadURL("https://slack.com/signin");
    }
  });
});
import_electron.app.whenReady().then(() => {
  createWindow();
  import_electron.app.on("activate", () => {
    if (import_electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
import_electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    import_electron.app.quit();
  }
});
import_electron.ipcMain.handle("chatty:get-system-memory", async () => {
  try {
    const totalMem = import_os.default.totalmem();
    const freeMem = import_os.default.freemem();
    const appMetrics = import_electron.app.getAppMetrics();
    const processMem = await process.getProcessMemoryInfo();
    return {
      totalMemBytes: totalMem,
      freeMemBytes: freeMem,
      processMemoryKB: processMem.residentSet,
      appMetrics: appMetrics.map((m) => ({
        pid: m.pid,
        type: m.type,
        cpu: m.cpu.percentCPUUsage,
        memoryMB: Math.round(m.memory.workingSetSize / 1024)
      }))
    };
  } catch (err) {
    console.error("Error fetching system memory:", err);
    return {
      totalMemBytes: 0,
      freeMemBytes: 0,
      processMemoryKB: 0,
      appMetrics: []
    };
  }
});
import_electron.ipcMain.handle("chatty:set-badge-count", (_event, count) => {
  try {
    if (import_electron.app.dock) {
      if (count > 0) {
        import_electron.app.dock.setBadge(count > 99 ? "99+" : count.toString());
      } else {
        import_electron.app.dock.setBadge("");
      }
    }
  } catch (err) {
    console.warn("Could not set dock badge:", err);
  }
  return true;
});
import_electron.ipcMain.handle("chatty:open-external", (_event, url) => {
  if (url && (url.startsWith("https://") || url.startsWith("http://"))) {
    import_electron.shell.openExternal(url);
  }
});
import_electron.ipcMain.handle("chatty:clear-partition-data", async (_event, partition) => {
  try {
    const ses = import_electron.session.fromPartition(partition);
    await ses.clearStorageData({
      storages: ["cookies", "localstorage", "indexdb", "websql", "serviceworkers", "cachestorage"]
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err?.message || String(err) };
  }
});
import_electron.ipcMain.handle("chatty:get-user-data-path", () => {
  return import_electron.app.getPath("userData");
});
import_electron.ipcMain.handle("chatty:window-control", (_event, action) => {
  if (!mainWindow) return;
  if (action === "minimize") mainWindow.minimize();
  else if (action === "maximize") {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  } else if (action === "close") {
    mainWindow.close();
  }
});
//# sourceMappingURL=main.cjs.map
