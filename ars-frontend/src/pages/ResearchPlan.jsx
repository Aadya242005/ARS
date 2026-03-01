import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dashboardImg from "../assets/dashboard.png"; // ✅ put image at: src/assets/dashboard.png

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
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
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

// simple styled heading used in several cards
function SectionTitle({ children }) {
  return <div className="text-sm font-semibold text-slate-800 mb-2">{children}</div>;
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
    why:
      "If you cannot measure success, you can’t claim improvement. This direction converts your thesis into measurable metrics and creates baselines to beat.",
    outcomes: [
      "Metrics rubric (groundedness + robustness + cost/time)",
      "Baselines for comparison (single-agent, simple RAG, etc.)",
      "Reusable test set for regression checks",
    ],
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
        steps:
          "Create a 30–50 query set from docs → run baseline (no retrieval) → run retrieval version → compare groundedness & hallucination rate.",
        output: "Groundedness report + failure examples",
      },
      {
        id: "E-E2",
        steps:
          "Run pipeline with Validation Agent ON vs OFF on the same queries → compare contradictions + self-consistency checks.",
        output: "Validation impact report + error taxonomy",
      },
    ],
    risks: [
      "Metric bias: citations can be present but weak.",
      "Test set leakage if prompts overlap too much with training/examples.",
    ],
    deliverables: ["metrics.json", "baseline_results.csv", "evaluation_report.md"],
  });

  if (gaps.length) {
    directions.push({
      id: "direction_gaps",
      title: "Resolve missing info & define data schema",
      why:
        "Your summary shows missing/unclear details. Without schema and explicit definitions, agents hallucinate or tool calls fail.",
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
          steps:
            "Add schema validator step → run same tasks with/without validator → count invalid outputs + retries.",
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
      why:
        "Docs may contain claims that sound right. Research requires verification. This direction converts claims into controlled experiments and updates confidence based on evidence.",
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
          steps:
            "For each claim: define baseline + intervention → run 20–30 test cases → report metric deltas + update confidence.",
          output: "Claim verification table + confidence updates",
        },
      ],
      risks: ["Confounds: changing multiple variables at once hides causality."],
      deliverables: ["claims_matrix.md", "ablation_results.csv", "confidence_updates.json"],
    });
  }

  if (evidenceNeeds.length) {
    directions.push({
      id: "direction_evidence",
      title: "Collect missing evidence (before conclusions)",
      why:
        "Your summary flags evidence gaps. Credible research needs evidence linked to claims and tracked in a checklist.",
      outcomes: ["Evidence checklist + collection plan", "Support map (claim→source)", "Lower uncertainty"],
      hypotheses: [
        {
          id: "H-EN1",
          claim: "An evidence checklist improves answer quality (less vague, more supported).",
          metric: "groundedness + completeness rating",
          success: "+10% or more",
        },
      ],
      experiments: [
        {
          id: "E-EN1",
          steps:
            "Create evidence checklist → run with checklist ON vs OFF → compare completeness and groundedness scores.",
          output: "Before/after comparison report",
        },
      ],
      risks: ["Needs a consistent rubric to avoid subjective scoring."],
      deliverables: ["evidence_checklist.md", "support_map.json", "before_after_report.md"],
    });
  }

  const nextSteps = [
    "Pick ONE direction and lock success metrics (3 metrics max).",
    "Run Quick cycle first (Knowledge → Hypothesis → Experiment).",
    "Do ablations to prove causality (remove one component).",
    "Then run full Execution/Validation and record traces.",
  ];

  const opinionMini = [
    "Write 1 claim you believe (based on docs + results).",
    "Attach evidence: citations + metrics (baseline vs improved).",
    "State one counterexample / failure mode.",
    "Write limitation + next experiment to increase confidence.",
  ];

  return { thesis, concepts, nextSteps, directions, opinionMini, goalUsed: goal };
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
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-white p-8">
        <div className="max-w-3xl mx-auto">
          <Card title="No research context found" right={<Pill tone="warn">Missing</Pill>}>
            <div className="text-sm text-slate-700">Go to Dashboard → Generate Summary → then open Research.</div>
            <button
              className="mt-4 px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-700"
              onClick={() => nav("/app")}
            >
              Back to Dashboard
            </button>
          </Card>
        </div>
      </div>
    );
  }

  const current = plan.directions.find((d) => d.id === selected) || plan.directions[0];

  function sendDirectionToDashboard() {
    const newGoal = `Research direction: ${current.title}

Why:
${current.why}

Thesis:
${clampText(plan.thesis, 260)}

Deliverables:
- ${current.deliverables.join("\n- ")}

Start with:
1) Define metrics + baseline
2) Run quick cycle
3) Validate + log everything`;
    nav("/app", { state: { ...state, goal: newGoal } });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-white">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white/70 backdrop-blur border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              Research Suggestions <Pill tone="info">Junior Scientist</Pill>
            </div>
            <div className="text-xs text-slate-600">Turn summary → hypotheses → experiments → dashboard run</div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              className="px-3 py-2 rounded-xl bg-white ring-1 ring-slate-200 text-slate-800 hover:bg-slate-50 text-sm font-medium"
              onClick={() => nav("/summary", { state })}
            >
              Back
            </button>

            <button
              className="px-3 py-2 rounded-xl bg-white ring-1 ring-slate-200 text-slate-800 hover:bg-slate-50 text-sm font-medium"
              onClick={sendDirectionToDashboard}
            >
              Send to Dashboard
            </button>

            <button
              className="px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-700 text-sm"
              onClick={() => nav("/app")}
            >
              Go to Dashboard (Run)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: directions */}
        <div className="lg:col-span-4 space-y-6">
          <Card title="Research Directions" right={<Pill tone="info">{plan.directions.length}</Pill>}>
            <div className="space-y-2">
              {plan.directions.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelected(d.id)}
                  className={[
                    "w-full text-left rounded-2xl ring-1 px-4 py-3 transition",
                    selected === d.id ? "bg-sky-50 ring-sky-200" : "bg-white ring-slate-200 hover:bg-slate-50",
                  ].join(" ")}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-slate-900">{d.title}</div>
                    <Pill tone={selected === d.id ? "info" : "neutral"}>{selected === d.id ? "Selected" : "Pick"}</Pill>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">{clampText(d.why, 135)}</div>
                </button>
              ))}
            </div>
          </Card>

          <Card title="Research Lens (Opinion Builder)" right={<Pill tone="neutral">Method</Pill>}>
            <SectionTitle>How to build your own opinion</SectionTitle>
            <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm text-slate-800">
              {plan.opinionMini.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ol>
          </Card>
        </div>

        {/* Middle: details */}
        <div className="lg:col-span-5 space-y-6">
          <Card title="Why this direction?" right={<Pill tone="warn">Focus</Pill>}>
            <div className="text-sm text-slate-800">{current.why}</div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {current.outcomes.map((o, i) => (
                <div key={i} className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
                  <div className="text-xs font-semibold text-slate-700">Outcome</div>
                  <div className="text-sm text-slate-900 mt-1">{o}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Hypotheses to test" right={<Pill tone="info">Testable</Pill>}>
            <div className="space-y-3">
              {current.hypotheses.map((h) => (
                <div key={h.id} className="rounded-2xl bg-white ring-1 ring-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-slate-900">
                      {h.id}: {h.claim}
                    </div>
                    <Pill tone="info">{h.success}</Pill>
                  </div>
                  <div className="text-sm text-slate-700 mt-2">Metric: <span className="font-medium">{h.metric}</span></div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Experiments" right={<Pill tone="good">Actionable</Pill>}>
            <div className="space-y-3">
              {current.experiments.map((e) => (
                <div key={e.id} className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-100 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-slate-900">{e.id}</div>
                    <Pill tone="good">Do</Pill>
                  </div>
                  <div className="text-sm text-slate-700 mt-2">
                    <span className="font-semibold">Steps:</span> {e.steps}
                  </div>
                  <div className="text-sm text-slate-700 mt-1">
                    <span className="font-semibold">Output:</span> {e.output}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Risks / Confounders" right={<Pill tone="warn">Be careful</Pill>}>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-800">
              {current.risks.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </Card>

          <Card title="Next steps" right={<Pill tone="neutral">Checklist</Pill>}>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-800">
              {plan.nextSteps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </Card>
        </div>

        {/* Right: image + context */}
        <div className="lg:col-span-3 space-y-6">
          <Card title="Dashboard Preview" right={<Pill tone="neutral">Reference</Pill>}>
            <div className="rounded-2xl overflow-hidden ring-1 ring-slate-200 bg-white">
              <img
                src={dashboardImg}
                alt="Dashboard preview"
                className="w-full h-auto object-cover transition duration-300 hover:scale-[1.02]"
              />
            </div>
            <div className="mt-3 text-xs text-slate-600">
              Use this as your visual reference while refining the agent workflow and UI wiring.
            </div>
          </Card>

          <Card title="Context" right={<Pill tone="neutral">Docs</Pill>}>
            <SectionTitle>Goal (from Summary)</SectionTitle>
            <div className="mt-2 text-sm text-slate-800 whitespace-pre-wrap">{plan.goalUsed || goal || "—"}</div>

            <div className="mt-5">
              <SectionTitle>Docs used</SectionTitle>
              <div className="mt-2 space-y-2">
                {docs.map((d) => (
                  <div key={d.id} className="rounded-xl bg-white ring-1 ring-slate-200 px-3 py-2">
                    <div className="text-sm font-medium text-slate-900 truncate">{d.name}</div>
                    <div className="text-xs text-slate-500">{d.status}</div>
                  </div>
                ))}
              </div>
            </div>

            {!!plan.concepts?.length && (
              <div className="mt-5">
                <SectionTitle>Concept tags</SectionTitle>
                <div className="mt-2 flex flex-wrap gap-2">
                  {plan.concepts.slice(0, 10).map((c) => (
                    <Pill key={c} tone="neutral">{c}</Pill>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}