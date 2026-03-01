import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const AGENTS = [
  { key: "knowledge", label: "Knowledge" },
  { key: "hypothesis", label: "Hypothesis" },
  { key: "experiment", label: "Experiment" },
  { key: "execution", label: "Execution" },
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

function Pill({ tone = "neutral", children }) {
  const cls =
    tone === "good"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : tone === "info"
      ? "bg-sky-50 text-sky-700 ring-sky-200"
      : tone === "warn"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : tone === "bad"
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : "bg-slate-50 text-slate-700 ring-slate-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ring-1 ${cls}`}>
      {children}
    </span>
  );
}

function Card({ title, right, children }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {right}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Stepper({ statusMap, active }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {AGENTS.map((a, idx) => {
        const s = statusMap[a.key] || "idle";
        const isActive = active === a.key;

        const tone =
          s === "done"
            ? "good"
            : s === "running"
            ? "info"
            : s === "failed"
            ? "bad"
            : s === "queued"
            ? "warn"
            : "neutral";

        return (
          <div key={a.key} className="flex items-center gap-2">
            <div
              className={[
                "px-3 py-2 rounded-xl ring-1 text-xs font-semibold transition",
                isActive ? "bg-sky-50 text-sky-800 ring-sky-200" : "bg-white text-slate-700 ring-slate-200",
              ].join(" ")}
            >
              <div className="flex items-center gap-2">
                <span className="opacity-70">{idx + 1}.</span>
                <span>{a.label}</span>
                <span className="ml-1">
                  <Pill tone={tone}>
                    {s === "idle" && "Idle"}
                    {s === "queued" && "Queued"}
                    {s === "running" && "Running"}
                    {s === "done" && "Done"}
                    {s === "failed" && "Failed"}
                  </Pill>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-3 py-2 rounded-xl text-sm font-medium transition ring-1",
        active ? "bg-sky-600 text-white ring-sky-600" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
      ].join(" ")}
      type="button"
    >
      {children}
    </button>
  );
}

export default function ResearchDashboard() {
  const nav = useNavigate();

  const inputRef = useRef(null);
  const logEndRef = useRef(null);

  const [goal, setGoal] = useState("Summarize the documents and propose testable hypotheses + experiments.");
  const [mode, setMode] = useState("full"); // quick | full

  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([]); // {id,name,size,type,status}
  const [indexing, setIndexing] = useState(false);

  const [running, setRunning] = useState(false);
  const [runId, setRunId] = useState(null);

  const [activeAgent, setActiveAgent] = useState(null);
  const [agentStatus, setAgentStatus] = useState(() =>
    Object.fromEntries(AGENTS.map((a) => [a.key, "idle"]))
  );

  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState("knowledge"); // knowledge | hypotheses | experiments | results | validation

  const [workspace, setWorkspace] = useState({
    knowledge: [],
    hypotheses: [],
    experiments: [],
    results: [],
    validation: [],
    final: "",
  });

  const readyCount = useMemo(() => files.filter((f) => f.status === "ready").length, [files]);
  const hasDocs = files.length > 0;
  const canNavigate = hasDocs && readyCount > 0 && !indexing;

  const docsForNav = useMemo(
    () => files.map(({ id, name, status, size, type }) => ({ id, name, status, size, type })),
    [files]
  );

  function makeSummaryPayload() {
    return {
      overview:
        "These documents contain project context, constraints, workflow hints, and evaluation cues. Below is a structured summary extracted for planning research steps.",
      keyPoints: [
        "Objective and outputs appear across documents.",
        "Constraints imply trade-offs (cost/time/accuracy).",
        "Evaluation hints: baselines, validation, robustness checks.",
      ],
      topics: ["Objective", "Constraints", "Metrics", "Workflow", "Risks"],
      entities: ["ARS", "Agent", "Hypothesis", "Experiment", "Validation"],
      gaps: [
        "Exact success metrics not clearly defined.",
        "Need dataset/source definitions for experiments.",
        "Validation checklist not finalized.",
      ],
    };
  }

  function makeResearchPayload() {
    return {
      directions: [
        {
          id: "D1",
          title: "Define evaluation + baselines",
          why: "Without baselines, agent improvements are not measurable.",
          hypotheses: [
            { id: "H1", claim: "RAG grounding improves factual accuracy", metric: "groundedness/citations", success: "+10%" },
            { id: "H2", claim: "Validation agent reduces false conclusions", metric: "robustness pass rate", success: "+15%" },
          ],
          experiments: [
            { id: "E1", steps: "Baseline summary vs RAG summary", output: "factuality + citations" },
            { id: "E2", steps: "Pipeline with/without validation agent", output: "robustness + error rate" },
          ],
        },
      ],
      nextSteps: [
        "Lock 2–3 success metrics.",
        "Run quick cycle first (K→H→E).",
        "Then run full execution + validation.",
      ],
    };
  }

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  function pushLog(msg, tone = "info") {
    setLogs((p) => [...p, { ts: new Date().toISOString(), tone, msg }]);
  }

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

    // simulate indexing automatically
    simulateIndexing(mapped.map((m) => m.id));
  }

  async function simulateIndexing(ids) {
    setIndexing(true);
    pushLog("Indexing started: parsing → chunking → embeddings…", "info");

    setFiles((prev) => prev.map((f) => (ids.includes(f.id) ? { ...f, status: "parsing" } : f)));
    await new Promise((r) => setTimeout(r, 600));

    setFiles((prev) => prev.map((f) => (ids.includes(f.id) ? { ...f, status: "embedding" } : f)));
    await new Promise((r) => setTimeout(r, 700));

    setFiles((prev) => prev.map((f) => (ids.includes(f.id) ? { ...f, status: "ready" } : f)));
    pushLog("Knowledge base ready ✅", "good");
    setIndexing(false);
  }

  function removeFile(id) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function resetAll() {
    setFiles([]);
    setIndexing(false);
    setRunning(false);
    setRunId(null);
    setActiveAgent(null);
    setAgentStatus(Object.fromEntries(AGENTS.map((a) => [a.key, "idle"])));
    setLogs([]);
    setWorkspace({ knowledge: [], hypotheses: [], experiments: [], results: [], validation: [], final: "" });
    setTab("knowledge");
  }

  async function simulateRun() {
    if (!hasDocs || readyCount === 0 || running) return;

    setRunning(true);
    setRunId(`demo_${Date.now()}`);
    setActiveAgent(null);
    setWorkspace({ knowledge: [], hypotheses: [], experiments: [], results: [], validation: [], final: "" });

    setAgentStatus(Object.fromEntries(AGENTS.map((a) => [a.key, "queued"])));
    pushLog(`Run started (${mode === "quick" ? "Quick" : "Full"} mode).`, "good");

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    const plan =
      mode === "quick"
        ? ["knowledge", "hypothesis", "experiment", "finalize"]
        : ["knowledge", "hypothesis", "experiment", "execution", "analysis", "validation", "learning", "finalize"];

    for (const step of plan) {
      if (step === "finalize") break;

      setActiveAgent(step);
      setAgentStatus((p) => ({ ...p, [step]: "running" }));
      pushLog(`${step.toUpperCase()} agent running…`, "info");
      await sleep(600);

      if (step === "knowledge") {
        setWorkspace((w) => ({
          ...w,
          knowledge: [
            { claim: "Key constraints and requirements extracted from uploaded docs.", source: "uploaded_docs", confidence: 0.82 },
            { claim: "Repeated entities/topics detected across documents.", source: "uploaded_docs", confidence: 0.74 },
          ],
        }));
        setTab("knowledge");
      }
      if (step === "hypothesis") {
        setWorkspace((w) => ({
          ...w,
          hypotheses: [
            { id: "H1", claim: "Retrieval grounding improves factual accuracy.", prediction: "Hallucination rate decreases." },
            { id: "H2", claim: "Role-restricted agents reduce planning errors.", prediction: "Validation pass rate increases." },
          ],
        }));
        setTab("hypotheses");
      }
      if (step === "experiment") {
        setWorkspace((w) => ({
          ...w,
          experiments: [
            { id: "E1", hypothesis: "H1", metric: "groundedness_score", success: ">= +10%" },
            { id: "E2", hypothesis: "H2", metric: "validation_pass_rate", success: ">= +15%" },
          ],
        }));
        setTab("experiments");
      }
      if (step === "execution") {
        setWorkspace((w) => ({
          ...w,
          results: [{ run: "R1", e1: "+12% groundedness", e2: "+18% validation", notes: "Stable on demo." }],
        }));
        setTab("results");
      }
      if (step === "analysis") {
        setWorkspace((w) => ({
          ...w,
          results: [...w.results],
        }));
        setTab("results");
      }
      if (step === "validation") {
        setWorkspace((w) => ({
          ...w,
          validation: [
            { check: "Leakage", status: "PASS" },
            { check: "Reproducibility", status: "PASS" },
            { check: "Ablation sanity", status: "PASS (demo)" },
          ],
        }));
        setTab("validation");
      }
      if (step === "learning") {
        setWorkspace((w) => ({
          ...w,
          final: "Demo completed ✅ Next: connect backend tools (upload → parse → embed → SSE logs) to run real experiments.",
        }));
      }

      await sleep(350);
      setAgentStatus((p) => ({ ...p, [step]: "done" }));
      pushLog(`${step.toUpperCase()} done.`, "good");
    }

    setAgentStatus((p) => {
      const copy = { ...p };
      Object.keys(copy).forEach((k) => {
        if (copy[k] === "queued") copy[k] = "idle";
      });
      return copy;
    });

    setActiveAgent(null);
    setRunning(false);
    pushLog("Run completed.", "good");
  }

  function toneToClass(tone) {
    if (tone === "good") return "text-emerald-700";
    if (tone === "warn") return "text-amber-700";
    if (tone === "bad") return "text-rose-700";
    return "text-slate-700";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/70 backdrop-blur border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-400/30 to-indigo-500/25 ring-1 ring-slate-200" />
            <div>
              <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                Research Dashboard
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-600 text-white">Light UI</span>
              </div>
              <div className="text-xs text-slate-600">
                Upload docs → Index → Run multi-agent cycle → Review results
              </div>
            </div>
          </div>

          {/* Top buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={() => nav("/app")}
              className="px-3 py-2 rounded-xl text-sm font-medium bg-sky-600 text-white hover:bg-sky-700"
            >
              Dashboard
            </button>

            <button
              type="button"
              disabled={!canNavigate}
              title={!canNavigate ? "Upload and index at least one document first" : ""}
              onClick={() =>
                nav("/summary", {
                  state: {
                    docs: docsForNav,
                    goal,
                    mode,
                    summary: makeSummaryPayload(),
                  },
                })
              }
              className={[
                "px-3 py-2 rounded-xl text-sm font-medium ring-1 transition",
                canNavigate
                  ? "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
                  : "bg-slate-200 text-slate-500 ring-slate-200 cursor-not-allowed",
              ].join(" ")}
            >
              Summary
            </button>

            <button
              type="button"
              disabled={!canNavigate}
              title={!canNavigate ? "Upload and index at least one document first" : ""}
              onClick={() =>
                nav("/research", {
                  state: {
                    docs: docsForNav,
                    goal,
                    mode,
                    summary: makeSummaryPayload(),
                    research: makeResearchPayload(),
                  },
                })
              }
              className={[
                "px-3 py-2 rounded-xl text-sm font-medium ring-1 transition",
                canNavigate
                  ? "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
                  : "bg-slate-200 text-slate-500 ring-slate-200 cursor-not-allowed",
              ].join(" ")}
            >
              Research
            </button>

            {runId ? <Pill tone="info">Run: {runId}</Pill> : <Pill>Idle</Pill>}

            <button
              type="button"
              onClick={resetAll}
              className="px-3 py-2 rounded-xl text-sm font-medium bg-white hover:bg-slate-50 ring-1 ring-slate-200 text-slate-800"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-5 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left */}
        <div className="lg:col-span-7 space-y-6">
          <Card
            title="Upload Documents"
            right={
              <div className="flex items-center gap-2">
                <Pill tone={indexing ? "info" : readyCount ? "good" : "neutral"}>
                  {indexing ? "Indexing…" : readyCount ? `Ready: ${readyCount}` : "No docs yet"}
                </Pill>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="px-3 py-2 rounded-xl text-sm font-medium bg-sky-600 text-white hover:bg-sky-700"
                >
                  Upload
                </button>
                <input
                  ref={inputRef}
                  className="hidden"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.md,.csv,.json"
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>
            }
          >
            <div
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOver(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOver(false);
                addFiles(e.dataTransfer.files);
              }}
              className={[
                "rounded-2xl border-2 border-dashed p-8 transition",
                dragOver ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-white",
              ].join(" ")}
            >
              <div className="text-center">
                <div className="text-base font-semibold text-slate-900">Drag & drop your documents</div>
                <div className="text-sm text-slate-600 mt-2">
                  PDF, DOCX, TXT, CSV, MD, JSON • We’ll parse and index them automatically
                </div>

                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-white ring-1 ring-slate-200 text-slate-800 font-medium hover:bg-slate-50"
                  >
                    Choose files
                  </button>
                </div>
              </div>
            </div>

            {/* Files */}
            <div className="mt-6">
              {!files.length ? (
                <div className="text-sm text-slate-600">No files yet. Upload to start.</div>
              ) : (
                <div className="space-y-3">
                  {files.map((f) => {
                    const tone =
                      f.status === "ready"
                        ? "good"
                        : f.status === "embedding" || f.status === "parsing"
                        ? "info"
                        : f.status === "failed"
                        ? "bad"
                        : "neutral";

                    return (
                      <div
                        key={f.id}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-white ring-1 ring-slate-200/60 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">{f.name}</div>
                          <div className="text-xs text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
                            <span>{bytesToSize(f.size)}</span>
                            <span className="text-slate-300">•</span>
                            <span className="truncate">{f.type}</span>
                            <span className="text-slate-300">•</span>
                            <Pill tone={tone}>{f.status}</Pill>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFile(f.id)}
                          className="px-3 py-2 rounded-xl text-sm bg-white hover:bg-slate-50 ring-1 ring-slate-200 text-slate-800"
                          disabled={running}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          <Card title="Run Configuration" right={<Pill tone={mode === "quick" ? "warn" : "info"}>{mode.toUpperCase()}</Pill>}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8">
                <label className="text-sm font-medium text-slate-800">Research goal</label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="mt-2 w-full min-h-[100px] rounded-2xl bg-white ring-1 ring-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:ring-sky-300"
                  placeholder="What should ARS do with the uploaded documents?"
                />
              </div>

              <div className="md:col-span-4 space-y-3">
                <label className="text-sm font-medium text-slate-800">Mode</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMode("quick")}
                    className={[
                      "flex-1 px-3 py-2 rounded-xl ring-1 text-sm font-medium transition",
                      mode === "quick"
                        ? "bg-amber-50 ring-amber-200 text-amber-800"
                        : "bg-white ring-slate-200 text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    Quick
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("full")}
                    className={[
                      "flex-1 px-3 py-2 rounded-xl ring-1 text-sm font-medium transition",
                      mode === "full"
                        ? "bg-sky-50 ring-sky-200 text-sky-800"
                        : "bg-white ring-slate-200 text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    Full
                  </button>
                </div>

                <button
                  type="button"
                  onClick={simulateRun}
                  disabled={!hasDocs || readyCount === 0 || indexing || running}
                  className={[
                    "w-full mt-2 px-4 py-3 rounded-2xl font-semibold transition",
                    !hasDocs || readyCount === 0 || indexing || running
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-sky-600 text-white hover:bg-sky-700",
                  ].join(" ")}
                >
                  {running ? "Running…" : "Start Research Cycle"}
                </button>

                <div className="text-xs text-slate-600">
                  Start button enables after documents are <span className="font-semibold">Ready</span>.
                </div>
              </div>
            </div>
          </Card>

          <Card title="Workspace" right={<Pill tone="neutral">Structured</Pill>}>
            <div className="flex flex-wrap gap-2 mb-4">
              <TabButton active={tab === "knowledge"} onClick={() => setTab("knowledge")}>Knowledge</TabButton>
              <TabButton active={tab === "hypotheses"} onClick={() => setTab("hypotheses")}>Hypotheses</TabButton>
              <TabButton active={tab === "experiments"} onClick={() => setTab("experiments")}>Experiments</TabButton>
              <TabButton active={tab === "results"} onClick={() => setTab("results")}>Results</TabButton>
              <TabButton active={tab === "validation"} onClick={() => setTab("validation")}>Validation</TabButton>
            </div>

            {tab === "knowledge" && (
              <div className="space-y-3">
                {!workspace.knowledge.length ? (
                  <div className="text-sm text-slate-600">Knowledge Agent outputs will appear here.</div>
                ) : (
                  workspace.knowledge.map((k, i) => (
                    <div key={i} className="rounded-2xl bg-sky-50 ring-1 ring-sky-100 p-4">
                      <div className="text-sm font-semibold text-slate-900">{k.claim}</div>
                      <div className="text-xs text-slate-600 mt-1">
                        Source: <span className="font-medium">{k.source}</span> • Confidence: {Math.round((k.confidence || 0) * 100)}%
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === "hypotheses" && (
              <div className="space-y-3">
                {!workspace.hypotheses.length ? (
                  <div className="text-sm text-slate-600">Hypothesis Agent outputs will appear here.</div>
                ) : (
                  workspace.hypotheses.map((h) => (
                    <div key={h.id} className="rounded-2xl bg-white ring-1 ring-slate-200 p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-900">
                          {h.id}: {h.claim}
                        </div>
                        <Pill tone="info">Testable</Pill>
                      </div>
                      <div className="text-sm text-slate-700 mt-2">Prediction: {h.prediction}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === "experiments" && (
              <div className="space-y-3">
                {!workspace.experiments.length ? (
                  <div className="text-sm text-slate-600">Experiment plans will appear here.</div>
                ) : (
                  workspace.experiments.map((e) => (
                    <div key={e.id} className="rounded-2xl bg-white ring-1 ring-slate-200 p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-900">
                          {e.id} • {e.hypothesis}
                        </div>
                        <Pill tone="warn">Plan</Pill>
                      </div>
                      <div className="text-sm text-slate-700 mt-2">Metric: {e.metric}</div>
                      <div className="text-sm text-slate-700">Success: {e.success}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === "results" && (
              <div className="space-y-3">
                {!workspace.results.length ? (
                  <div className="text-sm text-slate-600">Execution + Analysis results will appear here.</div>
                ) : (
                  workspace.results.map((r, i) => (
                    <div key={i} className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-100 p-4">
                      <div className="text-sm font-semibold text-slate-900">Run: {r.run}</div>
                      <div className="text-sm text-slate-700 mt-2">E1: {r.e1}</div>
                      <div className="text-sm text-slate-700">E2: {r.e2}</div>
                      <div className="text-xs text-slate-600 mt-1">{r.notes}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === "validation" && (
              <div className="space-y-3">
                {!workspace.validation.length ? (
                  <div className="text-sm text-slate-600">Validation checks will appear here.</div>
                ) : (
                  workspace.validation.map((v, i) => (
                    <div
                      key={i}
                      className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 flex items-center justify-between"
                    >
                      <div className="text-sm font-semibold text-slate-900">{v.check}</div>
                      <Pill tone={v.status.includes("PASS") ? "good" : "bad"}>{v.status}</Pill>
                    </div>
                  ))
                )}
              </div>
            )}

            {workspace.final && (
              <div className="mt-5 rounded-2xl bg-white ring-1 ring-slate-200 p-4">
                <div className="text-sm font-semibold text-slate-900">Final</div>
                <div className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{workspace.final}</div>
              </div>
            )}
          </Card>
        </div>

        {/* Right */}
        <div className="lg:col-span-5 space-y-6">
          <Card
            title="Agent Timeline"
            right={<Pill tone={running ? "info" : "neutral"}>{running ? "Running" : "Stopped"}</Pill>}
          >
            <Stepper statusMap={agentStatus} active={activeAgent} />
            <div className="mt-4 text-xs text-slate-600">
              Current agent highlights during a run. In backend mode, update statuses via SSE.
            </div>
          </Card>

          <Card
            title="Live Logs"
            right={
              <button
                type="button"
                onClick={() => setLogs([])}
                className="px-3 py-2 rounded-xl text-sm bg-white hover:bg-slate-50 ring-1 ring-slate-200 text-slate-800"
              >
                Clear
              </button>
            }
          >
            <div className="h-[340px] overflow-auto rounded-2xl bg-white ring-1 ring-slate-200 p-4">
              {logs.length === 0 ? (
                <div className="text-sm text-slate-600">Logs will appear here when you index documents or run ARS.</div>
              ) : (
                <div className="space-y-2">
                  {logs.map((l, i) => (
                    <div key={i} className="text-xs">
                      <span className="text-slate-400">{l.ts.slice(11, 19)}</span>
                      <span className="text-slate-300"> • </span>
                      <span className={toneToClass(l.tone)}>{l.msg}</span>
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              )}
            </div>

            <div className="mt-3 text-xs text-slate-600">
              Hook this to your backend SSE stream later (<span className="font-medium">/api/ars/stream</span>).
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}