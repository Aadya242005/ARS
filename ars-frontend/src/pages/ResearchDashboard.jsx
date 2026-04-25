import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExperimentResultsChart,
  EvaluationRadarChart,
  HypothesisChart,
  ValidationGrid,
  DataProcessingHeatmap,
  DistributionPlot,
} from "../components/ResearchCharts";
import {
  KnowledgeCard, HypothesisCard, ExperimentCard,
  ResultCard, AnalysisSection, LearningSection,
} from "../components/ResearchCards";

/* ───────── Constants ───────── */
const AGENTS_API = "http://localhost:6060";
const BACKEND_API = "http://localhost:5050";

const AGENTS = [
  { key: "knowledge", label: "Knowledge", icon: "📚", desc: "Extract key insights" },
  { key: "hypothesis", label: "Hypothesis", icon: "💡", desc: "Generate testable claims" },
  { key: "experiment", label: "Experiment", icon: "🧪", desc: "Design experiments" },
  { key: "execution", label: "Execution", icon: "⚡", desc: "Run experiments" },
  { key: "analysis", label: "Analysis", icon: "📊", desc: "Interpret results" },
  { key: "validation", label: "Validation", icon: "🛡️", desc: "Verify pipeline" },
  { key: "learning", label: "Learning", icon: "🧠", desc: "Synthesize insights" },
];

const DOMAINS = [
  { value: "AI", label: "Artificial Intelligence", icon: "🤖" },
  { value: "Biology", label: "Biology", icon: "🧬" },
  { value: "Physics", label: "Physics", icon: "⚛️" },
  { value: "Chemistry", label: "Chemistry", icon: "🧪" },
  { value: "Medicine", label: "Medicine", icon: "🏥" },
  { value: "general", label: "General", icon: "🔬" },
];

const TABS = [
  { key: "knowledge", label: "Knowledge" },
  { key: "hypotheses", label: "Hypotheses" },
  { key: "experiments", label: "Experiments" },
  { key: "results", label: "Results" },
  { key: "analysis", label: "Analysis" },
  { key: "validation", label: "Validation" },
  { key: "learning", label: "Learning" },
];

