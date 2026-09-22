import React, { useState } from 'react';
import { Sparkles, Brain, Lightbulb, MessageSquare, ArrowRight, RefreshCw, Send, ShieldAlert, CheckCircle2, TrendingUp } from 'lucide-react';
import { CoachInsight, UserStats, Commitment } from '../types';

interface AiInsightsProps {
  insights: CoachInsight[];
  stats: UserStats;
  recentSessions: Commitment[];
  onApplyRecommendation: (prompt: string) => void;
}

export const AiInsights: React.FC<AiInsightsProps> = ({
  insights,
  stats,
  recentSessions,
  onApplyRecommendation,
}) => {
  const [activeInsights, setActiveInsights] = useState<CoachInsight[]>(insights);
  const [chatQuery, setChatQuery] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'coach'; text: string; action?: string }>>([
    {
      sender: 'coach',
      text: "I monitor your focus stamina and app restriction patterns. How can I help calibrate your workflow today?",
    },
  ]);

  const handleAskCoach = async (queryText?: string) => {
    const q = (queryText ?? chatQuery).trim();
    if (!q) return;

    setChatMessages((prev) => [...prev, { sender: 'user', text: q }]);
    setChatQuery('');
    setLoadingChat(true);

    try {
      const res = await fetch('/api/ai/coach-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stats,
          query: q,
          recentSessions: recentSessions.slice(0, 5),
        }),
      });

      const data = await res.json();
      const coachReply = `${data.headline ? `**${data.headline}**\n\n` : ''}${data.observation || ''}\n\n${data.recommendation || ''}`;

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'coach',
          text: coachReply,
          action: data.recommendation ? 'Commit to this suggestion' : undefined,
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'coach',
          text: "When focus feels difficult, reduce session duration to 25 minutes. Consistency beats marathon heroics every time.",
        },
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-7 text-white pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-0.5 text-xs font-semibold text-indigo-300 mb-2">
            <Brain className="h-3.5 w-3.5 text-indigo-400" />
            <span>Real-Time Behavioral Adaptation</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Adaptive AI Coach
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Learning from your completion velocity, fatigue curves, and urge resistance to keep you in flow.
          </p>
        </div>
      </div>

      {/* Featured Insight Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-[#121526] via-[#0E101A] to-[#0A0C14] p-5 sm:p-7 shadow-xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl" />

        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
          <TrendingUp className="h-4 w-4" />
          <span>Core Pattern Detection</span>
        </div>

        <h2 className="font-display text-xl sm:text-2xl font-bold text-white mb-2 max-w-2xl">
          “You've struggled with 2-hour sessions recently. Want to try 30 minutes instead?”
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mb-4">
          Data shows a <span className="text-emerald-400 font-semibold">96% completion rate</span> on 25-35 minute commitments, dropping sharply on marathon tasks. Shorter sessions protect your screen time reward loop from frustration.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onApplyRecommendation('30-minute high-focus sprint on current priority')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:brightness-110 transition-all"
          >
            <span>Commit to 30m Sprint</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs text-slate-500">Confidence: High (Based on 9 sessions)</span>
        </div>
      </div>

      {/* Insights Cards Grid */}
      <div className="space-y-3">
        <h3 className="font-display text-base font-bold text-white">
          Active Behavioral Diagnostic Cards
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {activeInsights.map((insight) => (
            <div
              key={insight.id}
              className="rounded-2xl border border-white/[0.08] bg-[#0E1018] p-5 hover:border-indigo-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="rounded-full bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-semibold text-indigo-300 border border-white/[0.06]">
                    {insight.category || 'Focus Insight'}
                  </span>
                  <span className="text-[10px] text-slate-500">{insight.date}</span>
                </div>

                <h4 className="font-display text-sm font-bold text-white mb-1.5 leading-snug">
                  {insight.headline}
                </h4>

                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {insight.observation}
                </p>
              </div>

              <div className="border-t border-white/[0.06] pt-3 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-300 font-medium truncate">
                  💡 {insight.recommendation}
                </span>
                <button
                  type="button"
                  onClick={() => onApplyRecommendation(insight.recommendation)}
                  className="shrink-0 text-xs text-indigo-400 hover:text-indigo-300 font-semibold p-1"
                >
                  Apply →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Coach Consultation Chat */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0C0E17] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
          <MessageSquare className="h-4 w-4 text-indigo-400" />
          <h3 className="font-display text-base font-bold text-white">
            Ask the COMMIT Coach
          </h3>
          <span className="text-xs text-slate-500">Calm, stoic, friction-reducing advice</span>
        </div>

        {/* Quick Query Prompts */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-500 mr-1">Ask:</span>
          {[
            "How do I prevent the 20-minute slump?",
            "What's the best length for reading vs writing?",
            "How should I handle strong Instagram urges?",
          ].map((promptText, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAskCoach(promptText)}
              className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[11px] text-slate-400 hover:text-white hover:border-indigo-500/30 transition-colors"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Message Log */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-[#151824] border border-white/[0.08] text-slate-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                {msg.action && (
                  <button
                    type="button"
                    onClick={() => onApplyRecommendation(msg.action!)}
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/30 transition-colors"
                  >
                    <span>{msg.action}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {loadingChat && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-none bg-[#151824] border border-white/[0.08] p-3.5 text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                <span>Coach is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat input */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            placeholder="Ask about your focus patterns or session calibrations..."
            value={chatQuery}
            onChange={(e) => setChatQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAskCoach();
            }}
            disabled={loadingChat}
            className="w-full rounded-xl border border-white/[0.1] bg-[#07080C] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={() => handleAskCoach()}
            disabled={loadingChat || !chatQuery.trim()}
            className="rounded-xl bg-indigo-600 p-2.5 text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
