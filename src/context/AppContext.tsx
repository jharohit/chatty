import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Service, ServicePreset, ThemeId, AppSettings } from '../types';
import { INITIAL_SERVICES } from '../constants/presets';
import { platform } from '../services/platform';
import { sounds } from '../utils/sound';

interface AppContextType {
  services: Service[];
  activeService: Service | null;
  activeServiceId: string;
  secondaryService: Service | null;
  secondaryServiceId: string | null;
  settings: AppSettings;
  unreadCounts: Record<string, number>;
  totalUnread: number;
  isCommandPaletteOpen: boolean;
  isAddServiceOpen: boolean;
  isSettingsOpen: boolean;
  isMemoryModalOpen: boolean;

  // Actions
  setActiveServiceId: (id: string) => void;
  setSecondaryServiceId: (id: string | null) => void;
  addService: (
    preset: ServicePreset,
    customName?: string,
    customUrl?: string,
    accountLabel?: string,
    customColor?: string
  ) => Service;
  removeService: (id: string) => Promise<void>;
  updateService: (id: string, partial: Partial<Service>) => void;
  hibernateService: (id: string) => void;
  wakeService: (id: string) => void;
  hibernateAllInactive: () => void;
  toggleSplitView: (secondaryId?: string) => void;
  setSplitRatio: (ratio: number) => void;
  setTheme: (theme: ThemeId) => void;
  toggleFocusMode: () => void;
  lockApp: () => void;
  unlockApp: (pin?: string) => boolean;
  setUnreadCount: (serviceId: string, count: number) => void;
  reloadActiveService: () => void;
  openExternalActiveService: () => void;

