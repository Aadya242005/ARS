import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dashboardImg from "../assets/dashboard.png";
import bgImage from "../assets/bg11.jpg";

function Pill({ tone = "info", children }) {
  const cls =
    tone === "good"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : tone === "warn"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : tone === "bad"
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : tone === "neutral"
      ? "bg-slate-50 text-slate-700 ring-slate-200"
      : "bg-sky-50 text-sky-700 ring-sky-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ring-1 ${cls}`}>
      {children}
    </span>
  );
}

function Card({ title, right, children }) {
  return (
    <div className="rounded-2xl bg-white/95 backdrop-blur-sm shadow-xl ring-1 ring-white/20 hover:shadow-2xl transition">
      <div className="px-6 py-4 border-b border-slate-200/40 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {right}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function clampText(s = "", n = 160) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n).trim() + "…" : s;
}

function SectionTitle({ children }) {
  return <div className="text-sm font-semibold text-slate-900 mb-2">{children}</div>;
}

function buildRealisticPlan(summary, goal) {
  const thesis = summary?.thesis || summary?.overview || "";
  const gaps = summary?.gaps || [];
  const evidenceNeeds = summary?.evidenceNeeds || [];
  const keyClaims = summary?.keyClaims || [];
  const concepts = summary?.concepts || [];

  const directions = [];

  directions.push({
    id: "direction_eval",
    title: "Lock evaluation metrics + baselines",
    why: "If you cannot measure success, you can't claim improvement. This direction converts your thesis into measurable metrics and creates baselines to beat.",
    outcomes: ["Metrics rubric (groundedness + robustness + cost/time)", "Baselines for comparison (single-agent, simple RAG, etc.)", "Reusable test set for regression checks"],
    hypotheses: [
      {
        id: "H-E1",
        claim: "Retrieval grounding improves factual accuracy for doc-based tasks.",
        metric: "groundedness score / citation precision",
        success: "+10% or more",
      },
      {
        id: "H-E2",
        claim: "Validation stage reduces confident-but-wrong conclusions.",
        metric: "robustness pass rate / contradiction detection",
        success: "+15% or more",
      },
    ],
    experiments: [
      {
        id: "E-E1",
        steps: "Create a 30–50 query set from docs → run baseline (no retrieval) → run retrieval version → compare groundedness & hallucination rate.",
        output: "Groundedness report + failure examples",
      },
      {
        id: "E-E2",
        steps: "Run pipeline with Validation Agent ON vs OFF on the same queries → compare contradictions + self-consistency checks.",
        output: "Validation impact report + error taxonomy",
      },
    ],
    risks: ["Metric bias: citations can be present but weak.", "Test set leakage if prompts overlap too much with training/examples."],
    deliverables: ["metrics.json", "baseline_results.csv", "evaluation_report.md"],
  });

  if (gaps.length) {
    directions.push({
      id: "direction_gaps",
      title: "Resolve missing info & define data schema",
      why: "Your summary shows missing/unclear details. Without schema and explicit definitions, agents hallucinate or tool calls fail.",
      outcomes: ["Input/output schema for the pipeline", "Explicit constraints & assumptions", "Lower tool/format errors"],
      hypotheses: [
        {
          id: "H-G1",
          claim: "Strict JSON schema + output validation reduces tool failures.",
          metric: "invalid JSON rate / tool failure rate",
          success: "-30% or more",
        },
      ],
      experiments: [
        {
          id: "E-G1",
          steps: "Add schema validator step → run same tasks with/without validator → count invalid outputs + retries.",
          output: "Reliability report + schema docs",
        },
      ],
      risks: ["Over-constraining schema may reduce creativity (but improves reliability)."],
      deliverables: ["schema.json", "tool_contracts.md", "error_rate_comparison.md"],
    });
  }

  if (keyClaims.length) {
    directions.push({
      id: "direction_claims",
      title: "Verify core claims (turn them into falsifiable tests)",
      why: "Docs may contain claims that sound right. Research requires verification. This direction converts claims into controlled experiments and updates confidence based on evidence.",
      outcomes: ["Claim → hypothesis mapping", "Controlled experiments", "Confidence updates"],
      hypotheses: keyClaims.slice(0, 3).map((c, i) => ({
        id: `H-C${i + 1}`,
        claim: c.claim,
        metric: "task score / error rate / groundedness",
        success: c.confidence === "high" ? "Should replicate strongly" : "Should improve measurably",
      })),
      experiments: [
        {
          id: "E-C1",
          steps: "For each claim: define baseline + intervention → run 20–30 test cases → report metric deltas + update confidence.",
          output: "Claim verification table + confidence updates",
        },
      ],
      risks: ["Confounds: changing multiple variables at once hides causality."],
      deliverables: ["claims_matrix.md", "ablation_results.csv", "confidence_updates.json"],
    });
  }

  return {
    directions,
    thesis,
    gaps,
    evidenceNeeds,
    concepts,
    nextSteps: ["Review directions above", "Pick one and lock the hypothesis / experiment", "Run & iterate"],
    goalUsed: goal,
  };
}

export default function ResearchPlan() {
  const nav = useNavigate();
  const { state } = useLocation();

  const summary = state?.summary;
  const docs = state?.docs || [];
  const goal = state?.goal || "";

  const plan = useMemo(() => (summary ? buildRealisticPlan(summary, goal) : null), [summary, goal]);
  const [selected, setSelected] = useState("direction_eval");

  if (!summary || !plan) {
    return (
      <div 
        className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 p-8">
          <div className="max-w-3xl mx-auto">
            <Card title="No research context found" right={<Pill tone="warn">Missing</Pill>}>
              <div className="text-sm text-slate-700">Go to Dashboard → Generate Summary → then open Research.</div>
              <button
                className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-600 hover:to-blue-700 shadow-lg transition"
                onClick={() => nav("/app")}
              >
                Back to Dashboard
              </button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const current = plan.directions.find((d) => d.id === selected) || plan.directions[0];

  function sendDirectionToDashboard() {
    const newGoal = `Research direction: ${current.title}\n\nWhy:\n${current.why}\n\nThesis:\n${clampText(plan.thesis, 260)}\n\nDeliverables:\n${current.deliverables.join(", ")}`;
    nav("/app", { state: { ...state, goal: newGoal } });
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      
      <div className="relative z-10">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                🧪 Research Suggestions <Pill tone="info">Plan</Pill>
              </div>
              <div className="text-xs text-slate-400">Hypotheses → Experiments → Dashboard</div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button
                className="px-3 py-2 rounded-xl bg-white/10 ring-1 ring-white/20 text-white hover:bg-white/20 backdrop-blur-sm text-sm font-medium transition"
                onClick={() => nav("/summary", { state })}
              >
                Back
              </button>

              <button
                className="px-3 py-2 rounded-xl bg-white/10 ring-1 ring-white/20 text-white hover:bg-white/20 backdrop-blur-sm text-sm font-medium transition"
                onClick={sendDirectionToDashboard}
              >
                Send Plan
              </button>

              <button
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-600 hover:to-blue-700 shadow-lg text-sm transition"
                onClick={() => nav("/app")}
              >
                Go & Run
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Directions */}
          <div className="lg:col-span-3 space-y-2">
            <div className="text-xs font-semibold text-white/60 uppercase">Directions</div>
            <div className="space-y-2">
              {plan.directions.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelected(d.id)}
                  className={[
                    "w-full text-left rounded-2xl ring-1 px-4 py-3 transition",
                    selected === d.id 
                      ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 ring-cyan-400/50 text-white" 
                      : "bg-white/80 ring-white/20 hover:bg-white/90 text-slate-900",
                  ].join(" ")}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{d.title}</div>
                    <Pill tone={selected === d.id ? "info" : "neutral"}>{selected === d.id ? "Selected" : "Pick"}</Pill>
                  </div>
                  <div className="text-xs mt-1 opacity-75">{clampText(d.why, 135)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Middle: Details */}
          <div className="lg:col-span-5 space-y-6">
            <Card title="Hypotheses to test" right={<Pill tone="info">{current.hypotheses.length}</Pill>}>
              <div className="space-y-3">
                {current.hypotheses.map((h) => (
                  <div key={h.id} className="rounded-2xl bg-gradient-to-br from-blue-50/50 to-cyan-50/50 ring-1 ring-blue-200/50 p-4 hover:shadow-lg transition">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-slate-900">
                        {h.id}: {h.claim}
                      </div>
                      <Pill tone="info">{h.success}</Pill>
                    </div>
                    <div className="text-sm text-slate-700 mt-2">Metric: <span className="font-medium text-slate-900">{h.metric}</span></div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Experiments" right={<Pill tone="good">{current.experiments.length}</Pill>}>
              <div className="space-y-3">
                {current.experiments.map((e) => (
                  <div key={e.id} className="rounded-2xl bg-gradient-to-br from-emerald-50/50 to-green-50/50 ring-1 ring-emerald-200/50 p-4 hover:shadow-lg transition">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-slate-900">{e.id}</div>
                      <Pill tone="good">Do</Pill>
                    </div>
                    <div className="text-sm text-slate-700 mt-2">
                      <span className="font-semibold text-slate-900">Steps:</span> {e.steps}
                    </div>
                    <div className="text-sm text-slate-700 mt-1">
                      <span className="font-semibold text-slate-900">Output:</span> {e.output}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Risks / Confounders" right={<Pill tone="warn">Be careful</Pill>}>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
                {current.risks.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Right: Context */}
          <div className="lg:col-span-4 space-y-6">
            <Card title="Visual Reference" right={<Pill tone="neutral">Layout</Pill>}>
              <div className="rounded-2xl overflow-hidden ring-1 ring-white/20 bg-white/5 backdrop-blur-sm hover:ring-white/40 transition">
                <img
                  src={dashboardImg}
                  alt="Dashboard preview"
                  className="w-full h-auto object-cover transition duration-300 hover:scale-[1.02]"
                />
              </div>
              <div className="mt-3 text-xs text-slate-300">
                Visual reference for agent configuration and UI wiring.
              </div>
            </Card>

            <Card title="Docs Used" right={<Pill tone="info">{docs.length}</Pill>}>
              <div className="mt-2 space-y-2">
                {docs.map((d) => (
                  <div key={d.id} className="rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm px-3 py-2 hover:bg-white/20 transition">
                    <div className="text-sm font-medium text-white truncate">{d.name}</div>
                    <div className="text-xs text-slate-300">{d.status}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Goal" right={<Pill tone="neutral">From Summary</Pill>}>
              <div className="text-sm text-slate-700 whitespace-pre-wrap">{plan.goalUsed || goal || "—"}</div>
            </Card>

            {!!plan.concepts?.length && (
              <Card title="Concept Tags" right={<Pill tone="neutral">{plan.concepts.length}</Pill>}>
                <div className="flex flex-wrap gap-2">
                  {plan.concepts.slice(0, 10).map((c) => (
                    <Pill key={c} tone="neutral">{c}</Pill>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
