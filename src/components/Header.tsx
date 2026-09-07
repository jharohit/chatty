import React from 'react';
import { useApp } from '../context/AppContext';
import { THEMES } from '../constants/presets';
import {
  RotateCw,
  ExternalLink,
  Search,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  BedDouble,
  Play,
  ShieldCheck,
  Columns,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeService,
    updateService,
    reloadActiveService,
    openExternalActiveService,
    hibernateService,
    wakeService,
    settings,
    setCommandPaletteOpen,
    toggleSplitView,
  } = useApp();

  const activeTheme = THEMES[settings.theme] || THEMES.sakura;
  const isNoir = settings.theme === 'noir';

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
      {/* Left: Service Identity & Account Partition Badge (Draggable) */}
      <div className="flex items-center space-x-2.5 pointer-events-none">
        <span className="font-semibold text-[13.5px] tracking-tight pointer-events-auto">
          {activeService.name}
        </span>

        {activeService.accountLabel && (
          <span
            className="px-2 py-0.5 rounded-full text-[11px] font-medium border shadow-2xs flex items-center space-x-1 pointer-events-auto"
            style={{
              backgroundColor: isNoir ? '#222533' : '#FFFFFF',
              color: activeService.accentColor || activeTheme.accent,
              borderColor: isNoir ? '#363B4E' : '#EAEAF0',
            }}
          >
            <span>{activeService.accountLabel}</span>
          </span>
        )}

        <span
          className={`px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center space-x-1 pointer-events-auto ${
            isNoir ? 'bg-zinc-800/80 text-zinc-400' : 'bg-white/70 text-zinc-600 border border-zinc-200/50 shadow-2xs'
          }`}
          title={`Isolated session partition: ${activeService.partition}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span className="hidden sm:inline">Isolated Session</span>
        </span>

        {activeService.isHibernated && (
          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-[11px] font-medium animate-pulse pointer-events-auto">
            Sleeping (RAM Saved)
          </span>
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

        {/* Split View Toggle */}
        <button
          onClick={() => toggleSplitView()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            settings.splitViewEnabled
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
              : isNoir
              ? 'hover:bg-zinc-800 text-zinc-400'
              : 'hover:bg-white/80 text-zinc-600'
          }`}
          title="Toggle Split View (⌘S)"
        >
          <Columns className="w-4 h-4" />
        </button>

        {/* Open in default browser */}
        <button
          onClick={openExternalActiveService}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isNoir ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-white/80 text-zinc-600'
          }`}
          title="Open in System Browser"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
