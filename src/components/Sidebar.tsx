import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ServiceIcon } from './ServiceIcon';
import { THEMES } from '../constants/presets';
import { platform, MemoryStats } from '../services/platform';
import {
  Plus,
  Columns,
  Lock,
  Settings as SettingsIcon,
  MoonStar,
  Zap,
  X,
  Trash2,
  RotateCw,
  Volume2,
  VolumeX,
  BedDouble,
  Play,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    filteredServices,
    activeServiceId,
    setActiveServiceId,
    setSecondaryServiceId,
    removeService,
    updateService,
    hibernateService,
    wakeService,
    settings,
    unreadCounts,
    setAddServiceOpen,
    setSettingsOpen,
    setMemoryModalOpen,
    toggleSplitView,
    toggleFocusMode,
    lockApp,
  } = useApp();

  const activeTheme = THEMES[settings.theme] || THEMES.sakura;
  const isNoir = settings.theme === 'noir';

  // Live RAM tracking for the sidebar badge
  const [memoryMB, setMemoryMB] = useState<number>(180);

  // Right-click context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    serviceId: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchMem = async () => {
      try {
        const stats: MemoryStats = await platform.getMemoryUsage();
        if (mounted && stats.processMemoryKB) {
          setMemoryMB(Math.round(stats.processMemoryKB / 1024));
        }
      } catch {}
    };

    fetchMem();
    const timer = setInterval(fetchMem, 5000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  // Close context menu on outside click or escape
  useEffect(() => {
    const handleDismiss = () => setContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };

    window.addEventListener('click', handleDismiss);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleDismiss);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const selectedContextService = contextMenu
    ? filteredServices.find((s) => s.id === contextMenu.serviceId)
    : null;

  return (
    <aside
      className={`relative w-[76px] flex flex-col items-center justify-between py-3 border-r select-none transition-colors duration-300 z-30 ${
        isNoir ? 'bg-[#12141D]/95 border-zinc-800/80 text-zinc-300' : `${activeTheme.sidebarBg} ${activeTheme.border} backdrop-blur-xl`
      }`}
    >
      {/* Top drag handle region for macOS traffic lights */}
      <div className="titlebar-drag w-full h-11 shrink-0" />

      {/* Main Service List (Filtered by Active Workspace) */}
      <div className="w-full flex-1 flex flex-col items-center space-y-3 overflow-y-auto overflow-x-hidden no-scrollbar py-2">
        {filteredServices.map((service, index) => {
          const isActive = service.id === activeServiceId;
          const unread = unreadCounts[service.id] || 0;
          const isHibernated = service.isHibernated;

          return (
            <div
              key={service.id}
              className="relative group flex items-center justify-center"
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setContextMenu({
                  x: Math.min(e.clientX, window.innerWidth - 180),
                  y: Math.min(e.clientY, window.innerHeight - 200),
                  serviceId: service.id,
                });
              }}
            >
              {/* Active Indicator Bar on Left */}
              {isActive && (
                <div
                  className="absolute left-0 w-1 h-8 rounded-r-full transition-all duration-300 shadow-sm"
                  style={{ backgroundColor: activeTheme.accent }}
                />
              )}

              {/* Service Icon Button (Snug fit, 48px large icon, minimal padding) */}
              <button
                onClick={() => setActiveServiceId(service.id)}
                className={`relative w-[52px] h-[52px] rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isActive
                    ? isNoir
                      ? 'bg-zinc-800/80 shadow-md ring-2 ring-purple-400/60 scale-105'
                      : 'bg-white/80 shadow-md ring-2 ring-purple-400/50 scale-105'
                    : isNoir
                    ? 'hover:bg-zinc-800/40 opacity-80 hover:opacity-100 hover:scale-105'
                    : 'hover:bg-white/40 opacity-85 hover:opacity-100 hover:scale-105'
                } ${isHibernated && !isActive ? 'opacity-40 grayscale-[40%]' : ''}`}
              >
                <ServiceIcon type={service.type} size={46} url={service.url} />

                {/* Hibernation Badge (Sleep indicator) */}
                {isHibernated && !isActive && (
                  <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-slate-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs ring-2 ring-white dark:ring-zinc-900 pointer-events-none">
                    z
                  </span>
                )}
              </button>

              {/* Unread Counter Bubble (Top-Right) */}
              {unread > 0 && (
                <div className="absolute -top-1 -right-1 pointer-events-none z-10">
                  <span className="flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-rose-500 text-white text-[11px] font-bold shadow-md animate-spring-pop">
                    {unread > 99 ? '99+' : unread}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Add Service Button */}
        <button
          onClick={() => setAddServiceOpen(true)}
          className={`w-[48px] h-[48px] rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 border-2 border-dashed cursor-pointer ${
            isNoir
              ? 'border-zinc-700 hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-100'
              : 'border-zinc-300 hover:bg-white/60 text-zinc-500 hover:text-zinc-800'
          }`}
          title="Add or Manage Apps"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Action Dock */}
      <div className="w-full flex flex-col items-center space-y-2 pt-2 border-t shrink-0 border-inherit">
        {/* Live RAM Monitor Widget */}
        <button
          onClick={() => setMemoryModalOpen(true)}
          className={`group relative flex items-center justify-center p-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
            isNoir
              ? 'hover:bg-zinc-800 text-emerald-400'
              : 'hover:bg-white/70 text-emerald-600'
          }`}
          title="Memory Optimizer & RAM Monitor"
        >
          <div className="flex flex-col items-center">
            <Zap className="w-4 h-4 text-emerald-500 group-hover:animate-pulse" />
            <span className="text-[11px] font-mono font-bold mt-0.5">
              {memoryMB}M
            </span>
          </div>
        </button>

        {/* Split View Toggle */}
        <button
          onClick={() => toggleSplitView()}
          className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${
            settings.splitViewEnabled
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
              : isNoir
              ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100'
              : 'hover:bg-white/70 text-zinc-600 hover:text-zinc-900'
          }`}
          title="Split View Side-by-Side (⌘S)"
        >
          <Columns className="w-4 h-4" />
        </button>

        {/* Focus Mode */}
        <button
          onClick={toggleFocusMode}
          className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${
            settings.focusMode
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              : isNoir
              ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100'
              : 'hover:bg-white/70 text-zinc-600 hover:text-zinc-900'
          }`}
          title="Focus Mode / Do Not Disturb (⌘D)"
        >
          <MoonStar className="w-4 h-4" />
        </button>

        {/* Privacy Shield Lock */}
        <button
          onClick={lockApp}
          className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${
            isNoir
              ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100'
              : 'hover:bg-white/70 text-zinc-600 hover:text-zinc-900'
          }`}
          title="Privacy Shield Lock (⌘L)"
        >
          <Lock className="w-4 h-4" />
        </button>

        {/* Settings */}
        <button
          onClick={() => setSettingsOpen(true)}
          className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${
            isNoir
              ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100'
              : 'hover:bg-white/70 text-zinc-600 hover:text-zinc-900'
          }`}
          title="Settings & Themes (⌘,)"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Right-Click Context Menu for App Removal & Controls */}
      {contextMenu && selectedContextService && (
        <div
          className={`fixed z-50 w-48 rounded-xl shadow-2xl py-1.5 border backdrop-blur-xl animate-fade-in ${
            isNoir
              ? 'bg-zinc-900/95 border-zinc-800 text-zinc-200'
              : 'bg-white/95 border-zinc-200 text-zinc-800'
          }`}
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 border-b border-inherit mb-1">
            <div className="font-semibold text-xs truncate">
              {selectedContextService.name}
            </div>
            {selectedContextService.accountLabel && (
              <div className="text-[10px] text-zinc-400 truncate">
                {selectedContextService.accountLabel}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              updateService(selectedContextService.id, {
                isMuted: !selectedContextService.isMuted,
              });
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-xs text-left flex items-center space-x-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            {selectedContextService.isMuted ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Unmute Notifications</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                <span>Mute Notifications</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              if (selectedContextService.isHibernated) {
                wakeService(selectedContextService.id);
              } else {
                hibernateService(selectedContextService.id);
              }
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-xs text-left flex items-center space-x-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            {selectedContextService.isHibernated ? (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-500" />
                <span>Wake App</span>
              </>
            ) : (
              <>
                <BedDouble className="w-3.5 h-3.5 text-amber-500" />
                <span>Hibernate (Save RAM)</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              updateService(selectedContextService.id, {
                neverSleep: !selectedContextService.neverSleep,
              });
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-xs text-left flex items-center space-x-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            <Zap className={`w-3.5 h-3.5 ${selectedContextService.neverSleep ? 'text-amber-500 fill-current' : 'text-zinc-400'}`} />
            <span>{selectedContextService.neverSleep ? 'Disable Always-On' : 'Never Sleep (Always On)'}</span>
          </button>

          <button
            onClick={() => {
              const event = new CustomEvent('chatty:reload-webview', {
                detail: { id: selectedContextService.id },
              });
              window.dispatchEvent(event);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-xs text-left flex items-center space-x-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-blue-500" />
            <span>Reload Tab</span>
          </button>

          {/* Split Screen Placement */}
          <div className="my-1 border-t border-inherit" />

          <button
            onClick={() => {
              setActiveServiceId(selectedContextService.id);
              if (!settings.splitViewEnabled) {
                toggleSplitView();
              }
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-xs text-left flex items-center space-x-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            <Columns className="w-3.5 h-3.5 text-purple-500" />
            <span>Open in Left Split Pane</span>
          </button>

          <button
            onClick={() => {
              setSecondaryServiceId(selectedContextService.id);
              if (!settings.splitViewEnabled) {
                toggleSplitView(selectedContextService.id);
              }
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-xs text-left flex items-center space-x-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            <Columns className="w-3.5 h-3.5 text-purple-500" />
            <span>Open in Right Split Pane</span>
          </button>

          <div className="my-1 border-t border-inherit" />

          {/* Remove Service Button */}
          <button
            onClick={() => {
              removeService(selectedContextService.id);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-xs text-left flex items-center space-x-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove from Sidebar</span>
          </button>
        </div>
      )}
    </aside>
  );
};