  // Modals
  setCommandPaletteOpen: (open: boolean) => void;
  setAddServiceOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setMemoryModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  SERVICES: 'chatty_services_v1',
  SETTINGS: 'chatty_settings_v1',
  ACTIVE_ID: 'chatty_active_service_id',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved services strictly from local storage
  const [services, setServices] = useState<Service[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load services from localStorage:', e);
    }
    return INITIAL_SERVICES;
  });

  const [activeServiceId, setActiveServiceIdState] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
      if (savedId && services.some((s) => s.id === savedId)) return savedId;
    } catch {}
    return services[0]?.id || 'wa-personal';
  });

  const [secondaryServiceId, setSecondaryServiceId] = useState<string | null>(null);

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      theme: 'sakura',
      soundEnabled: true,
      autoSleepMinutes: 15,
      focusMode: false,
      privacyLocked: false,
      privacyPin: '',
      splitViewEnabled: false,
      splitViewSecondaryId: null,
      splitRatio: 50,
      showRamMonitor: true,
    };
  });

  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Modals
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isAddServiceOpen, setAddServiceOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isMemoryModalOpen, setMemoryModalOpen] = useState(false);

  // Synchronize sounds state
  useEffect(() => {
    sounds.enabled = settings.soundEnabled;
  }, [settings.soundEnabled]);

  // Persist services strictly to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    } catch (e) {
      console.error('Failed to save services to local storage:', e);
    }
  }, [services]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  // Persist active ID
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, activeServiceId);
    } catch {}
  }, [activeServiceId]);

  // Active & Secondary Services
  const activeService = useMemo(() => {
    return services.find((s) => s.id === activeServiceId) || services[0] || null;
  }, [services, activeServiceId]);

  const secondaryService = useMemo(() => {
    if (!settings.splitViewEnabled || !secondaryServiceId) return null;
    return services.find((s) => s.id === secondaryServiceId) || null;
  }, [services, settings.splitViewEnabled, secondaryServiceId]);

  // Total Unread Count & Dock synchronization
  const totalUnread = useMemo(() => {
    return Object.values(unreadCounts).reduce((acc, curr) => acc + (curr || 0), 0);
  }, [unreadCounts]);

  useEffect(() => {
    platform.setBadgeCount(totalUnread);
  }, [totalUnread]);

  // Set Active Service with micro-interaction sound & wake from sleep
  const setActiveServiceId = useCallback(
    (id: string) => {
      if (id === activeServiceId) return;
      sounds.playSwitch();
      setActiveServiceIdState(id);

      setServices((prev) =>
        prev.map((s) => {
          if (s.id === id) {
            return { ...s, isHibernated: false, lastActive: Date.now() };
          }
          return s;
        })
      );
    },
    [activeServiceId]
  );

  // Add Service (Unlimited instances with isolated partitions)
  const addService = useCallback(
    (
      preset: ServicePreset,
      customName?: string,
      customUrl?: string,
      accountLabel?: string,
      customColor?: string
    ): Service => {
      const uniqueId = `srv-${preset.type}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
      // Isolated persistent partition for true zero-collision multi-account sessions
      const partition = `persist:service_${uniqueId}`;

      const newService: Service = {
        id: uniqueId,
        name: customName || preset.name,
        type: preset.type,
        url: customUrl || preset.defaultUrl,
        partition,
        accountLabel: accountLabel || (preset.type.includes('whatsapp') ? 'Account' : preset.badgeTag || 'Default'),
        accentColor: customColor || preset.defaultColor,
        isMuted: false,
        zoomFactor: 1.0,
        isHibernated: false,
        lastActive: Date.now(),
      };

      setServices((prev) => [...prev, newService]);
      setActiveServiceIdState(uniqueId);
      sounds.playNotification();
      return newService;
    },
    []
  );

  // Remove Service & purge its local partition data
  const removeService = useCallback(
    async (id: string) => {
      const s = services.find((item) => item.id === id);
      if (s) {
        // Clean local partition storage
        await platform.clearPartitionData(s.partition);
      }

      setServices((prev) => {
        const next = prev.filter((item) => item.id !== id);
        if (activeServiceId === id && next.length > 0) {
          setActiveServiceIdState(next[0].id);
        }
        return next;
      });

      if (secondaryServiceId === id) {
        setSecondaryServiceId(null);
        setSettings((prev) => ({ ...prev, splitViewEnabled: false, splitViewSecondaryId: null }));
      }
      sounds.playClick();
    },
    [services, activeServiceId, secondaryServiceId]
  );

  // Update Service
  const updateService = useCallback((id: string, partial: Partial<Service>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...partial } : s)));
  }, []);

  // Hibernate tab to release RAM
  const hibernateService = useCallback((id: string) => {
    sounds.playSleep();
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isHibernated: true } : s))
    );
  }, []);

  // Wake tab from sleep
  const wakeService = useCallback((id: string) => {
    sounds.playSwitch();
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isHibernated: false, lastActive: Date.now() } : s))
    );
  }, []);

  // Hibernate all inactive tabs immediately (Memory Saver action)
  const hibernateAllInactive = useCallback(() => {
    sounds.playSleep();
    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== activeServiceId && s.id !== secondaryServiceId) {
          return { ...s, isHibernated: true };
        }
        return s;
      })
    );
  }, [activeServiceId, secondaryServiceId]);

  // Auto-sleep timer for idle background tabs
  useEffect(() => {
    if (!settings.autoSleepMinutes || settings.autoSleepMinutes <= 0) return;

    const thresholdMs = settings.autoSleepMinutes * 60 * 1000;
    const interval = setInterval(() => {
      const now = Date.now();
      setServices((prev) =>
        prev.map((s) => {
          if (
            s.id !== activeServiceId &&
            s.id !== secondaryServiceId &&
            !s.isHibernated &&
            now - s.lastActive > thresholdMs
          ) {
            return { ...s, isHibernated: true };
          }
          return s;
        })
      );
    }, 60000); // check once a minute

    return () => clearInterval(interval);
  }, [settings.autoSleepMinutes, activeServiceId, secondaryServiceId]);

  // Split View Toggle
  const toggleSplitView = useCallback(
    (targetSecondaryId?: string) => {
      sounds.playClick();
      setSettings((prev) => {
        const nextEnabled = !prev.splitViewEnabled;
        let chosenSecondary = targetSecondaryId || secondaryServiceId;

        if (nextEnabled && !chosenSecondary) {
          // Pick the first available service that is not the active one
          const candidate = services.find((s) => s.id !== activeServiceId);
          chosenSecondary = candidate ? candidate.id : null;
        }

        setSecondaryServiceId(chosenSecondary);
        return {
          ...prev,
          splitViewEnabled: nextEnabled && !!chosenSecondary,
          splitViewSecondaryId: chosenSecondary,
        };
      });
    },
    [secondaryServiceId, services, activeServiceId]
  );

  const setSplitRatio = useCallback((ratio: number) => {
    setSettings((prev) => ({ ...prev, splitRatio: ratio }));
  }, []);

  const setTheme = useCallback((theme: ThemeId) => {
    sounds.playClick();
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  const toggleFocusMode = useCallback(() => {
    sounds.playClick();
    setSettings((prev) => ({ ...prev, focusMode: !prev.focusMode }));
  }, []);

  const lockApp = useCallback(() => {
    sounds.playChord(false);
    setSettings((prev) => ({ ...prev, privacyLocked: true }));
  }, []);

  const unlockApp = useCallback(
    (pin?: string): boolean => {
      if (settings.privacyPin && pin !== settings.privacyPin) {
        return false;
      }
      sounds.playChord(true);
      setSettings((prev) => ({ ...prev, privacyLocked: false }));
      return true;
    },
    [settings.privacyPin]
  );

  const setUnreadCount = useCallback((serviceId: string, count: number) => {
    setUnreadCounts((prev) => {
      if (prev[serviceId] === count) return prev;
      return { ...prev, [serviceId]: count };
    });
  }, []);

  const reloadActiveService = useCallback(() => {
    sounds.playClick();
    const event = new CustomEvent('chatty:reload-webview', { detail: { id: activeServiceId } });
    window.dispatchEvent(event);
  }, [activeServiceId]);

  const openExternalActiveService = useCallback(() => {
    sounds.playClick();
    if (activeService) {
      platform.openExternal(activeService.url);
    }
  }, [activeService]);

  return (
    <AppContext.Provider
      value={{
        services,
        activeService,
        activeServiceId,
        secondaryService,
        secondaryServiceId,
        settings,
        unreadCounts,
        totalUnread,
        isCommandPaletteOpen,
        isAddServiceOpen,
        isSettingsOpen,
        isMemoryModalOpen,
        setActiveServiceId,
        setSecondaryServiceId,
        addService,
        removeService,
        updateService,
        hibernateService,
        wakeService,
        hibernateAllInactive,
        toggleSplitView,
        setSplitRatio,
        setTheme,
        toggleFocusMode,
        lockApp,
        unlockApp,
        setUnreadCount,
        reloadActiveService,
        openExternalActiveService,
        setCommandPaletteOpen,
        setAddServiceOpen,
        setSettingsOpen,
        setMemoryModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
