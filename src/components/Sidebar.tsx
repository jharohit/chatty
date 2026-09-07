import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ServiceIcon } from './ServiceIcon';
import { THEMES } from '../constants/presets';
import { platform, MemoryStats } from '../services/platform';
import {
  Plus,
  Columns,
  Moon,
  Sun,
  Lock,
  Settings as SettingsIcon,
  Cpu,
  MoonStar,
  Sparkles,
  Zap,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    services,
    activeServiceId,
    setActiveServiceId,
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

  return (
    <aside
      className={`relative w-[76px] flex flex-col items-center justify-between py-3 border-r select-none transition-colors duration-300 z-30 ${
        isNoir ? 'bg-[#12141D]/95 border-zinc-800/80 text-zinc-300' : `${activeTheme.sidebarBg} ${activeTheme.border} backdrop-blur-xl`
      }`}
    >
      {/* Top drag handle region for macOS traffic lights */}
      <div className="titlebar-drag w-full h-10 shrink-0" />

      {/* Main Service List */}
      <div className="w-full flex-1 flex flex-col items-center space-y-3 overflow-y-auto overflow-x-hidden no-scrollbar py-2">
        {services.map((service, index) => {
          const isActive = service.id === activeServiceId;
          const unread = unreadCounts[service.id] || 0;
          const isHibernated = service.isHibernated;

          return (
            <div key={service.id} className="relative group flex items-center justify-center">
              {/* Active Indicator Bar on Left */}
              {isActive && (
                <div
                  className="absolute left-0 w-1 h-7 rounded-r-full transition-all duration-300 shadow-sm"
                  style={{ backgroundColor: activeTheme.accent }}
                />
              )}

              {/* Service Icon Button */}
              <button
                onClick={() => setActiveServiceId(service.id)}
                className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 active:scale-95 ${
                  isActive
                    ? isNoir
                      ? 'bg-zinc-800/90 shadow-md ring-2 ring-purple-400/30'
                      : 'bg-white/90 shadow-pastel ring-2 ring-white/60'
                    : isNoir
                    ? 'hover:bg-zinc-800/50 opacity-70 hover:opacity-100'
                    : 'hover:bg-white/50 opacity-80 hover:opacity-100'
                } ${isHibernated && !isActive ? 'opacity-40 grayscale-[40%]' : ''}`}
                title={`${service.name} (${service.accountLabel || 'Default'}) - ⌘${index + 1}`}
              >
                <ServiceIcon type={service.type} size={28} />

                {/* Hibernation Badge (Sleep indicator) */}
                {isHibernated && !isActive && (
                  <span
                    className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-slate-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs"
                    title="Tab sleeping (saving RAM)"
                  >
                    z
                  </span>
                )}

                {/* Account Pill indicator (Personal vs Work vs Business) */}
                {service.accountLabel && (
                  <span
                    className="absolute -bottom-2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold tracking-normal truncate max-w-[54px] border shadow-2xs"
                    style={{
                      backgroundColor: isNoir ? '#202330' : '#FFFFFF',
                      color: service.accentColor || activeTheme.accent,
                      borderColor: isNoir ? '#363B4E' : '#E8E8ED',
                    }}
                  >
                    {service.accountLabel}
                  </span>
                )}
              </button>

              {/* Unread Counter Bubble */}
              {unread > 0 && (
                <div className="absolute -top-1 -right-1 pointer-events-none">
                  <span className="flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-rose-500 text-white text-[11px] font-bold shadow-md animate-spring-pop">
                    {unread > 99 ? '99+' : unread}
                  </span>
                </div>
              )}

              {/* Hover Tooltip */}
              <div
                className={`absolute left-16 px-3 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg ${
                  isNoir ? 'bg-zinc-800 text-zinc-100 border border-zinc-700' : 'bg-white/95 text-zinc-800 border border-zinc-200/70 backdrop-blur-md'
                }`}
              >
                {service.name}
                {service.accountLabel ? ` • ${service.accountLabel}` : ''}
                {isHibernated && <span className="ml-1 text-slate-400 text-[11px]">(Sleeping)</span>}
              </div>
            </div>
          );
        })}

        {/* Add Service Button */}
        <button
          onClick={() => setAddServiceOpen(true)}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 border border-dashed ${
            isNoir
              ? 'border-zinc-700 hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-100'
              : 'border-zinc-300 hover:bg-white/60 text-zinc-500 hover:text-zinc-800'
          }`}
          title="Add Service or Account (⌘N)"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Action Dock */}
      <div className="w-full flex flex-col items-center space-y-2 pt-2 border-t shrink-0 border-inherit">
        {/* Live RAM Monitor Widget */}
        <button
          onClick={() => setMemoryModalOpen(true)}
          className={`group relative flex items-center justify-center p-1.5 rounded-xl transition-all duration-200 ${
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
          className={`p-2 rounded-xl transition-all duration-200 ${
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
          className={`p-2 rounded-xl transition-all duration-200 ${
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
          className={`p-2 rounded-xl transition-all duration-200 ${
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
          className={`p-2 rounded-xl transition-all duration-200 ${
            isNoir
              ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100'
              : 'hover:bg-white/70 text-zinc-600 hover:text-zinc-900'
          }`}
          title="Settings & Themes (⌘,)"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
