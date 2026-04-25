import { motion } from "framer-motion";
import MarkdownRenderer from "./MarkdownRenderer";

/* ── Confidence Bar ── */
function ConfidenceBar({ value = 0, color = "from-cyan-400 to-blue-500" }) {
  const pct = Math.round((value || 0) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
      <span className="text-[10px] font-mono text-white/50 w-8 text-right">{pct}%</span>
    </div>
  );
}

/* ── Knowledge Card ── */
export function KnowledgeCard({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group research-card p-4 hover:border-blue-400/20"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5 h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs">
          📄
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-white/85 leading-relaxed font-medium">{item.claim}</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-[10px] text-white/35 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400/60" />
              {item.source || "Research"}
            </span>
            {item.justification && (
              <span className="text-[10px] text-white/25 truncate max-w-[200px]">{item.justification}</span>
            )}
          </div>
          <div className="mt-2">
            <ConfidenceBar value={item.confidence} color="from-blue-400 to-cyan-400" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Hypothesis Card ── */
export function HypothesisCard({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group research-card overflow-hidden"
    >
      {/* Top accent bar */}
      <div className="h-[2px] bg-gradient-to-r from-purple-500/60 via-violet-400/40 to-transparent" />
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-500/15 text-purple-400 border border-purple-500/20">
              {item.id}
            </span>
            <span className="text-[13px] font-semibold text-white/85">{item.claim}</span>
          </div>
          {item.novelty_score != null && (
            <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-mono bg-violet-500/10 text-violet-400 border border-violet-500/20">
              ✨ {(item.novelty_score * 100).toFixed(0)}%
            </span>
          )}
        </div>
        <div className="mt-3 pl-3 border-l-2 border-purple-500/20">
          <div className="text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-1">Prediction</div>
          <p className="text-[12px] text-white/65 leading-relaxed">{item.prediction}</p>
        </div>
        {item.justification && (
          <p className="mt-2 text-[10px] text-white/30 italic leading-relaxed">{item.justification}</p>
        )}
        {item.confidence != null && (
          <div className="mt-2">
            <ConfidenceBar value={item.confidence} color="from-purple-400 to-violet-500" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Experiment Card ── */
export function ExperimentCard({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="research-card p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
            {item.id}
          </span>
          <span className="text-[13px] font-medium text-white/80">{item.title || item.metric}</span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-white/5 text-white/40 border border-white/10">
          → {item.hypothesis}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Metric", value: item.metric, icon: "📏" },
          { label: "Baseline", value: item.baseline, icon: "📊" },
          { label: "Success", value: item.success_criteria || item.success, icon: "🎯" },
        ].map((m) => (
          <div key={m.label} className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2">
            <div className="text-[9px] text-white/30 uppercase tracking-wider flex items-center gap-1">
              <span>{m.icon}</span> {m.label}
            </div>
            <div className="mt-0.5 text-[11px] text-white/65 font-mono truncate">{String(m.value || "—")}</div>
          </div>
        ))}
      </div>
      {item.methodology && (
        <p className="mt-2 text-[10px] text-white/30 leading-relaxed line-clamp-2">
          {typeof item.methodology === "string" ? item.methodology : ""}
        </p>
      )}
    </motion.div>
  );
}

/* ── Result Card ── */
export function ResultCard({ item, index }) {
  const passed = item.status === "PASS";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={`research-card p-4 ${passed ? "hover:border-emerald-500/20" : "hover:border-rose-500/20"}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-white/50">{item.experiment_id}</span>
          <span className="text-[12px] text-white/70">{item.metric}</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
          passed
            ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-glow-green"
            : "text-rose-400 bg-rose-400/10 border-rose-400/20"
        }`}>
          {passed ? "✓ PASS" : "✗ FAIL"}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Value", value: item.metric_value, cls: "text-neon-cyan" },
          { label: "Baseline", value: item.baseline, cls: "text-white/50" },
          { label: "Δ Change", value: item.improvement, cls: "text-emerald-400" },
          { label: "p-value", value: item.p_value, cls: "text-white/40" },
        ].map((m) => (
          <div key={m.label} className="text-center">
            <div className="text-[9px] text-white/25 uppercase tracking-wider">{m.label}</div>
            <div className={`text-[12px] font-mono font-bold ${m.cls}`}>{String(m.value ?? "—")}</div>
          </div>
        ))}
      </div>
      {item.log && <p className="mt-2 text-[10px] text-white/25 italic">{item.log}</p>}
    </motion.div>
  );
}

/* ── Analysis Section ── */
export function AnalysisSection({ analysis }) {
  if (!analysis) return null;
  const sections = [
    { key: "key_insight", label: "Key Insight", icon: "💡", color: "cyan", single: true },
    { key: "patterns", label: "Patterns Discovered", icon: "🔬", color: "purple" },
    { key: "conclusions", label: "Conclusions", icon: "✅", color: "green" },
    { key: "improvements", label: "Suggested Improvements", icon: "🚀", color: "amber" },
  ];
  const colors = {
    cyan: "from-cyan-500/20 to-transparent border-cyan-500/20 text-cyan-400",
    purple: "text-purple-400",
    green: "text-emerald-400",
    amber: "text-amber-400",
  };

  return (
    <div className="space-y-4">
      {sections.map(({ key, label, icon, color, single }) => {
        const data = analysis[key];
        if (!data || (Array.isArray(data) && !data.length)) return null;

        if (single) {
          return (
            <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`p-4 rounded-xl bg-gradient-to-r ${colors[color]} border`}>
              <div className="text-[10px] font-semibold uppercase tracking-wider mb-1 opacity-70">{icon} {label}</div>
              <p className="text-[13px] text-white/85 leading-relaxed">{data}</p>
            </motion.div>
          );
        }

        return (
          <div key={key}>
            <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">{icon} {label}</div>
            {data.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2 py-1.5">
                <span className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${colors[color]?.includes("text-") ? `bg-current ${colors[color]}` : "bg-white/30"}`} />
                <span className="text-[12px] text-white/65 leading-relaxed">{item}</span>
              </motion.div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* ── Learning Section ── */
export function LearningSection({ learning, final: finalSummary, evaluation }) {
  return (
    <div className="space-y-4">
      {finalSummary && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/[0.08] to-transparent border border-emerald-500/20">
          <div className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider mb-3">🏆 Final Research Summary</div>
          <MarkdownRenderer content={finalSummary} className="text-[13px] text-white/80 leading-relaxed font-sans" />
        </motion.div>
      )}

      {evaluation && Object.keys(evaluation).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Novelty", value: evaluation.novelty_score, color: "text-violet-400", bg: "bg-violet-500/10" },
            { label: "Depth", value: evaluation.reasoning_depth, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Confidence", value: evaluation.confidence_score, color: "text-cyan-400", bg: "bg-cyan-500/10" },
            { label: "Improvement", value: evaluation.iteration_improvement, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          ].map((m) => (
            <div key={m.label} className={`rounded-xl ${m.bg} border border-white/[0.06] p-3 text-center`}>
              <div className="text-[9px] text-white/30 uppercase tracking-wider">{m.label}</div>
              <div className={`text-xl font-bold font-mono ${m.color}`}>{Math.round((m.value || 0) * 100)}%</div>
            </div>
          ))}
        </div>
      )}

      {[
        { key: "key_learnings", label: "Key Learnings", icon: "📝" },
        { key: "best_practices", label: "Best Practices", icon: "⭐" },
        { key: "next_focus", label: "Next Focus Areas", icon: "🎯" },
        { key: "risk_mitigations", label: "Risk Mitigations", icon: "🛡️" },
      ].map(({ key, label, icon }) => {
        const items = learning?.[key];
        if (!items?.length) return null;
        return (
          <div key={key}>
            <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">{icon} {label}</div>
            {items.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="text-[12px] text-white/60 py-1.5 flex items-start gap-2">
                <span className="text-white/20 mt-0.5">▸</span> {item}
              </motion.div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
