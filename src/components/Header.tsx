import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { THEMES, WORKSPACES } from '../constants/presets';
import { WorkspaceId } from '../types';
import { ChattyLogo } from './ChattyLogo';
import {
  RotateCw,
  Search,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  BedDouble,
  Play,
  ShieldCheck,
  EyeOff,
  Eye,
  ArrowLeftRight,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    services,
    activeService,
    activeServiceId,
    setActiveServiceId,
    secondaryServiceId,
    setSecondaryServiceId,
    updateService,
    reloadActiveService,
    openExternalActiveService,
    hibernateService,
    wakeService,
    settings,
    setCommandPaletteOpen,
    toggleSplitView,
    swapSplitServices,
    setSplitRatio,
    toggleScreenShareShield,
    setWorkspaceId,
    unreadCounts,
  } = useApp();

  const activeTheme = THEMES[settings.theme] || THEMES.sakura;
  const isNoir = settings.theme === 'noir';

  // Compute unread counts per workspace
  const workspaceUnreads = useMemo(() => {
    const counts: Record<WorkspaceId, number> = { all: 0, personal: 0, work: 0, ai: 0 };
    services.forEach((s) => {
      const unread = unreadCounts[s.id] || 0;
      if (unread > 0) {
        counts.all += unread;
        const ws =
          s.workspaceId ||
          (s.type === 'slack' || s.type === 'google_chat' || s.type === 'whatsapp_business'
            ? 'work'
            : s.type === 'chatgpt' || s.type === 'claude'
            ? 'ai'
            : 'personal');
        counts[ws] = (counts[ws] || 0) + unread;
      }
    });
    return counts;
  }, [services, unreadCounts]);

  if (!activeService) return null;

  const handleZoom = (delta: number) => {
    const current = activeService.zoomFactor || 1.0;
    const next = Math.min(Math.max(Number((current + delta).toFixed(1)), 0.6), 2.0);
    updateService(activeService.id, { zoomFactor: next });

    const webview = document.getElementById(`webview-${activeService.id}`) as any;
    if (webview && typeof webview.setZoomFactor === 'function') {
      try {
        webview.setZoomFactor(next);
      } catch {}
    }
  };

  const toggleMute = () => {
    const nextMuted = !activeService.isMuted;
    updateService(activeService.id, { isMuted: nextMuted });
    const webview = document.getElementById(`webview-${activeService.id}`) as any;
    if (webview && typeof webview.setAudioMuted === 'function') {
      try {
        webview.setAudioMuted(nextMuted);
      } catch {}
    }
  };

  return (
    <header
      className={`h-12 w-full flex items-center justify-between px-4 border-b select-none transition-colors duration-200 titlebar-drag shrink-0 cursor-default ${
        isNoir
          ? 'bg-[#151722]/90 border-zinc-800 text-zinc-200'
          : `${activeTheme.sidebarBg} ${activeTheme.border} backdrop-blur-md`
      }`}
    >
      {/* Left: App Identity, Workspace Control & Service Identity */}
      <div className="flex items-center space-x-3 pointer-events-none shrink-0">
        {/* App Logo & Title */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <ChattyLogo
            size={24}
            className="pointer-events-auto shrink-0 cursor-pointer hover:scale-105 transition-transform"
          />
          <span className="font-bold text-[13.5px] tracking-tight text-zinc-900 dark:text-zinc-100">
            Chatty
          </span>
        </div>

        {/* Divider */}
        <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800" />

        {/* Workspace Segmented Selector */}
        <div className="flex items-center p-0.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 pointer-events-auto">
          {WORKSPACES.map((ws) => {
            const isSelected = (settings.activeWorkspaceId || 'all') === ws.id;
            const unread = workspaceUnreads[ws.id] || 0;

            return (
              <button
                key={ws.id}
                onClick={() => setWorkspaceId(ws.id)}
                className={`relative px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? isNoir
                      ? 'bg-zinc-800 text-purple-300 shadow-xs border border-purple-500/30 font-semibold'
                      : 'bg-white text-purple-700 shadow-xs ring-1 ring-black/5 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
                title={ws.description}
              >
                <span>{ws.emoji}</span>
                <span>{ws.name}</span>
                {unread > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800 hidden md:block" />

        {/* Dual Split App Selector or Single Active Service Info */}
        {settings.splitViewEnabled ? (
          <div className="flex items-center space-x-1.5 p-0.5 rounded-lg bg-black/5 dark:bg-white/5 border border-purple-500/20 pointer-events-auto">
            {/* Left Pane Selector */}
            <div className="flex items-center space-x-1 pl-1.5">
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">L:</span>
              <select
                value={activeServiceId}
                onChange={(e) => setActiveServiceId(e.target.value)}
                className="bg-white/90 dark:bg-zinc-800/90 text-[11.5px] font-medium rounded-md px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-700 outline-none cursor-pointer text-zinc-800 dark:text-zinc-200"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.accountLabel ? `(${s.accountLabel})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <button
              onClick={swapSplitServices}
              className="p-1 rounded-md hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 transition-colors cursor-pointer"
              title="Swap Left & Right Panes (⌘⌥S)"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>

            {/* Right Pane Selector */}
            <div className="flex items-center space-x-1 pr-1.5">
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">R:</span>
              <select
                value={secondaryServiceId || ''}
                onChange={(e) => setSecondaryServiceId(e.target.value)}
                className="bg-white/90 dark:bg-zinc-800/90 text-[11.5px] font-medium rounded-md px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-700 outline-none cursor-pointer text-zinc-800 dark:text-zinc-200"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.accountLabel ? `(${s.accountLabel})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Ratio Presets */}
            <div className="flex items-center space-x-0.5 pl-1 border-l border-zinc-200 dark:border-zinc-700">
              {[
                { label: '50:50', ratio: 50 },
                { label: '70:30', ratio: 70 },
                { label: '30:70', ratio: 30 },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => setSplitRatio(p.ratio)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                    settings.splitRatio === p.ratio
                      ? 'bg-purple-600 text-white font-bold'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Active Service Name & Account Badge */
          <div className="hidden lg:flex items-center space-x-2 pointer-events-auto">
            <span className="font-semibold text-[13px] text-zinc-800 dark:text-zinc-200">
              {activeService.name}
            </span>
            {activeService.accountLabel && (
              <span
                className="px-2 py-0.5 rounded-full text-[10.5px] font-medium border shadow-2xs"
                style={{
                  backgroundColor: isNoir ? '#222533' : '#FFFFFF',
                  color: activeService.accentColor || activeTheme.accent,
                  borderColor: isNoir ? '#363B4E' : '#EAEAF0',
                }}
              >
                {activeService.accountLabel}
              </span>
            )}
            {activeService.isHibernated && (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-[10.5px] font-medium animate-pulse">
                Sleeping
              </span>
            )}
            {settings.screenShareShield && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10.5px] font-medium flex items-center space-x-1">
                <EyeOff className="w-3 h-3" />
                <span>Shielded</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex-1 max-w-sm mx-4 flex justify-center">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className={`titlebar-no-drag w-full max-w-[260px] h-8 px-3 rounded-lg flex items-center justify-between text-[12px] transition-all duration-150 border cursor-pointer ${
            isNoir
              ? 'bg-zinc-800/60 hover:bg-zinc-800 border-zinc-700/60 text-zinc-300'
              : 'bg-white/70 hover:bg-white border-zinc-200/90 text-zinc-600 shadow-2xs'
          }`}
        >
          <div className="flex items-center space-x-2 pointer-events-none">
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-medium">Quick Switcher</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-black/5 dark:bg-white/10 font-semibold pointer-events-none">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Quick Utility Actions */}
      <div className="flex items-center space-x-1 titlebar-no-drag">
        {/* Hibernate / Wake toggle button for instant RAM control */}
        {activeService.isHibernated ? (
          <button
            onClick={() => wakeService(activeService.id)}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center space-x-1.5 hover:brightness-105 cursor-pointer shadow-2xs"
            title="Wake Service (Restore RAM & Connection)"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Wake</span>
          </button>
        ) : (
          <button
            onClick={() => hibernateService(activeService.id)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isNoir ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-white/80 text-zinc-600'
            }`}
            title="Hibernate Tab (Free RAM immediately)"
          >
            <BedDouble className="w-4 h-4" />
          </button>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center space-x-0.5 mx-1 px-1 py-0.5 rounded-lg bg-black/5 dark:bg-white/5">
          <button
            onClick={() => handleZoom(-0.1)}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              isNoir ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-white/80 text-zinc-600'
            }`}
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono font-medium w-8 text-center select-none text-zinc-700 dark:text-zinc-300">
            {Math.round((activeService.zoomFactor || 1.0) * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.1)}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              isNoir ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-white/80 text-zinc-600'
            }`}
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mute Audio */}
        <button
          onClick={toggleMute}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeService.isMuted
              ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
              : isNoir
              ? 'hover:bg-zinc-800 text-zinc-400'
              : 'hover:bg-white/80 text-zinc-600'
          }`}
          title={activeService.isMuted ? 'Unmute Tab' : 'Mute Tab'}
        >
          {activeService.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Presenter Mode (Screen-Share Shield) */}
        <button
          onClick={toggleScreenShareShield}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            settings.screenShareShield
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/40'
              : isNoir
              ? 'hover:bg-zinc-800 text-zinc-400'
              : 'hover:bg-white/80 text-zinc-600'
          }`}
          title={
            settings.screenShareShield
              ? 'Presenter Mode Active (PII Blurred) - Click to Disable'
              : 'Enable Presenter Mode (Smart PII & Message Blurring for Screen Sharing)'
          }
        >
          {settings.screenShareShield ? (
            <EyeOff className="w-4 h-4 text-emerald-500" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>

        {/* Reload */}
        <button
          onClick={reloadActiveService}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isNoir ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-white/80 text-zinc-600'
          }`}
          title="Reload Service (⌘R)"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Swap Split Panes (When Split View is Active) */}
        {settings.splitViewEnabled && (
          <button
            onClick={swapSplitServices}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isNoir ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-white/80 text-zinc-600'
            }`}
            title="Swap Left / Right Split Panes (⌘⌥S)"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
