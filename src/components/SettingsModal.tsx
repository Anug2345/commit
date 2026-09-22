import React, { useState } from 'react';
import { Smartphone, Shield, Sliders, Volume2, Lock, RotateCcw, Check, Info } from 'lucide-react';
import { PlatformConfig } from '../types';

interface SettingsModalProps {
  config: PlatformConfig;
  onUpdateConfig: (newConfig: PlatformConfig) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  config,
  onUpdateConfig,
  onResetData,
}) => {
  const [platform, setPlatform] = useState(config.platform);
  const [screenTimeRatio, setScreenTimeRatio] = useState(config.screenTimeRatio);
  const [strictMode, setStrictMode] = useState(config.strictMode);
  const [soundscapeEnabled, setSoundscapeEnabled] = useState(config.soundscapeEnabled);
  const [defaultSoundscape, setDefaultSoundscape] = useState(config.activeSoundscape);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = () => {
    onUpdateConfig({
      ...config,
      platform,
      screenTimeRatio,
      strictMode,
      soundscapeEnabled,
      activeSoundscape: defaultSoundscape,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 text-white pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">
            Settings & Platform Shield
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Configure system permissions, reward ratios, and focus soundscapes.
          </p>
        </div>

        <button
          id="save-settings-button"
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
        >
          Save Changes
        </button>
      </div>

      {savedToast && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
          <Check className="h-4 w-4" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* Platform Architecture & Permission Explainer */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0E1018] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-indigo-400" />
          <h2 className="font-display text-base font-bold text-white">
            Platform App Restriction Mechanism
          </h2>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          In strict compliance with iOS and Android platform requirements, COMMIT uses only authorized platform APIs. We never claim unrestricted root control or background surveillance.
        </p>

        {/* Platform Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'ios' as const,
              title: 'Apple iOS',
              api: 'Screen Time API (FamilyControls & ManagedSettings)',
              status: 'Ready & Compliant',
            },
            {
              id: 'android' as const,
              title: 'Android',
              api: 'UsageStatsManager & AccessibilityService',
              status: 'Ready & Compliant',
            },
            {
              id: 'web' as const,
              title: 'Web & Desktop',
              api: 'Shield Overlay & Focus Honesty Protocol',
              status: 'Active (Current Environment)',
            },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPlatform(item.id)}
              className={`rounded-xl border p-3.5 text-left transition-all ${
                platform === item.id
                  ? 'border-indigo-500 bg-indigo-500/15 ring-1 ring-indigo-500/30'
                  : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">{item.title}</span>
                <span className="text-[10px] text-emerald-400 font-medium">{item.status}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{item.api}</p>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-black/40 p-3 text-[11px] text-slate-400">
          <span className="font-bold text-slate-300">How restrictions function: </span>
          When you enter a focus session, selected distracting apps are marked for restriction. Attempting to launch them triggers COMMIT's reminder: <em>"You can use it. First, keep the promise you made to yourself."</em> Access is instantly unlocked on completion.
        </div>
      </div>

      {/* Screen Time Reward Ratio */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0E1018] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-white">
              Screen Time Earning Ratio
            </h3>
            <p className="text-xs text-slate-400">
              Control how much leisure screen time you earn for every minute of completed focus.
            </p>
          </div>
          <span className="font-display text-lg font-bold text-indigo-400">
            {screenTimeRatio}:1
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { ratio: 0.5, label: 'Strict (0.5x)', sub: '30m focus = 15m screen time' },
            { ratio: 1.0, label: 'Standard (1.0x)', sub: '30m focus = 30m screen time' },
            { ratio: 1.5, label: 'Generous (1.5x)', sub: '30m focus = 45m screen time' },
          ].map((item) => (
            <button
              key={item.ratio}
              type="button"
              onClick={() => setScreenTimeRatio(item.ratio)}
              className={`rounded-xl border p-3 text-left transition-all ${
                screenTimeRatio === item.ratio
                  ? 'border-indigo-500 bg-indigo-500/15'
                  : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:bg-white/[0.04]'
              }`}
            >
              <span className="block text-xs font-bold text-white">{item.label}</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">{item.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Soundscape Preferences */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0E1018] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-white">
              Focus Soundscape Engine
            </h3>
            <p className="text-xs text-slate-400">
              Web Audio synthesizer for binaural beats and ambient frequency masks.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSoundscapeEnabled(!soundscapeEnabled)}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
              soundscapeEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/10 text-slate-400'
            }`}
          >
            {soundscapeEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {soundscapeEnabled && (
          <div className="grid grid-cols-3 gap-3 pt-1">
            {[
              { id: 'binaural' as const, name: '40Hz Gamma Focus', desc: 'Stereo wave pulse for high-alert cognitive flow' },
              { id: 'rain' as const, name: 'Gentle Rain Mask', desc: 'Pink noise filter for calming mental chatter' },
              { id: 'deep_space' as const, name: 'Deep Space Drone', desc: 'Sub-bass drone for sustained immersion' },
            ].map((sound) => (
              <button
                key={sound.id}
                type="button"
                onClick={() => setDefaultSoundscape(sound.id)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  defaultSoundscape === sound.id
                    ? 'border-indigo-500 bg-indigo-500/15'
                    : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:bg-white/[0.04]'
                }`}
              >
                <span className="block text-xs font-bold text-white">{sound.name}</span>
                <span className="block text-[10px] text-slate-400 mt-1">{sound.desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reset or Re-seed */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0E1018] p-5 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-white">Reset Application State</h4>
          <p className="text-xs text-slate-400">
            Restore sample data and reset screen time bank to default.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetData}
          className="flex items-center gap-1.5 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </div>
  );
};
