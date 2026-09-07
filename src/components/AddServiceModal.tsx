import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SERVICE_PRESETS, THEMES } from '../constants/presets';
import { ServicePreset } from '../types';
import { ServiceIcon } from './ServiceIcon';
import { X, Plus, Sparkles, ShieldCheck, Globe, Check } from 'lucide-react';

const PASTEL_COLORS = [
  '#25D366', // WhatsApp green
  '#128C7E', // WhatsApp dark teal
  '#2AABEE', // Telegram blue
  '#A194F7', // Lavender
  '#F48498', // Sakura pink
  '#70A288', // Matcha sage
  '#00B4D8', // Nordic blue
  '#F6B93B', // Buttercup
  '#ECB22E', // Slack amber
  '#5865F2', // Discord blurple
];

export const AddServiceModal: React.FC = () => {
  const { isAddServiceOpen, setAddServiceOpen, addService, services, settings } = useApp();

  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [selectedPreset, setSelectedPreset] = useState<ServicePreset | null>(null);

  // Form states
  const [accountLabel, setAccountLabel] = useState('');
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [selectedColor, setSelectedColor] = useState(PASTEL_COLORS[0]);

  if (!isAddServiceOpen) return null;

  const isNoir = settings.theme === 'noir';

  const handleSelectPreset = (preset: ServicePreset) => {
    setSelectedPreset(preset);
    setCustomName(preset.name);
    // Count existing accounts of this type to suggest e.g. "Account 2" or "Work"
    const existingCount = services.filter((s) => s.type === preset.type).length;
    if (existingCount === 0) {
      setAccountLabel(preset.badgeTag || 'Primary');
    } else {
      setAccountLabel(`Account ${existingCount + 1}`);
    }
    setSelectedColor(preset.defaultColor || PASTEL_COLORS[0]);
  };

  const handleConfirmAdd = () => {
    if (activeTab === 'presets' && selectedPreset) {
      addService(selectedPreset, customName, undefined, accountLabel, selectedColor);
    } else if (activeTab === 'custom' && customUrl) {
      let finalUrl = customUrl.trim();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      const customPreset: ServicePreset = {
        type: 'custom',
        name: customName || 'Custom App',
        description: 'User-added web service',
        defaultUrl: finalUrl,
        defaultColor: selectedColor,
        category: 'chat',
        supportsMultiple: true,
      };
      addService(customPreset, customName || 'Custom App', finalUrl, accountLabel || 'Custom', selectedColor);
    }

    setAddServiceOpen(false);
    setSelectedPreset(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={() => setAddServiceOpen(false)}
    >
      <div
        className={`w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border flex flex-col max-h-[85vh] transition-all animate-slide-up ${
          isNoir
            ? 'bg-[#161824] border-zinc-700/80 text-zinc-100'
            : 'bg-white/95 border-white/90 text-zinc-800 backdrop-blur-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-inherit">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shadow-xs">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base">Add New Chat or Account</h2>
              <p className="text-xs text-zinc-400">
                Run unlimited WhatsApp & messaging accounts in isolated session partitions
              </p>
            </div>
          </div>

          <button
            onClick={() => setAddServiceOpen(false)}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3 flex space-x-2 border-b border-inherit pb-2">
          <button
            onClick={() => {
              setActiveTab('presets');
              setSelectedPreset(null);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'presets'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Curated Services
          </button>
          <button
            onClick={() => {
              setActiveTab('custom');
              setSelectedPreset(null);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'custom'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Add Any Custom URL
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Multiple WhatsApp Info Box */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start space-x-3 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-emerald-800 dark:text-emerald-300 leading-relaxed">
              <strong>Unlimited Multi-Account Partitioning:</strong> You can add multiple accounts for WhatsApp, Telegram, or Slack. Each account receives a cryptographically separate session partition with its own QR pairing and cookies.
            </div>
          </div>

          {activeTab === 'presets' ? (
            !selectedPreset ? (
              /* Preset Cards Grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SERVICE_PRESETS.map((preset) => {
                  const existingCount = services.filter((s) => s.type === preset.type).length;

                  return (
                    <div
                      key={preset.type}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between ${
                        isNoir
                          ? 'bg-zinc-800/40 hover:bg-zinc-800 border-zinc-700/60'
                          : 'bg-white/80 hover:bg-white border-zinc-200/80 shadow-xs hover:shadow-pastel'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <ServiceIcon type={preset.type} size={32} />
                        {existingCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            {existingCount} active
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                          {preset.name}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                          {preset.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Customize Selected Preset */
              <div className="space-y-4 animate-fade-in">
                <button
                  onClick={() => setSelectedPreset(null)}
                  className="text-xs text-purple-600 hover:underline flex items-center space-x-1"
                >
                  <span>← Back to service list</span>
                </button>

                <div className="flex items-center space-x-3 p-4 rounded-2xl bg-black/5 dark:bg-white/5">
                  <ServiceIcon type={selectedPreset.type} size={36} />
                  <div>
                    <h3 className="font-semibold text-sm">Configuring {selectedPreset.name}</h3>
                    <p className="text-xs text-zinc-400">Give this account a distinctive name & pastel badge</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="e.g. WhatsApp"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">
                      Account Label (Tag)
                    </label>
                    <input
                      type="text"
                      value={accountLabel}
                      onChange={(e) => setAccountLabel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="e.g. Personal, Work, Client 1"
                    />
                  </div>
                </div>

                {/* Pastel Color Swatches */}
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-2">
                    Pastel Accent Color
                  </label>
                  <div className="flex items-center space-x-2">
                    {PASTEL_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                          selectedColor === color ? 'scale-110 ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-zinc-900' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {selectedColor === color && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Custom URL Tab */
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Service URL *</label>
                <div className="flex items-center px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus-within:ring-2 focus-within:ring-purple-400">
                  <Globe className="w-4 h-4 text-zinc-400 mr-2" />
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://app.example.com"
                    className="flex-1 text-xs bg-transparent outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="e.g. My Internal Web App"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">
                    Account Label
                  </label>
                  <input
                    type="text"
                    value={accountLabel}
                    onChange={(e) => setAccountLabel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="e.g. Work, Admin"
                  />
                </div>
              </div>

              {/* Pastel Color Swatches */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-2">
                  Pastel Accent Color
                </label>
                <div className="flex items-center space-x-2">
                  {PASTEL_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                        selectedColor === color ? 'scale-110 ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-zinc-900' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-inherit space-x-3">
          <button
            onClick={() => setAddServiceOpen(false)}
            className="px-4 py-2 rounded-full text-xs font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>

          {(selectedPreset || activeTab === 'custom') && (
            <button
              onClick={handleConfirmAdd}
              disabled={activeTab === 'custom' && !customUrl}
              className="px-6 py-2 rounded-full text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-md disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
            >
              Add to Chatty
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
