import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, ShieldAlert, Award, RefreshCw, Calendar, CheckCircle2, Zap } from 'lucide-react';
import { WeeklyInsightData, UserStats, Commitment } from '../types';

interface WeeklyInsightsViewProps {
  stats: UserStats;
  history: Commitment[];
}

export const WeeklyInsightsView: React.FC<WeeklyInsightsViewProps> = ({ stats, history }) => {
  const [data, setData] = useState<WeeklyInsightData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchWeeklyInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/weekly-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats, history }),
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyInsights();
  }, []);

  return (
    <div className="rounded-3xl border border-indigo-500/25 bg-gradient-to-br from-[#0F1222] via-[#0B0D18] to-[#07080C] p-5 sm:p-7 text-white shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Behavioral Intelligence • AI Weekly Insights</span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-black text-white">
            Weekly Focus Diagnostic
          </h3>
        </div>

        <button
          type="button"
          onClick={fetchWeeklyInsights}
          disabled={loading}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 px-3.5 py-1.5 text-xs font-bold text-indigo-300 transition-all active:scale-95 disabled:opacity-40"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Analyzing...' : 'Refresh Diagnostic'}</span>
        </button>
      </div>

      {loading && !data ? (
        <div className="py-12 text-center text-slate-400">
          <Brain className="h-8 w-8 text-indigo-400 animate-pulse mx-auto mb-3" />
          <p className="text-xs">Analyzing 7-day focus telemetry with Gemini...</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Top Score Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Grade */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-center">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                Focus Grade
              </div>
              <div className="font-display text-4xl font-black text-indigo-400">
                {data.focusGrade}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                {data.focusIntegrityPercent}% Integrity
              </div>
            </div>

            {/* Total Minutes */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-center">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                Deep Focus Logged
              </div>
              <div className="font-display text-3xl font-black text-white">
                {data.totalFocusedMinutes}m
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {(data.totalFocusedMinutes / 60).toFixed(1)} hrs flow
              </div>
            </div>

            {/* Freedom Minutes */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
              <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold mb-1">
                Freedom Earned
              </div>
              <div className="font-display text-3xl font-black text-emerald-300">
                {data.freedomMinutesEarned}m
              </div>
              <div className="text-[11px] text-emerald-400/80 mt-1">
                Guilt-free leisure
              </div>
            </div>

            {/* Optimal Sprint */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
              <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold mb-1">
                Optimal Sprint
              </div>
              <div className="font-display text-3xl font-black text-amber-300">
                {data.recommendedFocusSprint}m
              </div>
              <div className="text-[11px] text-amber-400/80 mt-1">
                Target sweet spot
              </div>
            </div>
          </div>

          {/* Key Observations: Strength vs Distraction Leak */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key Strength */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Observed Superpower</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {data.keyStrength}
              </p>
            </div>

            {/* Distraction Leak */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-2">
                <ShieldAlert className="h-4 w-4" />
                <span>Distraction Leak Alert</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {data.distractionLeak}
              </p>
            </div>
          </div>

          {/* Tactical Prescription */}
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/15 to-purple-500/10 p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wide mb-1.5">
              <Zap className="h-4 w-4" />
              <span>Next Week's Tactical Prescription</span>
            </div>
            <p className="text-sm font-semibold text-white leading-relaxed">
              "{data.tacticalPrescription}"
            </p>
          </div>

          {/* Category Distribution Breakdown */}
          {data.categoryDistribution && data.categoryDistribution.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Focus Time by Domain
              </div>
              <div className="space-y-2">
                {data.categoryDistribution.map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{cat.category}</span>
                      <span className="text-slate-400 font-mono">
                        {cat.minutes}m ({cat.percent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                        style={{ width: `${Math.min(100, cat.percent)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
