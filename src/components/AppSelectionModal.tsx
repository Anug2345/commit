import React, { useState } from 'react';
import { Shield, Lock, Check, Smartphone, Info, ArrowLeft, Play, Instagram, Video, Youtube, Twitter, MessageSquare, Gamepad2, Film, Headphones, Tv, ShoppingBag } from 'lucide-react';
import { RestrictedApp, Commitment, PlatformConfig } from '../types';

interface AppSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  draftCommitment: Partial<Commitment>;
  availableApps: RestrictedApp[];
  platformConfig: PlatformConfig;
  onStartFocus: (selectedAppIds: string[]) => void;
}

export const AppSelectionModal: React.FC<AppSelectionModalProps> = ({
  isOpen,
  onClose,
  draftCommitment,
  availableApps,
  platformConfig,
  onStartFocus,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    draftCommitment.restrictedAppIds || ['instagram', 'tiktok', 'youtube', 'x', 'reddit']
  );

  if (!isOpen) return null;

  const toggleApp = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const applyPreset = (type: 'social' | 'entertainment' | 'all') => {
    if (type === 'social') {
      setSelectedIds(['instagram', 'tiktok', 'x', 'reddit']);
    } else if (type === 'entertainment') {
      setSelectedIds(['youtube', 'netflix', 'twitch', 'games']);
    } else if (type === 'all') {
      setSelectedIds(availableApps.map((a) => a.id));
    }
  };

  const renderIcon = (id: string) => {
    switch (id) {
      case 'instagram':
        return <Instagram className="h-5 w-5 text-[#E1306C]" />;
      case 'tiktok':
        return <Video className="h-5 w-5 text-[#EE1D52]" />;
      case 'youtube':
        return <Youtube className="h-5 w-5 text-[#FF0000]" />;
      case 'x':
        return <Twitter className="h-5 w-5 text-[#1D9BF0]" />;
      case 'reddit':
        return <MessageSquare className="h-5 w-5 text-[#FF4500]" />;
      case 'games':
        return <Gamepad2 className="h-5 w-5 text-[#8B5CF6]" />;
      case 'netflix':
        return <Film className="h-5 w-5 text-[#E50914]" />;
      case 'discord':
        return <Headphones className="h-5 w-5 text-[#5865F2]" />;
      case 'twitch':
        return <Tv className="h-5 w-5 text-[#9146FF]" />;
      default:
        return <ShoppingBag className="h-5 w-5 text-[#F59E0B]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/[0.12] bg-[#0C0E17] p-5 sm:p-7 shadow-2xl text-white my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-5">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors mr-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-rose-500/20 text-rose-400 text-xs">
                  <Lock className="h-3 w-3" />
                </span>
                <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                  Choose Distractions to Restrict
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Task: <span className="text-white font-medium">"{draftCommitment.taskTitle}"</span> (⏱ {draftCommitment.durationMinutes}m)
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="font-display text-sm font-bold text-indigo-400">
              {selectedIds.length} Apps
            </span>
            <span className="block text-[10px] text-slate-500 uppercase tracking-wider">
              Selected
            </span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-400 shrink-0 mr-1">Quick Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset('social')}
            className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-white transition-colors shrink-0"
          >
            Social Shield (4)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('entertainment')}
            className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-white transition-colors shrink-0"
          >
            Entertainment Ban (4)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('all')}
            className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-white transition-colors shrink-0"
          >
            Total Lockdown (All)
          </button>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1 mb-5">
          {availableApps.map((app) => {
            const isRestricted = selectedIds.includes(app.id);
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => toggleApp(app.id)}
                className={`relative flex items-center justify-between gap-2.5 rounded-xl border p-3 text-left transition-all ${
                  isRestricted
                    ? 'border-indigo-500/50 bg-indigo-500/10 shadow-sm shadow-indigo-500/20'
                    : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/40 ring-1 ring-white/10">
                    {renderIcon(app.id)}
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white truncate">{app.name}</h4>
                    <span className="text-[10px] text-slate-400">{app.category}</span>
                  </div>
                </div>

                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                    isRestricted
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-white/20 bg-black/20 text-transparent'
                  }`}
                >
                  <Check className="h-3 w-3" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Platform Transparency Banner */}
        <div className="rounded-xl border border-white/[0.08] bg-[#07080C] p-3.5 mb-6 text-xs text-slate-400">
          <div className="flex items-start gap-2.5">
            <Smartphone className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">
                  Platform Shield Integration
                </span>
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                  Official OS Protocols
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                COMMIT uses iOS Screen Time API (FamilyControls) and Android Accessibility / Usage APIs to shield apps during focus. We never falsely claim root access. Access is fully restored the moment your commitment is verified.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Back
          </button>

          <button
            id="start-focus-session-button"
            type="button"
            disabled={selectedIds.length === 0}
            onClick={() => onStartFocus(selectedIds)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition-all hover:brightness-110 disabled:opacity-50"
          >
            <Play className="h-4 w-4 fill-white" />
            <span>Lock In & Start Focus (⏱ {draftCommitment.durationMinutes}m)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
