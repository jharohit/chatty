export type ThemeId = 'sakura' | 'lavender' | 'matcha' | 'nordic' | 'buttercup' | 'noir';

export type WorkspaceId = 'all' | 'work' | 'personal' | 'ai';

export type ServiceType =
  | 'whatsapp'
  | 'whatsapp_business'
  | 'telegram'
  | 'signal'
  | 'slack'
  | 'google_chat'
  | 'discord'
  | 'messenger'
  | 'chatgpt'
  | 'claude'
  | 'gemini'
  | 'perplexity'
  | 'grok'
  | 'custom';

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  url: string;
  partition: string;
  accountLabel?: string;
  accentColor: string;
  isMuted: boolean;
  zoomFactor: number;
  isHibernated: boolean;
  lastActive: number;
  unreadCount?: number;
  customIcon?: string;
  workspaceId?: WorkspaceId;
  neverSleep?: boolean;
}

export interface ServicePreset {
  type: ServiceType;
  name: string;
  description: string;
  defaultUrl: string;
  defaultColor: string;
  badgeTag?: string;
  category: 'chat' | 'work' | 'ai';
  supportsMultiple: boolean;
}

export interface AppSettings {
  theme: ThemeId;
  soundEnabled: boolean;
  autoSleepMinutes: number; // 0 = disabled, 15, 30, 60
  focusMode: boolean;
  privacyLocked: boolean;
  privacyPin: string;
  splitViewEnabled: boolean;
  splitViewSecondaryId: string | null;
  splitRatio: number; // 30 to 70 percentage
  showRamMonitor: boolean;
  defaultZoom?: number; // 0.9, 1.0, 1.1, 1.25, 1.3
  screenShareShield: boolean;
  activeWorkspaceId: WorkspaceId;
  backgroundNotifications: boolean; // Keep background tabs connected to receive notifications
}
