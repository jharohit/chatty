import { contextBridge, ipcRenderer } from 'electron';
import path from 'path';

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
}

const api: ChattyAPI = {
  platform: process.platform,
  webviewPreloadPath: `file://${path.join(__dirname, 'webview-preload.cjs')}`,
  getSystemMemory: () => ipcRenderer.invoke('chatty:get-system-memory'),
  setBadgeCount: (count: number) => ipcRenderer.invoke('chatty:set-badge-count', count),
  openExternal: (url: string) => ipcRenderer.invoke('chatty:open-external', url),
  clearPartitionData: (partition: string) => ipcRenderer.invoke('chatty:clear-partition-data', partition),
  getUserDataPath: () => ipcRenderer.invoke('chatty:get-user-data-path'),
  windowControl: (action: 'minimize' | 'maximize' | 'close') =>
    ipcRenderer.invoke('chatty:window-control', action),
};

contextBridge.exposeInMainWorld('chattyAPI', api);