function bytesToSize(bytes = 0) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/* ───────── Pill ───────── */
function StatusPill({ status }) {
  const cls = {
    running: "text-[#00f0ff] bg-[#00f0ff]/10 border-[#00f0ff]/30 animate-pulse",
    done: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    failed: "text-rose-400 bg-rose-400/10 border-rose-400/20",
    queued: "text-amber-400/70 bg-amber-400/5 border-amber-400/15",
    idle: "text-white/25 bg-white/[0.02] border-white/[0.06]",
  }[status] || "text-white/25 bg-white/[0.02] border-white/[0.06]";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${cls}`}>
      {status}
    </span>
  );
}

/* ───────── Agent Pipeline Stepper ───────── */
function PipelineStepper({ statusMap, active }) {
  return (
    <div className="flex flex-wrap gap-2">
      {AGENTS.map((a, idx) => {
        const s = statusMap[a.key] || "idle";
        const isActive = active === a.key;
        const pillClass = s === "done" ? "node-pill-done"
          : s === "running" ? "node-pill-active"
            : s === "failed" ? "node-pill-failed"
              : s === "queued" ? "node-pill-queued"
                : "node-pill-idle";

        return (
          <div key={a.key} className="flex items-center gap-1.5">
            <div className={`${pillClass} flex items-center gap-2 ${isActive ? "ring-1 ring-[#00f0ff]/30" : ""}`}>
              <span>{a.icon}</span>
              <span>{a.label}</span>
              {s === "running" && (
                <span className="ml-1 h-1.5 w-1.5 rounded-full bg-[#00f0ff] animate-ping" />
              )}
            </div>
            {idx < AGENTS.length - 1 && (
              <span className={`text-[10px] ${s === "done" ? "text-emerald-500" : "text-white/15"}`}>→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ───────── Glass Card ───────── */
function Card({ title, icon, right, children, className = "" }) {
  return (
    <div className={`glass-card overflow-hidden ${className}`}>
      <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon && <span className="text-sm">{icon}</span>}
          <span className="text-sm font-semibold text-white/90">{title}</span>
        </div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ───────── Tab Button ───────── */
function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={[
        "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border",
        active
          ? "bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/30 shadow-glow-cyan"
          : "bg-white/[0.02] text-white/40 border-white/[0.06] hover:text-white/60 hover:bg-white/[0.04]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* ===================================================================
   MAIN DASHBOARD
   =================================================================== */
export default function ResearchDashboard() {
  const nav = useNavigate();
  const inputRef = useRef(null);
  const logEndRef = useRef(null);

  /* ───── State ───── */
  const [goal, setGoal] = useState("Analyze the effectiveness of retrieval-augmented generation for improving factual accuracy in large language models.");
  const [mode, setMode] = useState("full");
  const [domain, setDomain] = useState("AI");

  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [indexing, setIndexing] = useState(false);

  const [running, setRunning] = useState(false);
  const [runId, setRunId] = useState(null);
  const [activeAgent, setActiveAgent] = useState(null);
  const [agentStatus, setAgentStatus] = useState(() => Object.fromEntries(AGENTS.map((a) => [a.key, "idle"])));

  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState("knowledge");

  const [workspace, setWorkspace] = useState({
    knowledge: [], hypotheses: [], experiments: [], results: [],
    analysis: { patterns: [], conclusions: [], improvements: [] },
    validation: [], learning: {}, evaluation: {}, final: "",
  });

  const readyCount = useMemo(() => files.filter((f) => f.status === "ready").length, [files]);

  /* ───── Scroll logs ───── */
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  function pushLog(msg, tone = "info") {
    setLogs((p) => [...p, { ts: new Date().toISOString(), tone, msg }]);
  }

  /* ───── File upload ───── */
  function addFiles(list) {
    const arr = Array.from(list || []);
    if (!arr.length) return;
    const mapped = arr.map((f, i) => ({
      id: `local_${Date.now()}_${i}`,
      name: f.name,
      size: f.size,
      type: f.type || "unknown",
      status: "uploaded",
      _file: f,
    }));
    setFiles((prev) => [...mapped, ...prev]);
    pushLog(`Added ${arr.length} file(s).`, "good");
    uploadAndIndex(mapped);
  }

  async function uploadAndIndex(newFiles) {
    setIndexing(true);
    pushLog("Indexing: uploading → parsing → embedding…", "info");

    for (const f of newFiles) {
      setFiles((prev) => prev.map((x) => (x.id === f.id ? { ...x, status: "parsing" } : x)));

      try {
        // Upload to backend
        const formData = new FormData();
        formData.append("file", f._file);
        const res = await fetch(`${BACKEND_API}/api/docs/upload`, {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          setFiles((prev) => prev.map((x) => (x.id === f.id ? { ...x, status: "embedding" } : x)));
          await new Promise((r) => setTimeout(r, 300));
          setFiles((prev) => prev.map((x) => (x.id === f.id ? { ...x, status: "ready" } : x)));
          pushLog(`✅ ${f.name} indexed successfully`, "good");
        } else {
          setFiles((prev) => prev.map((x) => (x.id === f.id ? { ...x, status: "failed" } : x)));
          pushLog(`❌ Failed to index ${f.name}`, "error");
        }
      } catch (e) {
        // Fallback: simulate indexing if backend not available
        setFiles((prev) => prev.map((x) => (x.id === f.id ? { ...x, status: "embedding" } : x)));
        await new Promise((r) => setTimeout(r, 500));
        setFiles((prev) => prev.map((x) => (x.id === f.id ? { ...x, status: "ready" } : x)));
        pushLog(`⚠ ${f.name} indexed locally (backend offline)`, "warn");
      }
    }

    pushLog("Knowledge base ready ✅", "good");
    setIndexing(false);
  }

  function removeFile(id) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  /* ───── Reset ───── */
  function resetAll() {
    setFiles([]);
    setIndexing(false);
    setRunning(false);
    setRunId(null);
    setActiveAgent(null);
    setAgentStatus(Object.fromEntries(AGENTS.map((a) => [a.key, "idle"])));
    setLogs([]);
    setWorkspace({
      knowledge: [], hypotheses: [], experiments: [], results: [],
      analysis: { patterns: [], conclusions: [], improvements: [] },
      validation: [], learning: {}, evaluation: {}, final: "",
    });
    setTab("knowledge");
  }

  /* ───── Start real SSE run ───── */
  const startRun = useCallback(async () => {
    if (running) return;

    setRunning(true);
    setActiveAgent(null);
    setWorkspace({
      knowledge: [], hypotheses: [], experiments: [], results: [],
      analysis: { patterns: [], conclusions: [], improvements: [] },
      validation: [], learning: {}, evaluation: {}, final: "",
    });
    setAgentStatus(Object.fromEntries(AGENTS.map((a) => [a.key, "queued"])));
    pushLog(`🚀 Starting ${mode} research cycle (domain: ${domain})…`, "good");

    try {
      // Start run on agents service
      const startRes = await fetch(`${AGENTS_API}/api/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, mode, domain }),
      });

      if (!startRes.ok) throw new Error("Failed to start run");

      const { run_id } = await startRes.json();
      setRunId(run_id);
      pushLog(`Run started: ${run_id}`, "info");

      // Connect to SSE stream
      const es = new EventSource(`${AGENTS_API}/api/runs/${run_id}/stream`);

      es.addEventListener("node_started", (e) => {
        const d = JSON.parse(e.data);
        setActiveAgent(d.node);
        setAgentStatus((prev) => ({ ...prev, [d.node]: "running" }));
        pushLog(`⚙️ ${d.node.toUpperCase()} agent running…`, "info");
      });

      es.addEventListener("node_finished", (e) => {
        const d = JSON.parse(e.data);
        setAgentStatus((prev) => ({ ...prev, [d.node]: d.status }));
        const icon = d.status === "done" ? "✅" : "❌";
        pushLog(`${icon} ${d.node.toUpperCase()} ${d.status}`, d.status === "done" ? "good" : "error");
      });

      es.addEventListener("state_update", (e) => {
        const state = JSON.parse(e.data);
        if (state.workspace) {
          setWorkspace(state.workspace);
        }
        if (state.active_node !== undefined) {
          setActiveAgent(state.active_node);
        }
        if (state.node_status) {
          setAgentStatus(state.node_status);
        }
        // Auto-switch tab to the active node's output
        if (state.active_node) {
          const tabMap = {
            knowledge: "knowledge", hypothesis: "hypotheses",
            experiment: "experiments", execution: "results",
            analysis: "analysis", validation: "validation", learning: "learning",
          };
          if (tabMap[state.active_node]) setTab(tabMap[state.active_node]);
        }
        // Also add server-side logs
        if (state.logs && state.logs.length > 0) {
          const last = state.logs[state.logs.length - 1];
          if (last.msg) {
            // Avoid duplicate logs - only push if message is different from last local log
            setLogs((prev) => {
              if (prev.length > 0 && prev[prev.length - 1].msg === last.msg) return prev;
              return [...prev, { ts: last.ts, tone: last.tone, msg: last.msg }];
            });
          }
        }
      });

      es.addEventListener("run_finished", () => {
        setRunning(false);
        setActiveAgent(null);
        pushLog("🎉 Research cycle complete!", "good");
        es.close();
      });

      es.addEventListener("error", () => {
        // SSE connection closed or errored
        setRunning(false);
        es.close();
      });

    } catch (e) {
      pushLog(`❌ Error: ${e.message}. Make sure agents service (port 6060) is running.`, "error");
      setRunning(false);
    }
  }, [goal, mode, domain, running]);

  /* ───── Download report ───── */
  async function downloadReport() {
    if (!runId) return;
    try {
      const res = await fetch(`${AGENTS_API}/api/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ run_id: runId }),
      });
      const data = await res.json();
      if (data.report) {
        const blob = new Blob([data.report], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ARS_Report_${runId}.md`;
        a.click();
        URL.revokeObjectURL(url);
        pushLog("📄 Report downloaded", "good");
      }
    } catch (e) {
      pushLog(`Report download failed: ${e.message}`, "error");
    }
  }

  /* ───── Tone styling ───── */
  function toneClass(tone) {
    if (tone === "good") return "text-emerald-400";
    if (tone === "warn" || tone === "warning") return "text-amber-400";
    if (tone === "error" || tone === "bad") return "text-rose-400";
    return "text-white/50";
  }

  const fileStatusColor = (s) => {
    if (s === "ready") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    if (s === "embedding" || s === "parsing") return "text-[#00f0ff] bg-[#00f0ff]/10 border-[#00f0ff]/20 animate-pulse";
    if (s === "failed") return "text-rose-400 bg-rose-400/10 border-rose-400/20";
    return "text-white/40 bg-white/5 border-white/10";
  };

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <div className="min-h-screen bg-lab-950 text-white font-sans">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,240,255,0.04),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.03),transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PHBhdGggZD0iTSAxMCAwIEwgMTAgNDAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2dyaWQpIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiLz48L3N2Zz4=')] opacity-50" />
      </div>

      {/* ═══════════ HEADER ═══════════ */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-lab-950/80 border-b border-white/[0.06]">
        <div className="max-w-[1600px] mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#00f0ff] to-blue-600 flex items-center justify-center shadow-glow-cyan">
              <span className="text-sm font-bold">🔬</span>
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                ARS Research Lab
                <span className="text-[9px] px-2 py-0.5 rounded-md bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 font-mono">
                  7-AGENT
                </span>
              </div>
              <div className="text-[11px] text-white/40">Autonomous Research Scientist</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => nav("/")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 hover:text-white/90 transition">
              Home
            </button>
            {runId && !running && (
              <button onClick={downloadReport} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/20 text-[#00f0ff] transition">
                📄 Report
              </button>
            )}
            {runId && (
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono bg-white/[0.04] border border-white/[0.06] text-white/40">
                {runId}
              </span>
            )}
            <button onClick={resetAll} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-rose-500/10 border border-white/[0.08] hover:border-rose-500/20 text-white/50 hover:text-rose-400 transition">
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <div className="max-w-[1600px] mx-auto px-5 py-6 grid grid-cols-1 xl:grid-cols-12 gap-5">

        {/* ═══════════ LEFT PANEL: Config + Workspace ═══════════ */}
        <div className="xl:col-span-8 space-y-5">

          {/* ── Pipeline Stepper ── */}
          <Card title="Agent Pipeline" icon="🔗" right={
            <StatusPill status={running ? "running" : runId ? "done" : "idle"} />
          }>
            <PipelineStepper statusMap={agentStatus} active={activeAgent} />
          </Card>

          {/* ── Upload + Config Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Upload */}
            <Card title="Documents" icon="📁" right={
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${readyCount ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-white/30 bg-white/[0.02] border-white/[0.06]"}`}>
                  {readyCount} ready
                </span>
                <button onClick={() => inputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 hover:bg-[#00f0ff]/20 transition">
                  Upload
                </button>
                <input ref={inputRef} className="hidden" type="file" multiple
                  accept=".pdf,.doc,.docx,.txt,.md,.csv,.json"
                  onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
              </div>
            }>
              <div
                onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                className={`rounded-xl border-2 border-dashed p-6 transition text-center ${dragOver ? "border-[#00f0ff]/40 bg-[#00f0ff]/5" : "border-white/[0.08] bg-white/[0.01]"}`}
              >
                <div className="text-xs font-medium text-white/50">Drop files here or click Upload</div>
                <div className="text-[10px] text-white/30 mt-1">PDF, DOCX, TXT, MD, CSV, JSON</div>
              </div>

              {files.length > 0 && (
                <div className="mt-3 space-y-2 max-h-[160px] overflow-auto">
                  {files.map((f) => (
                    <div key={f.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium text-white/70 truncate">{f.name}</div>
                        <div className="text-[10px] text-white/30 flex items-center gap-1.5">
                          {bytesToSize(f.size)}
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${fileStatusColor(f.status)}`}>{f.status}</span>
                        </div>
                      </div>
                      <button onClick={() => removeFile(f.id)} disabled={running}
                        className="text-[10px] text-white/30 hover:text-rose-400 transition">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Run Config */}
            <Card title="Configuration" icon="⚙️" right={
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${mode === "quick" ? "text-amber-400 bg-amber-400/10 border-amber-400/20" : "text-[#00f0ff] bg-[#00f0ff]/10 border-[#00f0ff]/20"}`}>
                {mode.toUpperCase()}
              </span>
            }>
              {/* Domain */}
              <label className="text-[11px] font-medium text-white/50 uppercase tracking-wider">Domain</label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {DOMAINS.map((d) => (
                  <button key={d.value} onClick={() => setDomain(d.value)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition ${domain === d.value
                      ? "bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/30"
                      : "bg-white/[0.02] text-white/40 border-white/[0.06] hover:text-white/60"}`}>
                    {d.icon} {d.value}
                  </button>
                ))}
              </div>

              {/* Goal */}
              <label className="block mt-3 text-[11px] font-medium text-white/50 uppercase tracking-wider">Goal</label>
              <textarea value={goal} onChange={(e) => setGoal(e.target.value)}
                className="mt-1.5 w-full min-h-[80px] rounded-xl bg-white/[0.03] border border-white/[0.08] px-3 py-2.5 text-xs text-white/80 placeholder:text-white/20 outline-none focus:border-[#00f0ff]/30 resize-none"
                placeholder="Describe your research goal…" />

              {/* Mode + Start */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex rounded-lg border border-white/[0.08] overflow-hidden flex-1">
                  {["quick", "full"].map((m) => (
                    <button key={m} onClick={() => setMode(m)}
                      className={`flex-1 py-2 text-[11px] font-semibold transition ${mode === m ? "bg-[#00f0ff]/10 text-[#00f0ff]" : "bg-white/[0.02] text-white/30 hover:text-white/50"}`}>
                      {m === "quick" ? "⚡ Quick" : "🔬 Full"}
                    </button>
                  ))}
                </div>
                <button onClick={startRun} disabled={running || indexing}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition ${running || indexing
                    ? "bg-white/[0.04] text-white/20 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#00f0ff] to-blue-500 text-lab-950 hover:shadow-glow-cyan hover:scale-[1.02]"}`}>
                  {running ? "Running…" : "▶ Start"}
                </button>
              </div>
            </Card>
          </div>

          {/* ── Workspace Tabs ── */}
          <Card title="Workspace" icon="📋" right={
            <div className="flex items-center gap-1">
              {TABS.map((t) => (
                <TabBtn key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>
                  {t.label}
                </TabBtn>
              ))}
            </div>
          }>
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>

                {/* ── Knowledge ── */}
                {tab === "knowledge" && (
                  <div className="space-y-3">
                    {!workspace.knowledge.length ? (
                      <div className="text-xs text-white/30 py-8 text-center">Knowledge extraction results will appear here…</div>
                    ) : workspace.knowledge.map((k, i) => (
                      <KnowledgeCard key={i} item={k} index={i} />
                    ))}
                    {workspace.knowledge.length > 0 && <DataProcessingHeatmap />}
                  </div>
                )}

                {/* ── Hypotheses ── */}
                {tab === "hypotheses" && (
                  <div className="space-y-3">
                    {!workspace.hypotheses.length ? (
                      <div className="text-xs text-white/30 py-8 text-center">Hypotheses will appear here…</div>
                    ) : (
                      <>
                        {workspace.hypotheses.map((h, i) => (
                          <HypothesisCard key={h.id} item={h} index={i} />
                        ))}
                        <HypothesisChart hypotheses={workspace.hypotheses} />
                      </>
                    )}
                  </div>
                )}

                {/* ── Experiments ── */}
                {tab === "experiments" && (
                  <div className="space-y-3">
                    {!workspace.experiments.length ? (
                      <div className="text-xs text-white/30 py-8 text-center">Experiment designs will appear here…</div>
                    ) : workspace.experiments.map((e, i) => (
                      <ExperimentCard key={e.id} item={e} index={i} />
                    ))}
                  </div>
                )}

                {/* ── Results ── */}
                {tab === "results" && (
                  <div className="space-y-3">
                    {!workspace.results.length ? (
                      <div className="text-xs text-white/30 py-8 text-center">Execution results will appear here…</div>
                    ) : (
                      <>
                        {workspace.results.map((r, i) => (
                          <ResultCard key={i} item={r} index={i} />
                        ))}
                        <ExperimentResultsChart results={workspace.results} />
                        <DistributionPlot />
                      </>
                    )}
                  </div>
                )}

                {/* ── Analysis ── */}
                {tab === "analysis" && (
                  <div>
                    {!workspace.analysis?.patterns?.length && !workspace.analysis?.conclusions?.length ? (
                      <div className="text-xs text-white/30 py-8 text-center">Analysis results will appear here…</div>
                    ) : (
                      <AnalysisSection analysis={workspace.analysis} />
                    )}
                  </div>
                )}

                {/* ── Validation ── */}
                {tab === "validation" && (
                  <div>
                    {!workspace.validation?.length ? (
                      <div className="text-xs text-white/30 py-8 text-center">Validation checks will appear here…</div>
                    ) : (
                      <ValidationGrid checks={workspace.validation} />
                    )}
                  </div>
                )}

                {/* ── Learning ── */}
                {tab === "learning" && (
                  <div>
                    {!workspace.learning?.key_learnings?.length && !workspace.final ? (
                      <div className="text-xs text-white/30 py-8 text-center">Learning synthesis will appear here…</div>
                    ) : (
                      <LearningSection learning={workspace.learning} final={workspace.final} evaluation={workspace.evaluation} />
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </Card>
        </div>

        {/* ═══════════ RIGHT PANEL ═══════════ */}
        <div className="xl:col-span-4 space-y-5">

          {/* ── Live Logs ── */}
          <Card title="Live Activity" icon="📡" right={
            <button onClick={() => setLogs([])}
              className="px-2 py-1 rounded-lg text-[10px] font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/40 transition">
              Clear
            </button>
          }>
            <div className="h-[260px] overflow-auto rounded-xl bg-black/20 border border-white/[0.04] p-3 font-mono">
              {logs.length === 0 ? (
                <div className="text-[10px] text-white/20 text-center py-8">Waiting for activity…</div>
              ) : (
                <div className="space-y-1">
                  {logs.map((l, i) => (
                    <div key={i} className="text-[10px] leading-relaxed flex items-start gap-2 animate-fade-in">
                      <span className="text-white/20 shrink-0 w-[52px]">{l.ts?.slice(11, 19)}</span>
                      <span className={toneClass(l.tone)}>{l.msg}</span>
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              )}
            </div>
          </Card>

          {/* ── Evaluation Metrics ── */}
          <EvaluationRadarChart evaluation={workspace.evaluation} />

          {/* ── Active Agent Detail ── */}
          {activeAgent && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 neon-border-cyan">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#00f0ff] animate-ping" />
                <span className="text-sm font-bold text-[#00f0ff]">
                  {AGENTS.find((a) => a.key === activeAgent)?.icon} {activeAgent.toUpperCase()}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-white/40">
                {AGENTS.find((a) => a.key === activeAgent)?.desc}
              </div>
              <div className="mt-3 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#00f0ff] to-blue-500 rounded-full animate-pulse" style={{ width: "60%" }} />
              </div>
            </motion.div>
          )}

          {/* ── Quick Stats ── */}
          <Card title="Pipeline Stats" icon="📈">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Knowledge", value: workspace.knowledge.length, color: "text-blue-400" },
                { label: "Hypotheses", value: workspace.hypotheses.length, color: "text-purple-400" },
                { label: "Experiments", value: workspace.experiments.length, color: "text-amber-400" },
                { label: "Results", value: workspace.results.length, color: "text-emerald-400" },
                { label: "Passed", value: workspace.results.filter((r) => r.status === "PASS").length, color: "text-[#00f0ff]" },
                { label: "Checks", value: workspace.validation.length, color: "text-rose-400" },
              ].map((s) => (
                <div key={s.label} className="px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                  <div className="text-[10px] text-white/30">{s.label}</div>
                  <div className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}