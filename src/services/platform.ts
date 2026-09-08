export interface MemoryProcessMetric {
  pid: number;
  type: string;
  cpu: number;
  memoryMB: number;
}

export interface MemoryStats {
  totalMemBytes: number;
  freeMemBytes: number;
  processMemoryKB: number;
  appMetrics: MemoryProcessMetric[];
}

export interface IPlatformBridge {
  isElectron: boolean;
  platform: 'darwin' | 'ios' | 'browser';
  setBadgeCount(count: number): Promise<void>;
  openExternal(url: string): Promise<void>;
  getMemoryUsage(): Promise<MemoryStats>;
  clearPartitionData(partition: string): Promise<{ success: boolean; error?: string }>;
  getUserDataPath(): Promise<string>;
  windowControl(action: 'minimize' | 'maximize' | 'close'): Promise<void>;
  showNotification(opts: { title: string; body: string; serviceId?: string }): Promise<boolean>;
  onActivateService?(callback: (serviceId: string) => void): () => void;
}

declare global {
  interface Window {
    chattyAPI?: {
      platform: string;
      getSystemMemory: () => Promise<MemoryStats>;
      setBadgeCount: (count: number) => Promise<boolean>;
      openExternal: (url: string) => Promise<void>;
      clearPartitionData: (partition: string) => Promise<{ success: boolean; error?: string }>;
      getUserDataPath: () => Promise<string>;
      windowControl: (action: 'minimize' | 'maximize' | 'close') => Promise<void>;
      showNotification: (options: { title: string; body: string; serviceId?: string }) => Promise<boolean>;
      onActivateService: (callback: (serviceId: string) => void) => () => void;
    };
  }
}

class PlatformBridge implements IPlatformBridge {
  get isElectron(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      !!window.chattyAPI ||
      !!(window as any).process?.versions?.electron ||
      (typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('electron')) ||
      (typeof customElements !== 'undefined' && !!customElements.get('webview'))
    );
  }

  get platform(): 'darwin' | 'ios' | 'browser' {
    if (this.isElectron) {
      return (window.chattyAPI?.platform as 'darwin') || 'darwin';
    }
    return 'browser';
  }

  async setBadgeCount(count: number): Promise<void> {
    if (this.isElectron && window.chattyAPI) {
      await window.chattyAPI.setBadgeCount(count);
    } else {
      // Browser fallback (update document title or favicon badge)
      if (count > 0) {
        document.title = `(${count}) Chatty`;
      } else {
        document.title = 'Chatty';
      }
    }
  }

  async openExternal(url: string): Promise<void> {
    if (this.isElectron && window.chattyAPI) {
      await window.chattyAPI.openExternal(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  async getMemoryUsage(): Promise<MemoryStats> {
    if (this.isElectron && window.chattyAPI) {
      return await window.chattyAPI.getSystemMemory();
    }
    // Browser mock for development
    return {
      totalMemBytes: 16 * 1024 * 1024 * 1024,
      freeMemBytes: 8 * 1024 * 1024 * 1024,
      processMemoryKB: 145000,
      appMetrics: [
        { pid: 1001, type: 'Browser', cpu: 1.2, memoryMB: 120 },
        { pid: 1002, type: 'Tab (Active)', cpu: 0.8, memoryMB: 95 },
      ],
    };
  }

  async clearPartitionData(partition: string): Promise<{ success: boolean; error?: string }> {
    if (this.isElectron && window.chattyAPI) {
      return await window.chattyAPI.clearPartitionData(partition);
    }
    return { success: true };
  }

  async getUserDataPath(): Promise<string> {
    if (this.isElectron && window.chattyAPI) {
      return await window.chattyAPI.getUserDataPath();
    }
    return '~/Library/Application Support/Chatty';
  }

  async windowControl(action: 'minimize' | 'maximize' | 'close'): Promise<void> {
    if (this.isElectron && window.chattyAPI) {
      await window.chattyAPI.windowControl(action);
    }
  }

  async showNotification(opts: { title: string; body: string; serviceId?: string }): Promise<boolean> {
    if (this.isElectron && window.chattyAPI) {
      return await window.chattyAPI.showNotification(opts);
    }
    // HTML5 notification fallback if in browser
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(opts.title, { body: opts.body });
      return true;
    }
    return false;
  }

  onActivateService(callback: (serviceId: string) => void): () => void {
    if (this.isElectron && window.chattyAPI?.onActivateService) {
      return window.chattyAPI.onActivateService(callback);
    }
    return () => {};
  }
}

export const platform = new PlatformBridge();
