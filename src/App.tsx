import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { CreateCommitment } from './components/CreateCommitment';
import { DailyFocusGoal } from './components/DailyFocusGoal';
import { AppSelectionModal } from './components/AppSelectionModal';
import { FocusSession } from './components/FocusSession';
import { VerifyModal } from './components/VerifyModal';
import { MissionComplete } from './components/MissionComplete';
import { RestrictedAppOverlay } from './components/RestrictedAppOverlay';
import { HistoryProgress } from './components/HistoryProgress';
import { AiInsights } from './components/AiInsights';
import { SettingsModal } from './components/SettingsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { FreedomMinutesVault } from './components/FreedomMinutesVault';
import { DistractionRescueModal } from './components/DistractionRescueModal';

import {
  Commitment,
  RestrictedApp,
  UserStats,
  PlatformConfig,
  CoachInsight,
} from './types';
import {
  loadStoredStats,
  saveStoredStats,
  loadStoredHistory,
  saveStoredHistory,
  loadStoredApps,
  saveStoredApps,
  loadStoredConfig,
  saveStoredConfig,
  loadStoredInsights,
  saveStoredInsights,
  isUserOnboarded,
  setUserOnboarded,
} from './utils/storage';
import { INITIAL_STATS, INITIAL_HISTORY, DEFAULT_RESTRICTED_APPS, INITIAL_PLATFORM_CONFIG, INITIAL_COACH_INSIGHTS } from './data/initialData';
import { Sparkles, Shield, Clock, Flame, ArrowRight, Lock, CheckCircle2, RefreshCw, Zap, Trophy, Target, Award, Sliders, Brain } from 'lucide-react';
import { playSuccessChime } from './utils/audio';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'history' | 'insights' | 'settings'>('dashboard');
  const [sessionState, setSessionState] = useState<'idle' | 'choosing_apps' | 'focusing' | 'verifying' | 'completed'>('idle');

  const [stats, setStats] = useState<UserStats>(loadStoredStats);
  const [history, setHistory] = useState<Commitment[]>(loadStoredHistory);
  const [availableApps, setAvailableApps] = useState<RestrictedApp[]>(loadStoredApps);
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>(loadStoredConfig);
  const [insights, setInsights] = useState<CoachInsight[]>(loadStoredInsights);

  const [draftCommitment, setDraftCommitment] = useState<Partial<Commitment> | null>(null);
  const [activeCommitment, setActiveCommitment] = useState<Commitment | null>(null);
  const [simulatedAppAttempt, setSimulatedAppAttempt] = useState<RestrictedApp | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [rescueOpen, setRescueOpen] = useState(false);
  const [redeemToast, setRedeemToast] = useState<string | null>(null);

  // Quick 1-tap redeem screen time from vault
  const handleQuickRedeem = () => {
    if (stats.availableScreenTimeMinutes < 15) {
      setRedeemToast("Earn more screen time first by completing a focus session!");
      setTimeout(() => setRedeemToast(null), 3500);
      return;
    }
    handleRedeemScreenTime(15);
    playSuccessChime();
    setRedeemToast("🎉 15m of guilt-free screen time unlocked! Enjoy your break.");
    setTimeout(() => setRedeemToast(null), 4000);
  };

  // Calculate today's focused minutes from completed history
  const todayFocusedMinutes = useMemo(() => {
    const isSameCalendarDay = (dateStr?: string) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      const now = new Date();
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    };

    return history
      .filter((h) => h.status === 'completed' && isSameCalendarDay(h.completedAt || h.createdAt))
      .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  }, [history]);

  // Update daily focus goal
  const handleUpdateDailyGoal = (newGoalMinutes: number) => {
    setStats((prev) => {
      const updated = {
        ...prev,
        dailyFocusGoalMinutes: newGoalMinutes,
      };
      saveStoredStats(updated);
      return updated;
    });
  };

  // Check onboarding on first load
  useEffect(() => {
    if (!isUserOnboarded()) {
      setOnboardingOpen(true);
    }
  }, []);

  // Sync to local storage
  useEffect(() => {
    saveStoredStats(stats);
  }, [stats]);

  useEffect(() => {
    saveStoredHistory(history);
  }, [history]);

  useEffect(() => {
    saveStoredConfig(platformConfig);
  }, [platformConfig]);

  // Handle direct start from new streamlined CreateCommitment
  const handleStartDirectFocus = (data: {
    taskTitle: string;
    durationMinutes: number;
    category: any;
    breakdown: { id: string; title: string; completed: boolean }[];
    restrictedAppIds: string[];
    coachAdvice?: string;
  }) => {
    const newCommitment: Commitment = {
      id: `commit-${Date.now()}`,
      rawPrompt: data.taskTitle,
      taskTitle: data.taskTitle,
      category: data.category || 'Deep Work',
      durationMinutes: data.durationMinutes,
      remainingSeconds: data.durationMinutes * 60,
      breakdown: data.breakdown,
      restrictedAppIds: data.restrictedAppIds,
      coachAdvice: data.coachAdvice || `${data.durationMinutes} minutes provides optimal flow momentum.`,
      status: 'active',
      createdAt: new Date().toISOString(),
      verificationMethod: 'timer',
      earnedScreenTimeMinutes: Math.round(data.durationMinutes * platformConfig.screenTimeRatio),
    };

    setActiveCommitment(newCommitment);
    setSessionState('focusing');
  };

  // Handle draft created from CreateCommitment
  const handleCommitDraftCreated = (draft: Partial<Commitment>) => {
    setDraftCommitment(draft);
    setSessionState('choosing_apps');
  };

  // Start focus session with selected restricted apps
  const handleStartFocus = (selectedAppIds: string[]) => {
    if (!draftCommitment) return;

    const newCommitment: Commitment = {
      id: `commit-${Date.now()}`,
      rawPrompt: draftCommitment.rawPrompt || 'Deep focus commitment',
      taskTitle: draftCommitment.taskTitle || 'Focused commitment',
      category: draftCommitment.category || 'Deep Work',
      durationMinutes: draftCommitment.durationMinutes || 25,
      remainingSeconds: (draftCommitment.durationMinutes || 25) * 60,
      breakdown: draftCommitment.breakdown || [],
      restrictedAppIds: selectedAppIds,
      coachAdvice: draftCommitment.coachAdvice || '25 minutes is optimal for sustained momentum.',
      status: 'active',
      createdAt: new Date().toISOString(),
      verificationMethod: 'timer',
      earnedScreenTimeMinutes: Math.round(
        (draftCommitment.durationMinutes || 25) * platformConfig.screenTimeRatio
      ),
    };

    setActiveCommitment(newCommitment);
    setSessionState('focusing');
  };

  // Trigger verify modal
  const handleSessionTimerDone = () => {
    setSessionState('verifying');
  };

  // When user gives up
  const handleSessionFailed = () => {
    if (activeCommitment) {
      const broken: Commitment = {
        ...activeCommitment,
        status: 'failed',
        completedAt: new Date().toISOString(),
        earnedScreenTimeMinutes: 0,
      };
      setHistory((prev) => [broken, ...prev]);
      setStats((prev) => ({
        ...prev,
        totalSessionsCount: prev.totalSessionsCount + 1,
        currentStreak: Math.max(0, prev.currentStreak - 1),
      }));
    }
    setActiveCommitment(null);
    setDraftCommitment(null);
    setSessionState('idle');
  };

  // Confirm verification
  const handleConfirmVerification = (
    method: Commitment['verificationMethod'],
    proofNote?: string,
    bonusMinutes: number = 0
  ) => {
    if (!activeCommitment) return;

    const earned = activeCommitment.earnedScreenTimeMinutes + (bonusMinutes || 0);

    const completed: Commitment = {
      ...activeCommitment,
      status: 'completed',
      completedAt: new Date().toISOString(),
      verificationMethod: method,
      verificationProof: proofNote,
      earnedScreenTimeMinutes: earned,
    };

    setHistory((prev) => [completed, ...prev]);
    setStats((prev) => ({
      ...prev,
      availableScreenTimeMinutes: prev.availableScreenTimeMinutes + earned,
      totalEarnedMinutes: prev.totalEarnedMinutes + earned,
      totalFocusedMinutes: prev.totalFocusedMinutes + activeCommitment.durationMinutes,
      completedSessionsCount: prev.completedSessionsCount + 1,
      totalSessionsCount: prev.totalSessionsCount + 1,
      currentStreak: prev.currentStreak + 1,
      bestStreak: Math.max(prev.bestStreak, prev.currentStreak + 1),
      lastActiveDate: new Date().toISOString().split('T')[0],
    }));

    setSessionState('completed');
  };

  // Launch quick micro-sprint from Distraction Rescue
  const handleLaunchMicroCommitment = (taskTitle: string, durationMinutes: number) => {
    const newCommitment: Commitment = {
      id: 'comm_' + Date.now(),
      rawPrompt: taskTitle,
      taskTitle: taskTitle,
      category: 'Deep Work',
      durationMinutes,
      remainingSeconds: durationMinutes * 60,
      breakdown: [
        { id: '1', title: 'Break initial friction resistance', completed: false },
        { id: '2', title: 'Stay locked in flow for 5 minutes', completed: false },
      ],
      restrictedAppIds: availableApps.filter((a) => a.defaultRestricted).map((a) => a.id),
      coachAdvice: 'The first 5 minutes dissolve the urge. Keep going!',
      status: 'active',
      createdAt: new Date().toISOString(),
      verificationMethod: 'timer',
      earnedScreenTimeMinutes: Math.round(durationMinutes * platformConfig.screenTimeRatio),
    };

    setActiveCommitment(newCommitment);
    setSessionState('focusing');
  };

  // Close completed screen
  const handleCompleteDone = () => {
    setActiveCommitment(null);
    setDraftCommitment(null);
    setSessionState('idle');
  };

  // Redeem screen time
  const handleRedeemScreenTime = (minutes: number) => {
    setStats((prev) => ({
      ...prev,
      availableScreenTimeMinutes: Math.max(0, prev.availableScreenTimeMinutes - minutes),
    }));
  };

  // Emergency override in RestrictedAppOverlay
  const handleEmergencyOverride = () => {
    setStats((prev) => ({
      ...prev,
      availableScreenTimeMinutes: Math.max(0, prev.availableScreenTimeMinutes - 15),
    }));
    setSimulatedAppAttempt(null);
  };

  // Reset data to demo state
  const handleResetData = () => {
    setStats(INITIAL_STATS);
    setHistory(INITIAL_HISTORY);
    setAvailableApps(DEFAULT_RESTRICTED_APPS);
    setPlatformConfig(INITIAL_PLATFORM_CONFIG);
    setInsights(INITIAL_COACH_INSIGHTS);
    saveStoredStats(INITIAL_STATS);
    saveStoredHistory(INITIAL_HISTORY);
    saveStoredApps(DEFAULT_RESTRICTED_APPS);
    saveStoredConfig(INITIAL_PLATFORM_CONFIG);
    saveStoredInsights(INITIAL_COACH_INSIGHTS);
  };

  return (
    <div className="min-h-screen bg-[#07080C] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Global Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (sessionState === 'focusing') return;
          setCurrentTab(tab);
        }}
        stats={stats}
        platformConfig={platformConfig}
        onOpenOnboarding={() => setOnboardingOpen(true)}
        isFocusing={sessionState === 'focusing'}
        onOpenVault={() => setVaultOpen(true)}
        onOpenRescue={() => setRescueOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-3 sm:px-6 py-4 sm:py-8 max-w-6xl mx-auto w-full pb-24 md:pb-8">
        {/* If user is in active focus session */}
        {sessionState === 'focusing' && activeCommitment && (
          <FocusSession
            commitment={activeCommitment}
            restrictedApps={availableApps}
            platformConfig={platformConfig}
            onSessionComplete={handleSessionTimerDone}
            onSessionFailed={handleSessionFailed}
            onUpdateSubsteps={(updated) =>
              setActiveCommitment({ ...activeCommitment, breakdown: updated })
            }
            onSimulateAppAttempt={(app) => setSimulatedAppAttempt(app)}
          />
        )}

        {/* If user just completed session */}
        {sessionState === 'completed' && activeCommitment && (
          <MissionComplete
            commitment={activeCommitment}
            restrictedApps={availableApps}
            earnedMinutes={activeCommitment.earnedScreenTimeMinutes}
            newAvailableMinutes={stats.availableScreenTimeMinutes}
            newStreak={stats.currentStreak}
            onDone={handleCompleteDone}
          />
        )}

        {/* Standard Tab Navigation Views when not in full focus mode */}
        {sessionState !== 'focusing' && sessionState !== 'completed' && (
          <>
            {currentTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Redeem notification toast */}
                {redeemToast && (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/15 p-3.5 text-center text-xs sm:text-sm font-bold text-emerald-300 shadow-xl shadow-emerald-500/10 animate-in fade-in slide-in-from-top-2">
                    {redeemToast}
                  </div>
                )}

                {/* High-Voltage Motivation & Stats Header */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Streak Card */}
                  <div className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-[#0D0F1A] to-[#08090E] p-5 shadow-lg flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                      <span className="flex items-center gap-1.5">
                        <Flame className="h-4 w-4 fill-amber-400" />
                        Daily Streak
                      </span>
                      <span className="text-[10px] bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 rounded-full text-amber-300 font-bold">
                        ON FIRE 🔥
                      </span>
                    </div>
                    <div className="font-display text-3xl sm:text-4xl font-black text-white">
                      {stats.currentStreak} Days
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {stats.currentStreak >= 5 ? "Unstoppable momentum! Keep the fire burning." : "Every session cements your focus habit."}
                    </p>
                  </div>

                  {/* Screen Time Vault Card with Instant Redeem */}
                  <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-[#0D0F1A] to-[#08090E] p-5 shadow-lg flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        Screen Time Bank
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 rounded-full text-emerald-300 font-bold">
                        GUILT-FREE
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div className="font-display text-3xl sm:text-4xl font-black text-white">
                        {stats.availableScreenTimeMinutes}m
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setVaultOpen(true)}
                          className="rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 px-2.5 py-1.5 text-xs font-bold text-emerald-300 transition-all active:scale-95"
                        >
                          Vault ➔
                        </button>
                        <button
                          type="button"
                          onClick={handleQuickRedeem}
                          disabled={stats.availableScreenTimeMinutes < 15}
                          className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                        >
                          Spend 15m ✨
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Earned leisure time ready to unlock for social media.
                    </p>
                  </div>

                  {/* Focus Integrity Card */}
                  <div className="relative overflow-hidden rounded-3xl border border-indigo-500/25 bg-gradient-to-br from-indigo-500/10 via-[#0D0F1A] to-[#08090E] p-5 shadow-lg flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
                      <span className="flex items-center gap-1.5">
                        <Trophy className="h-4 w-4 text-indigo-400" />
                        Focus Integrity
                      </span>
                      <span className="text-[10px] bg-indigo-500/20 border border-indigo-500/30 px-1.5 py-0.5 rounded-full text-indigo-300 font-bold">
                        100% PROMISES
                      </span>
                    </div>
                    <div className="font-display text-3xl sm:text-4xl font-black text-white">
                      {stats.completedSessionsCount} Kept
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {(stats.totalFocusedMinutes / 60).toFixed(1)} hours of deep work completed.
                    </p>
                  </div>
                </div>

                {/* Daily Focus Goal Ring & Customization */}
                <DailyFocusGoal
                  dailyGoalMinutes={stats.dailyFocusGoalMinutes || 60}
                  todayFocusedMinutes={todayFocusedMinutes}
                  onUpdateGoal={handleUpdateDailyGoal}
                  streak={stats.currentStreak}
                />

                {/* Streamlined Motivational Commitment Launcher */}
                <CreateCommitment
                  onStartCommitment={handleStartDirectFocus}
                  availableApps={availableApps}
                  screenTimeRatio={platformConfig.screenTimeRatio}
                />

                {/* Recent Commitments Preview */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                      <span>Recent Promises Kept</span>
                      <span className="text-xs text-emerald-400 font-medium">✓ Unlocked</span>
                    </h3>
                    <button
                      onClick={() => setCurrentTab('history')}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                    >
                      <span>Heatmap & Badges</span>
                      <span>→</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {history.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-white/[0.08] bg-[#0E1018] p-4 text-left space-y-1.5 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-indigo-300 font-semibold">{item.category}</span>
                          <span className="text-emerald-400 font-bold">+{item.earnedScreenTimeMinutes}m Screen Time</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                          {item.taskTitle}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/[0.04]">
                          <span>⏱ {item.durationMinutes}m focus</span>
                          <span className="text-emerald-400 font-medium">Earned ✓</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'history' && (
              <HistoryProgress
                history={history}
                stats={stats}
                onStartAgainWithPrompt={(prompt) => {
                  setCurrentTab('dashboard');
                }}
                onRedeemScreenTime={handleRedeemScreenTime}
              />
            )}

            {currentTab === 'insights' && (
              <AiInsights
                insights={insights}
                stats={stats}
                recentSessions={history}
                onApplyRecommendation={(prompt) => {
                  setCurrentTab('dashboard');
                }}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsModal
                config={platformConfig}
                onUpdateConfig={(newCfg) => setPlatformConfig(newCfg)}
                onResetData={handleResetData}
              />
            )}
          </>
        )}
      </main>

      {/* App Selection Modal (Step 2: Choose Distractions) */}
      {sessionState === 'choosing_apps' && draftCommitment && (
        <AppSelectionModal
          isOpen={true}
          onClose={() => setSessionState('idle')}
          draftCommitment={draftCommitment}
          availableApps={availableApps}
          platformConfig={platformConfig}
          onStartFocus={handleStartFocus}
        />
      )}

      {/* Verification Modal (Step 4: Verify Completion) */}
      {sessionState === 'verifying' && activeCommitment && (
        <VerifyModal
          isOpen={true}
          onClose={() => setSessionState('focusing')}
          commitment={activeCommitment}
          onConfirmVerification={handleConfirmVerification}
        />
      )}

      {/* Restricted App Interception Overlay Simulation */}
      {simulatedAppAttempt && activeCommitment && (
        <RestrictedAppOverlay
          app={simulatedAppAttempt}
          commitment={activeCommitment}
          onClose={() => setSimulatedAppAttempt(null)}
          onEmergencyOverride={handleEmergencyOverride}
          onLaunchRescue={() => setRescueOpen(true)}
        />
      )}

      {/* Freedom Minutes Vault Modal */}
      <FreedomMinutesVault
        isOpen={vaultOpen}
        onClose={() => setVaultOpen(false)}
        stats={stats}
        platformConfig={platformConfig}
        availableApps={availableApps}
        onRedeemMinutes={handleRedeemScreenTime}
        onUpdateConfig={(cfg) => setPlatformConfig((prev) => ({ ...prev, ...cfg }))}
      />

      {/* Distraction Rescue Emergency Modal */}
      <DistractionRescueModal
        isOpen={rescueOpen}
        onClose={() => setRescueOpen(false)}
        activeTaskTitle={activeCommitment?.taskTitle}
        blockedAppName={simulatedAppAttempt?.name}
        onLaunchMicroCommitment={handleLaunchMicroCommitment}
      />

      {/* Onboarding Philosophy & Platform Clarity Modal */}
      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => {
          setOnboardingOpen(false);
          setUserOnboarded(true);
        }}
      />

      {/* Mobile Bottom Navigation Bar (md:hidden) */}
      {sessionState !== 'focusing' && sessionState !== 'completed' && (
        <nav
          id="mobile-bottom-nav"
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-white/[0.08] bg-[#07080CEE] backdrop-blur-xl px-2 py-1.5 shadow-2xl"
        >
          <div className="grid grid-cols-4 items-center justify-around">
            <button
              id="mobile-tab-dashboard"
              type="button"
              onClick={() => setCurrentTab('dashboard')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                currentTab === 'dashboard'
                  ? 'text-indigo-400 bg-indigo-500/10 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Target className="h-4 w-4 mb-0.5" />
              <span className="text-[10px] tracking-tight">Focus</span>
            </button>

            <button
              id="mobile-tab-history"
              type="button"
              onClick={() => setCurrentTab('history')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
                currentTab === 'history'
                  ? 'text-indigo-400 bg-indigo-500/10 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="h-4 w-4 mb-0.5" />
              <span className="text-[10px] tracking-tight">Rewards</span>
              {stats.completedSessionsCount > 0 && (
                <span className="absolute top-1 right-2.5 flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </button>

            <button
              id="mobile-tab-insights"
              type="button"
              onClick={() => setCurrentTab('insights')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
                currentTab === 'insights'
                  ? 'text-indigo-400 bg-indigo-500/10 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Brain className="h-4 w-4 mb-0.5" />
              <span className="text-[10px] tracking-tight">AI Coach</span>
            </button>

            <button
              id="mobile-tab-settings"
              type="button"
              onClick={() => setCurrentTab('settings')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                currentTab === 'settings'
                  ? 'text-indigo-400 bg-indigo-500/10 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="h-4 w-4 mb-0.5" />
              <span className="text-[10px] tracking-tight">Settings</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
