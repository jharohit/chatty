import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Service } from '../types';
import { THEMES } from '../constants/presets';
import { platform } from '../services/platform';
import { ServiceIcon } from './ServiceIcon';
import { Play, BedDouble, Shield } from 'lucide-react';

export const WebViewContainer: React.FC = () => {
  const {
    services,
    activeServiceId,
    secondaryServiceId,
    settings,
    setUnreadCount,
    wakeService,
    setSplitRatio,
  } = useApp();

  // Lazy-loading: only instantiate services into DOM once they have been viewed
  const [instantiatedIds, setInstantiatedIds] = useState<Set<string>>(() => new Set([activeServiceId]));

  useEffect(() => {
    setInstantiatedIds((prev) => {
      const next = new Set(prev);
      next.add(activeServiceId);
      if (settings.splitViewEnabled && secondaryServiceId) {
        next.add(secondaryServiceId);
      }
      return next;
    });
  }, [activeServiceId, secondaryServiceId, settings.splitViewEnabled]);

  // Handle reload webview custom event
  useEffect(() => {
    const handleReload = (e: any) => {
      const targetId = e.detail?.id || activeServiceId;
      try {
        const wv = document.getElementById(`webview-${targetId}`) as any;
        if (wv && typeof wv.reload === 'function') {
          wv.reload();
        }
      } catch (err) {
        console.warn('Reload error:', err);
      }
    };

    window.addEventListener('chatty:reload-webview', handleReload);
    return () => window.removeEventListener('chatty:reload-webview', handleReload);
  }, [activeServiceId]);

  // Split view dragging
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsDraggingSplit(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSplit || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const percentage = Math.min(Math.max((offsetX / rect.width) * 100, 20), 80);
      setSplitRatio(Math.round(percentage));
    };

    const handleMouseUp = () => {
      if (isDraggingSplit) {
        setIsDraggingSplit(false);
      }
    };

    if (isDraggingSplit) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSplit, setSplitRatio]);

  const activeTheme = THEMES[settings.theme] || THEMES.sakura;
  const isNoir = settings.theme === 'noir';

  // Render a single service panel
  const renderServicePane = (service: Service) => {
    const isSleeping = service.isHibernated;

    return (
      <div
        key={service.id}
        className={`relative w-full h-full flex flex-col overflow-hidden ${
          isNoir ? 'bg-[#0F111A]' : 'bg-white'
        }`}
      >
        {/* Hibernation Sleep Overlay if tab is sleeping */}
        {isSleeping ? (
          <div
            onClick={() => wakeService(service.id)}
            className={`w-full h-full flex flex-col items-center justify-center cursor-pointer select-none transition-all p-6 ${
              isNoir ? 'bg-[#12141F]/95 text-zinc-300' : 'bg-gradient-to-b from-white/90 to-slate-50/90 text-zinc-700'
            }`}
          >
            <div className="flex flex-col items-center max-w-sm text-center p-8 rounded-3xl glass-panel shadow-glass border border-white/60 dark:border-zinc-700/60 animate-fade-in">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-pastel"
                style={{ backgroundColor: service.accentColor + '20' }}
              >
                <ServiceIcon type={service.type} size={36} />
              </div>

              <div className="flex items-center space-x-2 mb-2">
                <BedDouble className="w-4 h-4 text-amber-500" />
                <h3 className="font-semibold text-base">Tab is Sleeping</h3>
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                <strong className="text-emerald-600 dark:text-emerald-400">Chatty RAM Saver</strong> suspended this background service to keep your Mac running cool and fast.
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  wakeService(service.id);
                }}
                className="px-5 py-2.5 rounded-full text-xs font-semibold shadow-md flex items-center space-x-2 transition-transform hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: service.accentColor || activeTheme.accent,
                  color: '#FFFFFF',
                }}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Wake {service.name}</span>
              </button>
            </div>
          </div>
        ) : platform.isElectron ? (
          /* Real Electron Webview */
          React.createElement('webview', {
            id: `webview-${service.id}`,
            src: service.url,
            partition: service.partition,
            useragent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
            allowpopups: 'true',
            webpreferences: 'contextIsolation=true, spellcheck=true',
            style: { width: '100%', height: '100%', flex: 1 },
            ref: (node: any): void => {
              if (node && !node._chattyAttached) {
                node._chattyAttached = true;

                // Title update listener for unread badge count
                node.addEventListener('page-title-updated', (e: any) => {
                  try {
                    const title = e.title || '';
                    const match = title.match(/\((\d+)\)/);
                    const count = match ? parseInt(match[1], 10) : title.includes('•') ? 1 : 0;
                    setUnreadCount(service.id, count);
                  } catch (err) {
                    console.warn('Error reading page-title:', err);
                  }
                });

                // IPC messages from webview-preload
                node.addEventListener('ipc-message', (e: any) => {
                  if (e.channel === 'unread-count') {
                    setUnreadCount(service.id, e.args[0] || 0);
                  }
                });

                // Set zoom and mute safely only once dom-ready has fired!
                node.addEventListener('dom-ready', () => {
                  try {
                    if (service.zoomFactor && typeof node.setZoomFactor === 'function') {
                      node.setZoomFactor(service.zoomFactor);
                    }
                    if (service.isMuted && typeof node.setAudioMuted === 'function') {
                      node.setAudioMuted(true);
                    }
                  } catch (err) {
                    console.warn('Could not set initial webview properties:', err);
                  }
                });
              }
            },
          })
        ) : (
          /* Browser Preview Fallback for testing */
          <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-zinc-900 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-md bg-white dark:bg-zinc-800">
              <ServiceIcon type={service.type} size={36} />
            </div>
            <h3 className="font-semibold text-lg text-zinc-800 dark:text-zinc-100">
              {service.name} {service.accountLabel ? `(${service.accountLabel})` : ''}
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4">
              Running in isolated partition <code className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-[11px]">{service.partition}</code>.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <Shield className="w-3.5 h-3.5" />
              <span>Strictly Local • Zero Cloud Storage</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const primaryService = services.find((s) => s.id === activeServiceId) || services[0];
  const secondaryService =
    settings.splitViewEnabled && secondaryServiceId
      ? services.find((s) => s.id === secondaryServiceId)
      : null;

  return (
    <div ref={containerRef} className="relative flex-1 w-full h-full overflow-hidden flex">
      {settings.splitViewEnabled && secondaryService ? (
        /* Dual Split-Screen View */
        <div className="w-full h-full flex flex-row">
          {/* Left Pane */}
          <div
            className="h-full relative overflow-hidden"
            style={{ width: `${settings.splitRatio}%` }}
          >
            {primaryService && renderServicePane(primaryService)}
          </div>

          {/* Draggable Divider */}
          <div
            onMouseDown={handleMouseDown}
            onDoubleClick={() => setSplitRatio(50)}
            className={`w-1.5 h-full cursor-col-resize flex items-center justify-center transition-colors z-20 ${
              isDraggingSplit
                ? 'bg-purple-500'
                : isNoir
                ? 'bg-zinc-800 hover:bg-zinc-600'
                : 'bg-zinc-200 hover:bg-purple-300'
            }`}
            title="Drag to resize split view (Double click to reset 50/50)"
          >
            <div className="w-0.5 h-8 bg-white/60 rounded-full" />
          </div>

          {/* Right Pane */}
          <div
            className="h-full relative overflow-hidden"
            style={{ width: `${100 - settings.splitRatio}%` }}
          >
            {secondaryService && renderServicePane(secondaryService)}
          </div>
        </div>
      ) : (
        /* Single Fullscreen Pane (Keeps loaded webviews in background DOM so they don't reload) */
        <div className="w-full h-full relative">
          {Array.from(instantiatedIds).map((id) => {
            const service = services.find((s) => s.id === id);
            if (!service) return null;
            const isVisible = service.id === activeServiceId;

            return (
              <div
                key={service.id}
                className="w-full h-full absolute inset-0"
                style={{ display: isVisible ? 'flex' : 'none' }}
              >
                {renderServicePane(service)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
