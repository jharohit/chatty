import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { THEMES, SERVICE_PRESETS, WORKSPACES } from '../constants/presets';
import { ServiceIcon } from './ServiceIcon';
import {
  Search,
  Zap,
  Columns,
  MoonStar,
  Lock,
  Plus,
  RotateCw,
  Palette,
  Check,
  Shield,
  Trash2,
  Layers,
  EyeOff,
  ArrowLeftRight,
} from 'lucide-react';

interface PaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Chats & Accounts' | 'Workspaces' | 'Actions' | 'Themes';
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    services,
    activeServiceId,
    setActiveServiceId,
    settings,
    setTheme,
    toggleSplitView,
    swapSplitServices,
    toggleFocusMode,
    lockApp,
    hibernateAllInactive,
    reloadActiveService,
    setAddServiceOpen,
    addService,
    setWorkspaceId,
    toggleScreenShareShield,
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const items: PaletteItem[] = [];

  // 1. All Active Services / Accounts
  services.forEach((s, idx) => {
    items.push({
      id: `service-${s.id}`,
      title: `${s.name} ${s.accountLabel ? `(${s.accountLabel})` : ''}`,
      subtitle: `Jump to chat • ⌘${idx + 1}`,
      category: 'Chats & Accounts',
      icon: <ServiceIcon type={s.type} size={18} />,
      action: () => {
        setActiveServiceId(s.id);
        setCommandPaletteOpen(false);
      },
    });
  });

  // 2. Add another WhatsApp Account shortcut
  items.push({
    id: 'add-another-whatsapp',
    title: 'Add Another WhatsApp Account',
    subtitle: 'Creates a fresh isolated session for a 2nd or 3rd WhatsApp',
    category: 'Chats & Accounts',
    icon: <Plus className="w-4 h-4 text-emerald-500" />,
    action: () => {
      const waPreset = SERVICE_PRESETS.find((p) => p.type === 'whatsapp')!;
      const count = services.filter((s) => s.type.includes('whatsapp')).length + 1;
      addService(waPreset, `WhatsApp ${count}`, undefined, `Account ${count}`, '#25D366');
      setCommandPaletteOpen(false);
    },
  });

  // 3. Workspaces
  WORKSPACES.forEach((ws) => {
    items.push({
      id: `ws-${ws.id}`,
      title: `${ws.emoji} Switch to ${ws.name} Workspace`,
      subtitle: ws.description,
      category: 'Workspaces',
      icon: <Layers className="w-4 h-4 text-purple-500" />,
      action: () => {
        setWorkspaceId(ws.id);
        setCommandPaletteOpen(false);
      },
    });
  });

  // 4. Quick Actions
  items.push({
    id: 'action-presenter-shield',
    title: settings.screenShareShield
      ? 'Disable Presenter Mode'
      : 'Enable Presenter Mode (PII Blur for Screen Sharing)',
    subtitle: 'Blurs chat messages and phone numbers while on video calls (⌘P)',
    category: 'Actions',
    icon: <EyeOff className="w-4 h-4 text-emerald-500" />,
    action: () => {
      toggleScreenShareShield();
      setCommandPaletteOpen(false);
    },
  });

  if (settings.splitViewEnabled) {
    items.push({
      id: 'action-swap-split',
      title: 'Swap Split View Panes',
      subtitle: 'Exchange left and right active chats',
      category: 'Actions',
      icon: <ArrowLeftRight className="w-4 h-4 text-blue-500" />,
      action: () => {
        swapSplitServices();
        setCommandPaletteOpen(false);
      },
    });
  }

  items.push({
    id: 'action-ram-save',
    title: 'Save RAM: Hibernate Inactive Tabs',
    subtitle: 'Suspends background processes to free Mac memory',
    category: 'Actions',
    icon: <Zap className="w-4 h-4 text-amber-500" />,
    action: () => {
      hibernateAllInactive();
      setCommandPaletteOpen(false);
    },
  });

  items.push({
    id: 'action-split-view',
    title: settings.splitViewEnabled ? 'Exit Split View' : 'Toggle Split View Side-by-Side',
    subtitle: 'Multitask with two chat apps simultaneously',
    category: 'Actions',
    icon: <Columns className="w-4 h-4 text-purple-500" />,
    action: () => {
      toggleSplitView();
      setCommandPaletteOpen(false);
    },
  });

  items.push({
    id: 'action-focus-mode',
    title: settings.focusMode ? 'Disable Focus Mode' : 'Enable Focus Mode / Do Not Disturb',
    subtitle: 'Silence alerts and dim distracting badges',
    category: 'Actions',
    icon: <MoonStar className="w-4 h-4 text-indigo-500" />,
    action: () => {
      toggleFocusMode();
      setCommandPaletteOpen(false);
    },
  });

  items.push({
    id: 'action-lock',
    title: 'Lock Privacy Screen',
    subtitle: 'Blur screen with frosted security shield',
    category: 'Actions',
    icon: <Lock className="w-4 h-4 text-rose-500" />,
    action: () => {
      lockApp();
      setCommandPaletteOpen(false);
    },
  });

  items.push({
    id: 'action-reload',
    title: 'Reload Active Chat',
    subtitle: 'Refresh current session webview',
    category: 'Actions',
    icon: <RotateCw className="w-4 h-4 text-blue-500" />,
    action: () => {
      reloadActiveService();
      setCommandPaletteOpen(false);
    },
  });

  items.push({
    id: 'action-add-service',
    title: 'Open Service Catalog & Add App',
    subtitle: 'Telegram, Signal, Slack, Google Chat, Discord, AI...',
    category: 'Actions',
    icon: <Plus className="w-4 h-4 text-emerald-500" />,
    action: () => {
      setAddServiceOpen(true);
      setCommandPaletteOpen(false);
    },
  });

  // 4. Themes
  Object.values(THEMES).forEach((thm) => {
    items.push({
      id: `theme-${thm.id}`,
      title: `${thm.emoji} Switch to ${thm.name}`,
      subtitle: thm.tagline,
      category: 'Themes',
      icon: (
        <div
          className="w-4 h-4 rounded-full border border-black/10"
          style={{ backgroundColor: thm.accent }}
        />
      ),
      action: () => {
        setTheme(thm.id);
        setCommandPaletteOpen(false);
      },
    });
  });

  // Filter items based on query
  const filtered = items.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setCommandPaletteOpen(false);
    }
  };

  const isNoir = settings.theme === 'noir';

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/30 backdrop-blur-sm animate-fade-in"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border transition-all animate-slide-up ${
          isNoir
            ? 'bg-[#181A26]/95 border-zinc-700/80 text-zinc-100'
            : 'bg-white/95 border-white/80 text-zinc-800 backdrop-blur-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input header */}
        <div className="flex items-center px-4 py-3 border-b border-inherit space-x-3">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a chat name, action, or theme..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400 font-medium"
          />
          <kbd className="px-2 py-0.5 rounded text-[11px] font-mono bg-black/5 dark:bg-white/10 text-zinc-500">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-400">
              No matching chats or actions found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? isNoir
                        ? 'bg-purple-500/20 text-purple-200'
                        : 'bg-pastel-lavender-100/80 text-purple-900 shadow-xs'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-[12px] text-zinc-500 dark:text-zinc-400">{item.subtitle}</div>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono tracking-wide opacity-50">
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom footer tips */}
        <div className="px-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-inherit flex items-center justify-between text-[12px] text-zinc-500">
          <div className="flex items-center space-x-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <Shield className="w-3.5 h-3.5" />
            <span>100% Local</span>
          </div>
        </div>
      </div>
    </div>
  );
};
