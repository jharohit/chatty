import { contextBridge, ipcRenderer } from 'electron';

export interface ChattyAPI {
  platform: string;
  webviewPreloadPath?: string;
  getSystemMemory: () => Promise<{
    totalMemBytes: number;
    freeMemBytes: number;
    processMemoryKB: number;
    appMetrics: Array<{ pid: number; type: string; cpu: number; memoryMB: number }>;
  }>;
  setBadgeCount: (count: number) => Promise<boolean>;
  openExternal: (url: string) => Promise<void>;
  clearPartitionData: (partition: string) => Promise<{ success: boolean; error?: string }>;
  getUserDataPath: () => Promise<string>;
  windowControl: (action: 'minimize' | 'maximize' | 'close') => Promise<void>;
  showNotification: (options: { title: string; body: string; serviceId?: string }) => Promise<boolean>;
  onActivateService: (callback: (serviceId: string) => void) => () => void;
}

const api: ChattyAPI = {
  platform: process.platform,
  webviewPreloadPath: `file://${__dirname}/webview-preload.cjs`,
  getSystemMemory: () => ipcRenderer.invoke('chatty:get-system-memory'),
  setBadgeCount: (count: number) => ipcRenderer.invoke('chatty:set-badge-count', count),
  openExternal: (url: string) => ipcRenderer.invoke('chatty:open-external', url),
  clearPartitionData: (partition: string) => ipcRenderer.invoke('chatty:clear-partition-data', partition),
  getUserDataPath: () => ipcRenderer.invoke('chatty:get-user-data-path'),
  windowControl: (action: 'minimize' | 'maximize' | 'close') =>
    ipcRenderer.invoke('chatty:window-control', action),
  showNotification: (options) => ipcRenderer.invoke('chatty:show-notification', options),
  onActivateService: (callback) => {
    const handler = (_event: any, serviceId: string) => callback(serviceId);
    ipcRenderer.on('chatty:activate-service', handler);
    return () => ipcRenderer.removeListener('chatty:activate-service', handler);
  },
};

try {
  contextBridge.exposeInMainWorld('chattyAPI', api);
} catch (e) {
  (window as any).chattyAPI = api;
}
