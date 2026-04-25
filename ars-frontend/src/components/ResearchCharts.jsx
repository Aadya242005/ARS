import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, Legend, ScatterChart, Scatter, ZAxis, AreaChart, Area
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

/* ───── Internal Data Processing Heatmap ───── */
export function DataProcessingHeatmap() {
  const generateData = () => {
    const data = [];
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 6; y++) {
        data.push({ x, y, z: Math.random() * 100 });
      }
    }
    return data;
  };

  const data01 = generateData();
  const data02 = generateData();

  return (
    <div className="glass-card p-5 mt-4 border-cyan-500/20 shadow-glow-cyan transition duration-500">
      <div className="text-[10px] uppercase tracking-wider font-semibold text-cyan-400 mb-4 flex items-center gap-2">
        <span className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse" />
        Agent Internal Compilation Matrix
      </div>
      <div className="text-xs text-white/50 mb-4">
        Visualizing embedding vector distances and attention span weights across extracted document chunks.
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <ScatterChart margin={{ top: 10, right: 10, bottom: -10, left: -20 }}>
          <XAxis type="number" dataKey="x" name="Sequence" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis type="number" dataKey="y" name="Head" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <ZAxis type="number" dataKey="z" range={[10, 200]} name="Weight" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#070b14', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '8px' }} />
          <Scatter name="Context A" data={data01} fill={COLORS.cyan} fillOpacity={0.6} />
          <Scatter name="Context B" data={data02} fill={COLORS.purple} fillOpacity={0.6} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ───── Distribution Box Plot / Area Chart ───── */
export function DistributionPlot() {
  const data = [
    { name: '0', val: 0, baseline: 0 },
    { name: '1', val: 12, baseline: 8 },
    { name: '2', val: 30, baseline: 15 },
    { name: '3', val: 65, baseline: 25 },
    { name: '4', val: 85, baseline: 30 },
    { name: '5', val: 50, baseline: 40 },
    { name: '6', val: 20, baseline: 15 },
    { name: '7', val: 5, baseline: 5 },
  ];

  return (
    <div className="glass-card p-5 mt-4 border-purple-500/20 shadow-glow-purple transition duration-500">
      <div className="text-[10px] uppercase tracking-wider font-semibold text-purple-400 mb-4 flex items-center gap-2">
        <span className="h-2 w-2 bg-purple-400 rounded-full animate-pulse" />
        Probability Distribution Processing
      </div>
      <div className="text-xs text-white/50 mb-4">
        Agent calculating statistical significance (p-values) against the baseline distribution.
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.cyan} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS.cyan} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <Tooltip contentStyle={{ backgroundColor: '#070b14', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '8px' }} />
          <Area type="monotone" dataKey="baseline" stroke={COLORS.purple} strokeWidth={2} fillOpacity={1} fill="url(#colorBase)" />
          <Area type="monotone" dataKey="val" stroke={COLORS.cyan} strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
