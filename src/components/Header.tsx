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
  Sparkles,
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

    // Send zoom to webview
    const webview = document.getElementById(`webview-${activeService.id}`) as any;
    if (webview && typeof webview.setZoomFactor === 'function') {
      webview.setZoomFactor(next);
    }
  };

  const toggleMute = () => {
    const nextMuted = !activeService.isMuted;
    updateService(activeService.id, { isMuted: nextMuted });
    const webview = document.getElementById(`webview-${activeService.id}`) as any;
    if (webview && typeof webview.setAudioMuted === 'function') {
      webview.setAudioMuted(nextMuted);
    }
  };

  return (
    <header
      className={`h-11 w-full flex items-center justify-between px-4 border-b select-none transition-colors duration-200 titlebar-drag ${
        isNoir
          ? 'bg-[#151722]/80 border-zinc-800 text-zinc-200'
          : `${activeTheme.sidebarBg} ${activeTheme.border} backdrop-blur-md`
      }`}
    >
      {/* Left: Service Identity & Account Partition Badge */}
      <div className="flex items-center space-x-2.5 titlebar-no-drag">
        <span className="font-semibold text-xs tracking-tight">
          {activeService.name}
        </span>

        {activeService.accountLabel && (
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-medium border shadow-xs flex items-center space-x-1"
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
          className={`px-1.5 py-0.5 rounded text-[9px] flex items-center space-x-1 ${
            isNoir ? 'bg-zinc-800/80 text-zinc-400' : 'bg-white/60 text-zinc-500'
          }`}
          title={`Isolated session partition: ${activeService.partition}`}
        >
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span className="hidden sm:inline">Isolated Session</span>
        </span>

        {activeService.isHibernated && (
          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-[9px] font-medium animate-pulse">
            Sleeping (RAM Saved)
          </span>
        )}
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex-1 max-w-sm mx-4 flex justify-center titlebar-no-drag">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className={`w-full max-w-[240px] h-7 px-2.5 rounded-lg flex items-center justify-between text-xs transition-all duration-150 border ${
            isNoir
              ? 'bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700/60 text-zinc-400'
              : 'bg-white/60 hover:bg-white/90 border-zinc-200/80 text-zinc-500 shadow-xs'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <Search className="w-3.5 h-3.5" />
            <span className="text-[11px]">Quick Switcher</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/5 dark:bg-white/10">
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
            className="px-2 py-1 rounded-md text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center space-x-1 hover:brightness-105"
            title="Wake Service (Restore RAM & Connection)"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Wake</span>
          </button>
        ) : (
          <button
            onClick={() => hibernateService(activeService.id)}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              isNoir ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-white/70 text-zinc-600'
            }`}
            title="Hibernate Tab (Free RAM immediately)"
          >
            <BedDouble className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center space-x-0.5 mr-1">
          <button
            onClick={() => handleZoom(-0.1)}
            className={`p-1 rounded-md transition-colors ${
              isNoir ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-white/70 text-zinc-600'
            }`}
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono w-7 text-center">
            {Math.round((activeService.zoomFactor || 1.0) * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.1)}
            className={`p-1 rounded-md transition-colors ${
              isNoir ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-white/70 text-zinc-600'
            }`}
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mute Audio */}
        <button
          onClick={toggleMute}
          className={`p-1.5 rounded-md transition-colors ${
            activeService.isMuted
              ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
              : isNoir
              ? 'hover:bg-zinc-800 text-zinc-400'
              : 'hover:bg-white/70 text-zinc-600'
          }`}
          title={activeService.isMuted ? 'Unmute Tab' : 'Mute Tab'}
        >
          {activeService.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Reload */}
        <button
          onClick={reloadActiveService}
          className={`p-1.5 rounded-md transition-colors ${
            isNoir ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-white/70 text-zinc-600'
          }`}
          title="Reload Service (⌘R)"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        {/* Split View Toggle */}
        <button
          onClick={() => toggleSplitView()}
          className={`p-1.5 rounded-md transition-colors ${
            settings.splitViewEnabled
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
              : isNoir
              ? 'hover:bg-zinc-800 text-zinc-400'
              : 'hover:bg-white/70 text-zinc-600'
          }`}
          title="Toggle Split View (⌘S)"
        >
          <Columns className="w-3.5 h-3.5" />
        </button>

        {/* Open in default browser */}
        <button
          onClick={openExternalActiveService}
          className={`p-1.5 rounded-md transition-colors ${
            isNoir ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-white/70 text-zinc-600'
          }`}
          title="Open in System Browser"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
