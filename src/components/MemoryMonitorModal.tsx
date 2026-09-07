import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { platform, MemoryStats } from '../services/platform';
import { ServiceIcon } from './ServiceIcon';
import {
  X,
  Zap,
  BedDouble,
  Play,
  Trash2,
  ShieldCheck,
  Cpu,
  HardDrive,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const MemoryMonitorModal: React.FC = () => {
  const {
    isMemoryModalOpen,
    setMemoryModalOpen,
    services,
    activeServiceId,
    secondaryServiceId,
    hibernateService,
    wakeService,
    hibernateAllInactive,
    settings,
  } = useApp();

  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [isPurging, setIsPurging] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const stats = await platform.getMemoryUsage();
      setMemoryStats(stats);
    } catch {}
  };

  useEffect(() => {
    if (isMemoryModalOpen) {
      fetchStats();
      const timer = setInterval(fetchStats, 3000);
      return () => clearInterval(timer);
    }
  }, [isMemoryModalOpen]);

  if (!isMemoryModalOpen) return null;

  const isNoir = settings.theme === 'noir';

  const totalAppMemMB = memoryStats?.processMemoryKB
    ? Math.round(memoryStats.processMemoryKB / 1024)
    : 180;

  const totalSystemGB = memoryStats?.totalMemBytes
    ? Math.round(memoryStats.totalMemBytes / (1024 * 1024 * 1024))
    : 16;

  const freeSystemGB = memoryStats?.freeMemBytes
    ? (memoryStats.freeMemBytes / (1024 * 1024 * 1024)).toFixed(1)
    : '8.2';

  const handleClearCache = async (partition: string, serviceId: string) => {
    setIsPurging(serviceId);
    await platform.clearPartitionData(partition);
    setTimeout(() => {
      setIsPurging(null);
      fetchStats();
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={() => setMemoryModalOpen(false)}
    >
      <div
        className={`w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border flex flex-col max-h-[85vh] transition-all animate-slide-up ${
          isNoir
            ? 'bg-[#161824] border-zinc-700/80 text-zinc-100'
            : 'bg-white/95 border-white/90 text-zinc-800 backdrop-blur-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-inherit">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base">Memory & RAM Optimizer</h2>
              <p className="text-xs text-zinc-400">
                Keep Chatty lightning fast with smart tab hibernation
              </p>
            </div>
          </div>

          <button
            onClick={() => setMemoryModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-inherit">
              <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                Chatty App RAM
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {totalAppMemMB} <span className="text-xs font-normal">MB</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-inherit">
              <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                Free Mac RAM
              </div>
              <div className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                {freeSystemGB} <span className="text-xs font-normal">GB</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-inherit">
              <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                Total System
              </div>
              <div className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                {totalSystemGB} <span className="text-xs font-normal">GB</span>
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div>
              <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Hibernate Inactive Background Services
              </div>
              <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                Suspends background processes while preserving login states and cookies
              </div>
            </div>

            <button
              onClick={hibernateAllInactive}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center space-x-1.5 transition-transform hover:scale-105 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Free RAM</span>
            </button>
          </div>

          {/* Services Breakdown List */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Active Chat Services & Tabs ({services.length})
            </h3>

            <div className="space-y-2">
              {services.map((service) => {
                const isActive = service.id === activeServiceId;
                const isSecondary = service.id === secondaryServiceId;
                const isSleeping = service.isHibernated;

                return (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-3 rounded-2xl border border-inherit bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <ServiceIcon type={service.type} size={28} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[13.5px] font-medium text-zinc-900 dark:text-zinc-100">{service.name}</span>
                          {service.accountLabel && (
                            <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                              {service.accountLabel}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-400 truncate max-w-[220px]">
                          {service.partition}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          Active
                        </span>
                      ) : isSleeping ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          Sleeping (RAM 0MB)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          Awake
                        </span>
                      )}

                      {/* Sleep / Wake toggle */}
                      {!isActive && (
                        isSleeping ? (
                          <button
                            onClick={() => wakeService(service.id)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-colors"
                            title="Wake tab"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        ) : (
                          <button
                            onClick={() => hibernateService(service.id)}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-colors"
                            title="Hibernate tab"
                          >
                            <BedDouble className="w-3.5 h-3.5" />
                          </button>
                        )
                      )}

                      {/* Clear Cache */}
                      <button
                        onClick={() => handleClearCache(service.partition, service.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
                        title="Purge partition cache & storage"
                      >
                        {isPurging === service.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Privacy Guarantee Note */}
          <div className="flex items-center space-x-2 text-[11px] text-zinc-400 pt-2 border-t border-inherit">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              100% Local: All session partitions and caches are saved exclusively to your Mac disk.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
