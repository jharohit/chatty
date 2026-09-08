import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { THEMES } from '../constants/presets';
import { ThemeId } from '../types';
import { platform } from '../services/platform';
import { ChattyLogo } from './ChattyLogo';
import {
  X,
  Palette,
  Volume2,
  VolumeX,
  Zap,
  Shield,
  Check,
  Command,
  HardDrive,
  ZoomIn,
  Sparkles,
  Sliders,
  Keyboard,
  FolderOpen,
  EyeOff,
} from 'lucide-react';

type SettingsTab = 'general' | 'memory' | 'privacy' | 'shortcuts';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setSettingsOpen,
    settings,
    setTheme,
    updateSettings,
    setDefaultZoom,
    toggleScreenShareShield,
    setOnboardingOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [userDataPath, setUserDataPath] = useState('');
  const [pinInput, setPinInput] = useState(settings.privacyPin || '');
  const [pinSavedFeedback, setPinSavedFeedback] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);

  useEffect(() => {
    platform.getUserDataPath().then(setUserDataPath).catch(() => {});
  }, []);

  if (!isSettingsOpen) return null;

  const isNoir = settings.theme === 'noir';
  const currentZoom = settings.defaultZoom || 1.0;

  const handleSavePin = () => {
    updateSettings({ privacyPin: pinInput });
    setPinSavedFeedback(true);
    setTimeout(() => setPinSavedFeedback(false), 2000);
  };

  const handleCopyPath = () => {
    if (userDataPath) {
      navigator.clipboard.writeText(userDataPath);
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 2000);
    }
  };

  const zoomOptions = [
    { label: '90%', value: 0.9 },
    { label: '100%', value: 1.0 },
    { label: '110%', value: 1.1 },
    { label: '125%', value: 1.25 },
    { label: '140%', value: 1.4 },
  ];

  const sleepOptions = [
    { label: '5 min', value: 5 },
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '1 hour', value: 60 },
    { label: 'Never', value: 0 },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={() => setSettingsOpen(false)}
    >
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border flex flex-col max-h-[85vh] transition-all animate-slide-up select-none ${
          isNoir
            ? 'bg-[#181A24] border-zinc-700/80 text-zinc-100'
            : 'bg-[#F6F6F8] border-zinc-300/80 text-zinc-800'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* macOS Native Titlebar */}
        <div
          className={`h-12 w-full flex items-center justify-between px-5 border-b shrink-0 titlebar-drag ${
            isNoir ? 'bg-[#151722] border-zinc-800' : 'bg-[#EAEAEF] border-zinc-300/70'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-purple-500" />
            <h2 className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">
              System Settings
            </h2>
          </div>

          {/* Tab Selector (macOS Segmented Control) */}
          <div className="flex items-center p-1 rounded-lg bg-black/5 dark:bg-white/10 titlebar-no-drag">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                activeTab === 'general'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              General & Appearance
            </button>
            <button
              onClick={() => setActiveTab('memory')}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                activeTab === 'memory'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              RAM Saver
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                activeTab === 'privacy'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Privacy & Data
            </button>
            <button
              onClick={() => setActiveTab('shortcuts')}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                activeTab === 'shortcuts'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Shortcuts
            </button>
          </div>

          <button
            onClick={() => setSettingsOpen(false)}
            className="titlebar-no-drag p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: GENERAL & APPEARANCE */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-fade-in">
              {/* Group 1: Chat Font Size & Display Scaling */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-3 mb-2">
                  Display & Typography
                </div>

                <div
                  className={`rounded-xl border p-4 shadow-xs ${
                    isNoir
                      ? 'bg-[#1E202E] border-zinc-700/80'
                      : 'bg-white border-zinc-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-xs">
                        <ZoomIn className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100">
                          Chat & Web Font Scaling
                        </div>
                        <div className="text-[12px] text-zinc-500 dark:text-zinc-400">
                          Adjust default text readability for WhatsApp, Slack, and Telegram
                        </div>
                      </div>
                    </div>

                    {/* Segmented Control for Zoom */}
                    <div className="flex items-center p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      {zoomOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setDefaultZoom(opt.value)}
                          className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-all ${
                            currentZoom === opt.value
                              ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700/60 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        {settings.soundEnabled ? (
                          <Volume2 className="w-4 h-4" />
                        ) : (
                          <VolumeX className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100">
                          Tactile Sound Feedback
                        </div>
                        <div className="text-[12px] text-zinc-500 dark:text-zinc-400">
                          Play gentle organic chimes on tab switching and UI interactions
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        settings.soundEnabled ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                          settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100">
                        Workspace Setup & App Catalog
                      </div>
                      <div className="text-[12px] text-zinc-500 dark:text-zinc-400">
                        Explore AI assistants (Claude, ChatGPT, Gemini, Perplexity, Grok) and messaging
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSettingsOpen(false);
                        setOnboardingOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-all cursor-pointer"
                    >
                      Open Setup
                    </button>
                  </div>
                </div>
              </div>

              {/* Group 2: Signature Pastel Themes */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-3 mb-2">
                  Signature Pastel Themes
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.values(THEMES).map((thm) => {
                    const isSelected = settings.theme === thm.id;
                    return (
                      <div
                        key={thm.id}
                        onClick={() => setTheme(thm.id as ThemeId)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] ${
                          isSelected
                            ? 'ring-2 ring-purple-500 border-purple-500/50 bg-white dark:bg-zinc-800 shadow-sm'
                            : isNoir
                            ? 'bg-[#1E202E] border-zinc-700/70 hover:border-zinc-600'
                            : 'bg-white border-zinc-200/80 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl">{thm.emoji}</span>
                          {isSelected && <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                        </div>
                        <div className="font-semibold text-[13px] text-zinc-800 dark:text-zinc-100 mb-0.5">
                          {thm.name}
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-1 leading-tight mb-2.5">
                          {thm.tagline}
                        </p>
                        <div className="flex items-center space-x-1.5">
                          {thm.previewColors.map((col, idx) => (
                            <div
                              key={idx}
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                              style={{ backgroundColor: col }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RAM SAVER */}
          {activeTab === 'memory' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-3 mb-2">
                  Memory Efficiency & Tab Hibernation
                </div>

                <div
                  className={`rounded-xl border p-4 shadow-xs space-y-4 ${
                    isNoir
                      ? 'bg-[#1E202E] border-zinc-700/80'
                      : 'bg-white border-zinc-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100">
                          Auto-Hibernate Inactive Tabs
                        </div>
                        <div className="text-[12px] text-zinc-500 dark:text-zinc-400">
                          Suspends background chat webviews to release RAM back to macOS
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      {sleepOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateSettings({ autoSleepMinutes: opt.value })}
                          className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-all ${
                            settings.autoSleepMinutes === opt.value
                              ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-xs font-semibold'
                              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100">
                        Background Notifications (Keep Tabs Connected)
                      </div>
                      <div className="text-[12px] text-zinc-500 dark:text-zinc-400">
                        Keep Slack, WhatsApp, and background tabs connected so you never miss incoming messages
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        updateSettings({
                          backgroundNotifications: !settings.backgroundNotifications,
                        })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                        settings.backgroundNotifications !== false
                          ? 'bg-purple-600'
                          : 'bg-zinc-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                          settings.backgroundNotifications !== false
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100">
                        Sidebar Live RAM Badge
                      </div>
                      <div className="text-[12px] text-zinc-500 dark:text-zinc-400">
                        Displays real-time app memory consumption in the bottom sidebar
                      </div>
                    </div>

                    <button
                      onClick={() => updateSettings({ showRamMonitor: !settings.showRamMonitor })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                        settings.showRamMonitor ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                          settings.showRamMonitor ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRIVACY & DATA */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-3 mb-2">
                  Privacy & Screen Shield Lock
                </div>

                <div
                  className={`rounded-xl border p-4 shadow-xs space-y-4 ${
                    isNoir
                      ? 'bg-[#1E202E] border-zinc-700/80'
                      : 'bg-white border-zinc-200/80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100">
                          Privacy Shield PIN (⌘L)
                        </div>
                        <div className="text-[12px] text-zinc-500 dark:text-zinc-400 max-w-sm mb-3">
                          Instantly blurs the entire app when stepping away. Enter an optional numeric PIN to unlock.
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="password"
                            maxLength={8}
                            value={pinInput}
                            onChange={(e) => setPinInput(e.target.value)}
                            placeholder="Leave empty for 1-click unlock"
                            className="px-3 py-1.5 rounded-lg text-[13px] border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-purple-400 font-mono w-56"
                          />
                          <button
                            onClick={handleSavePin}
                            className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors"
                          >
                            {pinSavedFeedback ? 'Saved ✓' : 'Save PIN'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Presenter Mode Screen Share Card */}
                <div
                  className={`mt-4 rounded-xl border p-4 shadow-xs ${
                    isNoir ? 'bg-[#1E202E] border-zinc-700/80' : 'bg-white border-zinc-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        <EyeOff className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100">
                          Presenter Mode (Anti-PII Screen Share Blur)
                        </div>
                        <div className="text-[12px] text-zinc-500 dark:text-zinc-400 max-w-sm">
                          Smart-blurs messages and phone numbers during screen sharing. Hover over any message to reveal.
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={toggleScreenShareShield}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        settings.screenShareShield
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {settings.screenShareShield ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Local Storage Card */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-3 mb-2">
                  Local-Only Data Architecture
                </div>

                <div
                  className={`rounded-xl border p-4 shadow-xs space-y-3 ${
                    isNoir
                      ? 'bg-[#1E202E] border-zinc-700/80'
                      : 'bg-white border-zinc-200/80'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center shadow-xs">
                      <HardDrive className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100">
                        Strictly Local Persistence
                      </div>
                      <div className="text-[12px] text-zinc-500 dark:text-zinc-400">
                        All cookies, sessions, and encrypted caches are stored exclusively on your Mac with zero cloud servers.
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-300 truncate mr-2">
                      {userDataPath || '~/Library/Application Support/Chatty'}
                    </span>
                    <button
                      onClick={handleCopyPath}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white dark:bg-zinc-700 hover:bg-zinc-50 border border-zinc-200 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 shrink-0"
                    >
                      {copiedPath ? 'Copied ✓' : 'Copy Path'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KEYBOARD SHORTCUTS */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-3 mb-2">
                  macOS Native Shortcuts
                </div>

                <div
                  className={`rounded-xl border divide-y overflow-hidden shadow-xs ${
                    isNoir
                      ? 'bg-[#1E202E] border-zinc-700/80 divide-zinc-700/60'
                      : 'bg-white border-zinc-200/80 divide-zinc-100'
                  }`}
                >
                  {[
                    { key: '⌘ 1 .. 9', desc: 'Switch instantly between chat accounts' },
                    { key: '⌘ K', desc: 'Open Command Palette & Omnibox' },
                    { key: '⌘ P', desc: 'Toggle Presenter Mode (Screen-Share Shield)' },
                    { key: '⌘ S', desc: 'Toggle Side-by-Side Split View' },
                    { key: '⌘ ⌥ S', desc: 'Swap Left / Right Split View Panes' },
                    { key: '⌘ L', desc: 'Lock Privacy Screen Shield' },
                    { key: '⌘ D', desc: 'Toggle Focus Mode / Do Not Disturb' },
                    { key: '⌘ N', desc: 'Add Service or another WhatsApp account' },
                    { key: '⌘ R', desc: 'Reload active chat session' },
                    { key: '⌘ ,', desc: 'Open Preferences & Settings' },
                  ].map((shortcut, idx) => (
                    <div key={idx} className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-[13px] text-zinc-700 dark:text-zinc-300">
                        {shortcut.desc}
                      </span>
                      <kbd className="px-2 py-1 rounded-md font-mono text-[11px] bg-zinc-100 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 font-semibold shadow-2xs">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-between shrink-0 text-[12px] text-zinc-500 ${
            isNoir ? 'bg-[#151722] border-zinc-800' : 'bg-[#EAEAEF] border-zinc-300/70'
          }`}
        >
          <div className="flex items-center space-x-2">
            <ChattyLogo size={16} />
            <span className="font-medium text-zinc-600 dark:text-zinc-400">Chatty for macOS • 100% Private & Local</span>
          </div>
          <button
            onClick={() => setSettingsOpen(false)}
            className="px-4 py-1.5 rounded-lg text-[13px] font-medium bg-zinc-900 dark:bg-white hover:bg-zinc-800 text-white dark:text-zinc-900 shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
