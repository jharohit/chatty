import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { THEMES } from '../constants/presets';
import { Lock, Unlock, ShieldCheck, Sparkles } from 'lucide-react';

export const PrivacyShield: React.FC = () => {
  const { settings, unlockApp } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (settings.privacyLocked) {
      setPin('');
      setError(false);
    }
  }, [settings.privacyLocked]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!settings.privacyLocked) return null;

  const activeTheme = THEMES[settings.theme] || THEMES.sakura;
  const isNoir = settings.theme === 'noir';

  const handleUnlock = () => {
    const success = unlockApp(pin);
    if (!success) {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between py-16 px-6 select-none transition-all duration-300 animate-fade-in ${
        isNoir
          ? 'bg-[#0E1017]/90 text-zinc-100 backdrop-blur-3xl'
          : 'bg-white/80 text-zinc-800 backdrop-blur-3xl'
      }`}
    >
      {/* Top Badge */}
      <div className="flex items-center space-x-2 text-xs font-semibold px-4 py-1.5 rounded-full glass-panel shadow-sm text-emerald-600 dark:text-emerald-400">
        <ShieldCheck className="w-4 h-4" />
        <span>Chatty Privacy Shield Active</span>
      </div>

      {/* Center Clock & Unlock Form */}
      <div className="flex flex-col items-center max-w-sm w-full text-center">
        {/* Live Clock */}
        <div className="text-6xl font-light tracking-tight mb-2 font-sans">{formattedTime}</div>
        <div className="text-sm font-medium text-zinc-500 mb-8">{formattedDate}</div>

        {/* Unlock Box */}
        <div
          className={`w-full p-6 rounded-3xl border shadow-2xl flex flex-col items-center transition-all ${
            error ? 'animate-shake ring-2 ring-rose-500' : ''
          } ${
            isNoir
              ? 'bg-[#181A26]/95 border-zinc-700/80 text-zinc-100'
              : 'bg-white/90 border-white/80 text-zinc-800 glass-panel'
          }`}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
            style={{ backgroundColor: activeTheme.accent + '25', color: activeTheme.accent }}
          >
            <Lock className="w-5 h-5" />
          </div>

          <h3 className="font-semibold text-base mb-1">Welcome Back</h3>
          <p className="text-xs text-zinc-400 mb-5">
            {settings.privacyPin ? 'Enter your PIN to unlock' : 'Click to restore your chats'}
          </p>

          {settings.privacyPin ? (
            <div className="w-full space-y-3">
              <input
                type="password"
                maxLength={8}
                autoFocus
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter PIN"
                className="w-full text-center py-2.5 rounded-xl text-base tracking-widest font-mono border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                onClick={handleUnlock}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                Unlock
              </button>
            </div>
          ) : (
            <button
              onClick={handleUnlock}
              className="px-6 py-2.5 rounded-full text-xs font-semibold shadow-md flex items-center space-x-2 transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: activeTheme.accent, color: '#FFFFFF' }}
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Screen</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom local guarantee */}
      <div className="text-[11px] text-zinc-400 flex items-center space-x-1.5">
        <span>Protected locally on your Mac • Press Esc or Enter to unlock</span>
      </div>
    </div>
  );
};
