import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import { THEMES } from './constants/presets';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { WebViewContainer } from './components/WebViewContainer';
import { CommandPalette } from './components/CommandPalette';
import { AddServiceModal } from './components/AddServiceModal';
import { MemoryMonitorModal } from './components/MemoryMonitorModal';
import { SettingsModal } from './components/SettingsModal';
import { PrivacyShield } from './components/PrivacyShield';
import { OnboardingModal } from './components/OnboardingModal';
import { MoonStar } from 'lucide-react';

export const App: React.FC = () => {
  const {
    services,
    settings,
    setActiveServiceId,
    setCommandPaletteOpen,
    setAddServiceOpen,
    setSettingsOpen,
    toggleSplitView,
    swapSplitServices,
    toggleFocusMode,
    lockApp,
    toggleScreenShareShield,
  } = useApp();

  const activeTheme = THEMES[settings.theme] || THEMES.sakura;
  const isNoir = settings.theme === 'noir';

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl) {
        // Cmd+Alt+S: Swap Split Panes
        if (e.altKey && e.key.toLowerCase() === 's') {
          e.preventDefault();
          swapSplitServices();
        }
        // Cmd+S: Split View
        else if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          toggleSplitView();
        }
        // Cmd+P: Presenter Mode (Screen-Share Shield)
        else if (e.key.toLowerCase() === 'p') {
          e.preventDefault();
          toggleScreenShareShield();
        }
        // Cmd+K: Command Palette
        else if (e.key.toLowerCase() === 'k') {
          e.preventDefault();
          setCommandPaletteOpen(true);
        }
        // Cmd+L: Privacy Shield
        else if (e.key.toLowerCase() === 'l') {
          e.preventDefault();
          lockApp();
        }
        // Cmd+D: Focus Mode
        else if (e.key.toLowerCase() === 'd') {
          e.preventDefault();
          toggleFocusMode();
        }
        // Cmd+N: Add Service
        else if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          setAddServiceOpen(true);
        }
        // Cmd+,: Settings
        else if (e.key === ',') {
          e.preventDefault();
          setSettingsOpen(true);
        }
        // Cmd+1..9: Select Chat Account
        else if (e.key >= '1' && e.key <= '9') {
          const index = parseInt(e.key, 10) - 1;
          if (services[index]) {
            e.preventDefault();
            setActiveServiceId(services[index].id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    services,
    setCommandPaletteOpen,
    setAddServiceOpen,
    setSettingsOpen,
    toggleSplitView,
    toggleFocusMode,
    lockApp,
    setActiveServiceId,
  ]);

  return (
    <div
      className={`relative w-screen h-screen flex flex-row overflow-hidden select-none transition-colors duration-300 ${
        isNoir ? 'bg-[#0E1017] text-zinc-100 dark' : `${activeTheme.appBg} text-zinc-800`
      }`}
      style={
        {
          '--glow-color': activeTheme.accent + '40',
        } as React.CSSProperties
      }
    >
      {/* Focus Mode Ambient Glow Badge if active */}
      {settings.focusMode && (
        <div className="absolute top-2 right-4 z-40 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold backdrop-blur-md animate-fade-in shadow-xs">
          <MoonStar className="w-3.5 h-3.5" />
          <span>Focus Mode On (Distractions Silenced)</span>
        </div>
      )}

      {/* Main Sidebar */}
      <Sidebar />

      {/* Primary Workspace */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header />
        <WebViewContainer />
      </main>

      {/* Modals & Overlays */}
      <CommandPalette />
      <AddServiceModal />
      <MemoryMonitorModal />
      <SettingsModal />
      <PrivacyShield />
      <OnboardingModal />
    </div>
  );
};
