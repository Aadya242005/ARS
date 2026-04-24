import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, Legend,
} from "recharts";

const COLORS = {
  cyan: "#00f0ff",
  blue: "#3b82f6",
  purple: "#a855f7",
  green: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <div className="font-semibold text-white/90 mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-white/70">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span>{p.name}: {typeof p.value === "number" ? p.value.toFixed(3) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ───── Experiment Results Bar Chart ───── */
export function ExperimentResultsChart({ results = [] }) {
  if (!results.length) return null;

  const data = results.map((r) => ({
    name: r.experiment_id || r.id || "E?",
    value: r.metric_value ?? 0,
    baseline: r.baseline ?? 0,
    status: r.status,
  }));

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-white/90">Experiment Results</div>
        <div className="flex items-center gap-3 text-[10px] text-white/50">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ background: COLORS.cyan }} /> Result
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ background: COLORS.purple }} /> Baseline
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="name"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
          />
          <YAxis
            domain={[0, 1]}
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="baseline" name="Baseline" radius={[4, 4, 0, 0]} maxBarSize={32}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS.purple} fillOpacity={0.5} />
            ))}
          </Bar>
          <Bar dataKey="value" name="Result" radius={[4, 4, 0, 0]} maxBarSize={32}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.status === "PASS" ? COLORS.cyan : COLORS.rose}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ───── Evaluation Metrics Radar Chart ───── */
export function EvaluationRadarChart({ evaluation = {} }) {
  const data = [
    { metric: "Novelty", value: evaluation.novelty_score ?? 0, fullMark: 1 },
    { metric: "Depth", value: evaluation.reasoning_depth ?? 0, fullMark: 1 },
    { metric: "Confidence", value: evaluation.confidence_score ?? 0, fullMark: 1 },
    { metric: "Improvement", value: evaluation.iteration_improvement ?? 0, fullMark: 1 },
  ];

  const allZero = data.every((d) => d.value === 0);
  if (allZero) return null;

  return (
    <div className="glass-card p-5">
      <div className="text-sm font-semibold text-white/90 mb-3">Evaluation Metrics</div>
      <ResponsiveContainer width="100%" height={240}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
          />
          <PolarRadiusAxis
            domain={[0, 1]}
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }}
            axisLine={false}
          />
          <Radar
            name="Score"
            dataKey="value"
            stroke={COLORS.cyan}
            fill={COLORS.cyan}
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>

      {/* Metric badges */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {data.map((d) => (
          <div
            key={d.metric}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]"
          >
            <span className="text-[11px] text-white/60">{d.metric}</span>
            <span className="text-xs font-mono font-semibold text-neon-cyan">
              {(d.value * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───── Hypothesis Confidence Chart ───── */
export function HypothesisChart({ hypotheses = [] }) {
  if (!hypotheses.length) return null;

  const data = hypotheses.map((h) => ({
    name: h.id || "H?",
    novelty: h.novelty_score ?? 0,
    confidence: h.confidence ?? 0,
  }));

  return (
    <div className="glass-card p-5">
      <div className="text-sm font-semibold text-white/90 mb-4">Hypothesis Scores</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="name"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          />
          <YAxis
            domain={[0, 1]}
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}
          />
          <Bar dataKey="novelty" name="Novelty" fill={COLORS.purple} fillOpacity={0.75} radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="confidence" name="Confidence" fill={COLORS.green} fillOpacity={0.75} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ───── Validation Status Grid ───── */
export function ValidationGrid({ checks = [] }) {
  if (!checks.length) return null;

  const statusColor = (s) => {
    if (s === "PASS") return "text-neon-green bg-neon-green/10 border-neon-green/20";
    if (s === "WARN") return "text-neon-amber bg-neon-amber/10 border-neon-amber/20";
    return "text-neon-rose bg-neon-rose/10 border-neon-rose/20";
  };

  return (
    <div className="glass-card p-5">
      <div className="text-sm font-semibold text-white/90 mb-4">Validation Report</div>
      <div className="space-y-2">
        {checks.map((v, i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] animate-fade-in"
          >
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white/80">{v.check}</div>
              {v.details && (
                <div className="text-[10px] text-white/40 mt-1 leading-relaxed">{v.details}</div>
              )}
            </div>
            <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusColor(v.status)}`}>
              {v.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
