import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SERVICE_PRESETS } from '../constants/presets';
import { ServicePreset, WorkspaceId } from '../types';
import { ServiceIcon } from './ServiceIcon';
import { ChattyLogo } from './ChattyLogo';
import {
  Check,
  Plus,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  X,
  Bot,
  Zap,
} from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const {
    isOnboardingOpen,
    setOnboardingOpen,
    isFreshInstall,
    services,
    addService,
    settings,
    setServices,
    updateSettings,
  } = useApp();

  // Presets split by category
  const messagingPresets = useMemo(
    () => SERVICE_PRESETS.filter((p) => p.category === 'chat' || p.category === 'work'),
    []
  );

  const aiPresets = useMemo(
    () => SERVICE_PRESETS.filter((p) => p.category === 'ai'),
    []
  );

  // For fresh install: user selections
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(() => {
    if (isFreshInstall) {
      // Default recommended starting pair
      return new Set(['whatsapp', 'chatgpt']);
    }
    return new Set();
  });

  if (!isOnboardingOpen) return null;

  const isNoir = settings.theme === 'noir';

  // Count selections in fresh install mode
  const selectedMessagingCount = messagingPresets.filter((p) => selectedTypes.has(p.type)).length;
  const selectedAiCount = aiPresets.filter((p) => selectedTypes.has(p.type)).length;
  const canProceedFresh = selectedMessagingCount >= 1 && selectedAiCount >= 1;

  // Toggle selection for fresh install
  const toggleSelection = (type: string) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  // 1-Click add for existing customer
  const handleAddForExisting = (preset: ServicePreset) => {
    addService(
      preset,
      preset.name,
      preset.defaultUrl,
      preset.badgeTag || 'Default',
      preset.defaultColor,
      preset.category === 'work' ? 'work' : preset.category === 'ai' ? 'ai' : 'personal'
    );
  };

  const handleFinishFresh = () => {
    if (!canProceedFresh) return;

    // Create services based on user selection
    const chosenPresets = SERVICE_PRESETS.filter((p) => selectedTypes.has(p.type));
    const newServices = chosenPresets.map((preset, idx) => ({
      id: `srv-${preset.type}-${Date.now().toString(36)}-${idx}`,
      name: preset.name,
      type: preset.type,
      url: preset.defaultUrl,
      partition: `persist:service_${preset.type}_${Date.now().toString(36)}`,
      accountLabel: preset.type.includes('whatsapp') ? 'Personal' : preset.badgeTag || 'Primary',
      accentColor: preset.defaultColor,
      isMuted: false,
      zoomFactor: 1.0,
      isHibernated: idx > 1, // First two are awake, others sleep to save RAM
      lastActive: Date.now() - idx * 1000,
      workspaceId: (preset.category === 'work' ? 'work' : preset.category === 'ai' ? 'ai' : 'personal') as WorkspaceId,
    }));

    setServices(newServices);
    updateSettings({ theme: 'noir' });
    localStorage.setItem('chatty_services_v1', JSON.stringify(newServices));
    localStorage.setItem('chatty_onboarding_v1', 'completed');
    setOnboardingOpen(false);
  };

  const handleFinishExisting = () => {
    localStorage.setItem('chatty_onboarding_v1', 'completed');
    setOnboardingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border flex flex-col max-h-[90vh] transition-all animate-slide-up ${
          isNoir
            ? 'bg-[#121520] border-zinc-800 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-inherit flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <ChattyLogo size={36} className="shrink-0" />
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {isFreshInstall
                  ? 'Welcome to Chatty'
                  : 'Chatty Workspace Setup'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                {isFreshInstall
                  ? 'Choose at least 1 messaging service and 1 AI assistant to configure your private workspace.'
                  : 'Explore newly added AI assistants and services, or review what you already have running.'}
              </p>
            </div>
          </div>

          {!isFreshInstall && (
            <button
              onClick={() => setOnboardingOpen(false)}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Privacy Guarantee Pill */}
          <div className="flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>
              <strong>100% Private & Local:</strong> Every service runs in its own cryptographically isolated cookie partition on your Mac.
            </span>
          </div>

          {/* Section 1: Messaging Services */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  1. Messaging Services {isFreshInstall && '(Pick at least 1)'}
                </h3>
              </div>
              {isFreshInstall && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    selectedMessagingCount >= 1
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {selectedMessagingCount} selected
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {messagingPresets.map((preset) => {
                const isConfigured = services.some((s) => s.type === preset.type);
                const isSelected = selectedTypes.has(preset.type);

                return (
                  <div
                    key={preset.type}
                    onClick={() => {
                      if (isFreshInstall) {
                        toggleSelection(preset.type);
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all relative flex flex-col justify-between cursor-pointer ${
                      isFreshInstall
                        ? isSelected
                          ? 'border-purple-500 ring-2 ring-purple-500/40 bg-purple-500/10 shadow-sm'
                          : isNoir
                          ? 'bg-zinc-800/40 border-zinc-800 hover:border-zinc-700'
                          : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                        : isConfigured
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : isNoir
                        ? 'bg-zinc-800/40 border-zinc-800 hover:border-zinc-700'
                        : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <ServiceIcon type={preset.type} size={28} />
                      {isFreshInstall ? (
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'border-zinc-400 dark:border-zinc-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      ) : isConfigured ? (
                        <span className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <Check className="w-3 h-3" />
                          <span>Added</span>
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddForExisting(preset);
                          }}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-600 text-white shadow-2xs hover:bg-purple-700 transition-colors"
                        >
                          + Add
                        </button>
                      )}
                    </div>

                    <div>
                      <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                        {preset.name}
                      </div>
                      <div className="text-[10.5px] text-zinc-400 line-clamp-1">
                        {preset.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: AI Assistants */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  2. AI Conversational Assistants {isFreshInstall && '(Pick at least 1)'}
                </h3>
              </div>
              {isFreshInstall && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    selectedAiCount >= 1
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {selectedAiCount} selected
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {aiPresets.map((preset) => {
                const isConfigured = services.some((s) => s.type === preset.type);
                const isSelected = selectedTypes.has(preset.type);

                return (
                  <div
                    key={preset.type}
                    onClick={() => {
                      if (isFreshInstall) {
                        toggleSelection(preset.type);
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all relative flex flex-col justify-between cursor-pointer ${
                      isFreshInstall
                        ? isSelected
                          ? 'border-purple-500 ring-2 ring-purple-500/40 bg-purple-500/10 shadow-sm'
                          : isNoir
                          ? 'bg-zinc-800/40 border-zinc-800 hover:border-zinc-700'
                          : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                        : isConfigured
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : isNoir
                        ? 'bg-zinc-800/40 border-zinc-800 hover:border-zinc-700'
                        : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <ServiceIcon type={preset.type} size={28} />
                      {isFreshInstall ? (
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'border-zinc-400 dark:border-zinc-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      ) : isConfigured ? (
                        <span className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <Check className="w-3 h-3" />
                          <span>Added</span>
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddForExisting(preset);
                          }}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-600 text-white shadow-2xs hover:bg-purple-700 transition-colors"
                        >
                          + Add
                        </button>
                      )}
                    </div>

                    <div>
                      <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                        {preset.name}
                      </div>
                      <div className="text-[10.5px] text-zinc-400 line-clamp-1">
                        {preset.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-inherit flex items-center justify-between">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {isFreshInstall ? (
              <span>
                Required: <strong>1+ Messaging</strong> ({selectedMessagingCount}) and{' '}
                <strong>1+ AI Assistant</strong> ({selectedAiCount})
              </span>
            ) : (
              <span>You have {services.length} services currently active.</span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {isFreshInstall ? (
              <button
                onClick={handleFinishFresh}
                disabled={!canProceedFresh}
                className="px-6 py-2.5 rounded-full text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center space-x-2 cursor-pointer"
              >
                <span>Launch Chatty</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinishExisting}
                className="px-6 py-2.5 rounded-full text-xs font-bold bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-900 shadow-md transition-all cursor-pointer"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
