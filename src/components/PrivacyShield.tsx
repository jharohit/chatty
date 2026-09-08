import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/sound';
import { ChattyLogo } from './ChattyLogo';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const PrivacyShield: React.FC = () => {
  const { settings, unlockApp } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Pomodoro Break Timer States (5 min, 15 min, 25 min)
  const [breakDurationMinutes, setBreakDurationMinutes] = useState<number>(5);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(5 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [timerFinished, setTimerFinished] = useState<boolean>(false);
  const chimePlayedRef = useRef<boolean>(false);

  // Reset states when privacy shield opens
  useEffect(() => {
    if (settings.privacyLocked) {
      setPin('');
      setError(false);
      setSecondsRemaining(breakDurationMinutes * 60);
      setIsTimerRunning(true);
      setTimerFinished(false);
      chimePlayedRef.current = false;
    }
  }, [settings.privacyLocked, breakDurationMinutes]);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Pomodoro countdown timer
  useEffect(() => {
    if (!settings.privacyLocked || !isTimerRunning) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimerRunning(false);
          setTimerFinished(true);
          if (!chimePlayedRef.current) {
            chimePlayedRef.current = true;
            sounds.playNotification();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.privacyLocked, isTimerRunning]);

  if (!settings.privacyLocked) return null;

  const isDark = settings.theme === 'noir';

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
    } else if (e.key === 'Escape' && !settings.privacyPin) {
      handleUnlock();
    }
  };

  const handleSelectDuration = (minutes: number) => {
    sounds.playClick();
    setBreakDurationMinutes(minutes);
    setSecondsRemaining(minutes * 60);
    setIsTimerRunning(true);
    setTimerFinished(false);
    chimePlayedRef.current = false;
  };

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const minutesLeft = Math.floor(secondsRemaining / 60);
  const secondsLeft = secondsRemaining % 60;
  const formattedCountdown = `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;
  const totalSeconds = breakDurationMinutes * 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100 : 100;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between py-10 px-6 select-none transition-colors duration-200 animate-fade-in ${
        isDark
          ? 'bg-[#0B0D14] text-white'
          : 'bg-[#F4F5F9] text-zinc-900'
      }`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Top Bar */}
      <div className="w-full max-w-3xl flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <ChattyLogo size={22} />
          <span
            className={`font-bold text-sm tracking-tight ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}
          >
            Chatty Privacy Shield
          </span>
        </div>

        <div
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border shadow-xs ${
            isDark
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Encrypted & Locked Locally</span>
        </div>
      </div>

      {/* Center Region: Break Companion & Security Unlock Cards */}
      <div className="w-full max-w-3xl flex flex-col md:flex-row items-center justify-center gap-8 my-auto">
        {/* Card 1: Pomodoro Break Companion */}
        <div
          className={`w-full max-w-[340px] p-7 rounded-3xl border shadow-xl flex flex-col items-center text-center transition-all ${
            isDark
              ? 'bg-[#151824] border-white/15 text-white'
              : 'bg-white border-zinc-200/90 text-zinc-900'
          }`}
        >
          <div className="flex items-center space-x-2 mb-3">
            <Coffee className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            <span
              className={`font-bold text-xs tracking-wider uppercase ${
                isDark ? 'text-amber-400' : 'text-amber-700'
              }`}
            >
              Break Companion
            </span>
          </div>

          {/* Duration Tabs */}
          <div
            className={`flex items-center p-1 rounded-xl border mb-5 ${
              isDark ? 'bg-white/10 border-white/15' : 'bg-zinc-100 border-zinc-200'
            }`}
          >
            {[
              { label: '5m', minutes: 5 },
              { label: '15m', minutes: 15 },
              { label: '25m', minutes: 25 },
            ].map((dur) => (
              <button
                key={dur.minutes}
                onClick={() => handleSelectDuration(dur.minutes)}
                className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  breakDurationMinutes === dur.minutes
                    ? 'bg-purple-600 text-white shadow-md'
                    : isDark
                    ? 'text-white/70 hover:text-white'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {dur.label}
              </button>
            ))}
          </div>

          {/* Circular Countdown Gauge */}
          <div className="relative w-40 h-40 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke={isDark ? 'rgba(255, 255, 255, 0.12)' : '#E4E4E7'}
                strokeWidth="7"
                className="fill-none"
              />
              {/* Active Animated Progress Track */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#9333EA"
                strokeWidth="7"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * progressPercent) / 100}
                strokeLinecap="round"
                className="fill-none transition-all duration-1000 ease-linear"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <span
                className={`text-4xl font-mono font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-zinc-900'
                }`}
              >
                {formattedCountdown}
              </span>
              <span
                className={`text-xs font-semibold mt-0.5 ${
                  isDark ? 'text-purple-300' : 'text-purple-700'
                }`}
              >
                {timerFinished ? 'Complete' : isTimerRunning ? 'Resting' : 'Paused'}
              </span>
            </div>
          </div>

          {/* Break Status / Notification Message */}
          {timerFinished ? (
            <div
              className={`flex items-center space-x-1.5 text-xs font-bold mb-4 ${
                isDark ? 'text-emerald-300' : 'text-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Break complete! Fully recharged.</span>
            </div>
          ) : (
            <p
              className={`text-xs mb-4 leading-relaxed ${
                isDark ? 'text-white/80' : 'text-zinc-600'
              }`}
            >
              Take a breath, rest your eyes, and recharge your mind.
            </p>
          )}

          {/* Timer Controls */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => {
                sounds.playClick();
                setIsTimerRunning(!isTimerRunning);
              }}
              className={`px-5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-2 cursor-pointer shadow-xs ${
                isDark
                  ? 'bg-white/15 hover:bg-white/25 text-white border-white/20'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-300'
              }`}
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setSecondsRemaining(breakDurationMinutes * 60);
                setIsTimerRunning(true);
                setTimerFinished(false);
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDark
                  ? 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border-white/15'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 border-zinc-300'
              }`}
              title="Restart Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Security & Unlock Authentication Form */}
        <div
          className={`w-full max-w-[340px] p-7 rounded-3xl border shadow-xl flex flex-col items-center text-center transition-all ${
            error ? 'animate-shake ring-2 ring-rose-500' : ''
          } ${
            isDark
              ? 'bg-[#151824] border-white/15 text-white'
              : 'bg-white border-zinc-200/90 text-zinc-900'
          }`}
        >
          {/* Clock Display */}
          <div
            className={`text-4xl font-light tracking-tight font-sans mb-1 ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}
          >
            {formattedTime}
          </div>
          <div
            className={`text-xs font-semibold mb-6 ${
              isDark ? 'text-white/70' : 'text-zinc-500'
            }`}
          >
            {formattedDate}
          </div>

          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-xs border ${
              isDark
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                : 'bg-purple-100 text-purple-700 border-purple-200'
            }`}
          >
            <Lock className="w-5 h-5" />
          </div>

          <h3
            className={`font-bold text-base mb-1 ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}
          >
            {settings.privacyPin ? 'Enter Security PIN' : 'Screen Locked'}
          </h3>
          <p
            className={`text-xs mb-5 ${
              isDark ? 'text-white/80' : 'text-zinc-600'
            }`}
          >
            {settings.privacyPin ? 'Enter your PIN to resume chats' : 'Click below to unlock your workspace'}
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
                className={`w-full text-center py-2.5 rounded-xl text-base tracking-widest font-mono border outline-none focus:ring-2 focus:ring-purple-400 font-bold ${
                  isDark
                    ? 'border-white/20 bg-white/10 text-white placeholder-white/40 focus:border-purple-400'
                    : 'border-zinc-300 bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:border-purple-600'
                }`}
              />
              <button
                onClick={handleUnlock}
                className={`w-full py-3 rounded-xl text-xs font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                  isDark
                    ? 'bg-white hover:bg-zinc-100 text-zinc-950'
                    : 'bg-zinc-900 hover:bg-black text-white'
                }`}
              >
                Unlock
              </button>
            </div>
          ) : (
            <button
              onClick={handleUnlock}
              className={`w-full py-3 rounded-xl text-xs font-bold shadow-lg flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                isDark
                  ? 'bg-white hover:bg-zinc-100 text-zinc-950'
                  : 'bg-zinc-900 hover:bg-black text-white'
              }`}
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Screen (Enter)</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Status Hint with High Contrast in both modes */}
      <div
        className={`text-xs flex items-center space-x-2 ${
          isDark ? 'text-white/70' : 'text-zinc-600'
        }`}
      >
        <Sparkles className="w-4 h-4 text-purple-500" />
        <span className="font-medium">Strictly Local • Zero Cloud Storage • Press Enter to resume</span>
      </div>
    </div>
  );
};
