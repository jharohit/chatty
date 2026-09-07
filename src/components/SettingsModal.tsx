import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { THEMES } from '../constants/presets';
import { ThemeId } from '../types';
import { platform } from '../services/platform';
import {
  X,
  Palette,
  Volume2,
  VolumeX,
  Zap,
  Shield,
  Key,
  Trash2,
  Check,
  Command,
  HardDrive,
  Info,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setSettingsOpen, settings, setTheme, updateService } = useApp();

  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [autoSleepMinutes, setAutoSleepMinutes] = useState(settings.autoSleepMinutes);
  const [pinInput, setPinInput] = useState(settings.privacyPin || '');
  const [userDataPath, setUserDataPath] = useState('');
  const [isSavedPin, setIsSavedPin] = useState(false);

  useEffect(() => {
    platform.getUserDataPath().then(setUserDataPath).catch(() => {});
  }, []);

  if (!isSettingsOpen) return null;

  const isNoir = settings.theme === 'noir';

  const handleSavePin = () => {
    // Save pin
    const saved = localStorage.getItem('chatty_settings_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.privacyPin = pinInput;
      localStorage.setItem('chatty_settings_v1', JSON.stringify(parsed));
    }
    setIsSavedPin(true);
    setTimeout(() => setIsSavedPin(false), 2000);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    const saved = localStorage.getItem('chatty_settings_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.soundEnabled = next;
      localStorage.setItem('chatty_settings_v1', JSON.stringify(parsed));
    }
  };

  const handleChangeAutoSleep = (mins: number) => {
    setAutoSleepMinutes(mins);
    const saved = localStorage.getItem('chatty_settings_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.autoSleepMinutes = mins;
      localStorage.setItem('chatty_settings_v1', JSON.stringify(parsed));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={() => setSettingsOpen(false)}
    >
      <div
        className={`w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border flex flex-col max-h-[85vh] transition-all animate-slide-up ${
          isNoir
            ? 'bg-[#161824] border-zinc-700/80 text-zinc-100'
            : 'bg-white/95 border-white/90 text-zinc-800 backdrop-blur-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-inherit">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base">Preferences & Themes</h2>
              <p className="text-xs text-zinc-400">Personalize Chatty's pastel aesthetics & memory saver</p>
            </div>
          </div>

          <button
            onClick={() => setSettingsOpen(false)}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Pastel Theme Palette */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Palette className="w-4 h-4 text-purple-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Signature Pastel Themes
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.values(THEMES).map((thm) => {
                const isSelected = settings.theme === thm.id;
                return (
                  <div
                    key={thm.id}
                    onClick={() => setTheme(thm.id as ThemeId)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                      isSelected
                        ? 'ring-2 ring-purple-500 border-purple-500/50 shadow-md'
                        : 'border-zinc-200 dark:border-zinc-700/60 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg">{thm.emoji}</span>
                      {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                    </div>
                    <div className="font-semibold text-xs mb-1">{thm.name}</div>
                    <div className="flex items-center space-x-1.5 mt-2">
                      {thm.previewColors.map((col, idx) => (
                        <div
                          key={idx}
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Audio & RAM Saver */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Audio Feedback */}
            <div className="p-4 rounded-2xl border border-inherit bg-black/[0.02] dark:bg-white/[0.02] flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-zinc-400" />
                  )}
                  <span className="text-xs font-semibold">Tactile Audio Feedback</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Subtle organic chimes synthesized via Web Audio API on clicks and tabs
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs">{soundEnabled ? 'Enabled' : 'Muted'}</span>
                <button
                  onClick={handleToggleSound}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    soundEnabled
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  Toggle
                </button>
              </div>
            </div>

            {/* RAM Auto-Sleep */}
            <div className="p-4 rounded-2xl border border-inherit bg-black/[0.02] dark:bg-white/[0.02] flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold">Auto-Sleep Background Tabs</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Hibernate idle tabs to keep Mac memory lean and CPU cool
                </p>
              </div>

              <div className="mt-3 flex items-center space-x-1.5">
                {[10, 15, 30, 0].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleChangeAutoSleep(mins)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                      autoSleepMinutes === mins
                        ? 'bg-amber-500 text-white'
                        : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'
                    }`}
                  >
                    {mins === 0 ? 'Never' : `${mins}m`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Privacy Shield Lock PIN */}
          <div className="p-4 rounded-2xl border border-inherit bg-black/[0.02] dark:bg-white/[0.02]">
            <div className="flex items-center space-x-2 mb-1">
              <Shield className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-semibold">Privacy Shield Lock (⌘L)</span>
            </div>
            <p className="text-[11px] text-zinc-400 mb-3">
              Blur screen when away from keyboard. Optionally set a 4-digit PIN code.
            </p>

            <div className="flex items-center space-x-2 max-w-xs">
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Leave blank for click-to-unlock"
                className="flex-1 px-3 py-1.5 rounded-xl text-xs border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-purple-400 font-mono"
              />
              <button
                onClick={handleSavePin}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 text-white shadow-xs hover:bg-purple-700 transition-colors"
              >
                {isSavedPin ? 'Saved!' : 'Save PIN'}
              </button>
            </div>
          </div>

          {/* Section 4: Keyboard Shortcuts Cheatsheet */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Command className="w-4 h-4 text-zinc-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Keyboard Shortcuts Cheatsheet
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { key: '⌘ 1 .. 9', desc: 'Jump to specific chat account' },
                { key: '⌘ K', desc: 'Quick Switcher & Command Palette' },
                { key: '⌘ S', desc: 'Toggle Side-by-Side Split View' },
                { key: '⌘ L', desc: 'Lock Frosted Privacy Shield' },
                { key: '⌘ D', desc: 'Toggle Focus / Do Not Disturb' },
                { key: '⌘ N', desc: 'Add Service or WhatsApp Account' },
                { key: '⌘ R', desc: 'Reload active chat session' },
                { key: '⌘ ,', desc: 'Open Preferences & Themes' },
              ].map((shortcut, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-inherit"
                >
                  <span className="text-zinc-500">{shortcut.desc}</span>
                  <kbd className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-black/5 dark:bg-white/10 font-semibold">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Local-Only Storage Path */}
          <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-inherit flex items-center space-x-2 text-[11px] text-zinc-400">
            <HardDrive className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">Data location: {userDataPath || '~/Library/Application Support/Chatty'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
