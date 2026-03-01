import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * DocSummary.jsx (Junior Research Scientist Mode)
 *
 * Expected (later):
 * POST /api/summarize
 * body: { goal, docIds }
 * returns:
 * {
 *  overview, thesis, docSummaries[], keyClaims[], evidenceNeeds[],
 *  concepts[], entities[], gaps[], researchPlaybook[], opinionFramework[],
 *  readingPlan[], questions[], nextActions[]
 * }
 *
 * For now: works in DEMO mode when backend isn't ready.
 */

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

function TabBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-2 rounded-xl text-sm font-medium ring-1 transition",
        active ? "bg-sky-600 text-white ring-sky-600" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function demoSummary({ docs = [], goal = "" }) {
  // This is a BETTER “Junior Scientist” demo summary.
  // Replace with backend output later.
  const docSummaries = docs.map((d, i) => ({
    id: d.id,
    name: d.name,
    summary:
      i % 2 === 0
        ? "Defines the problem context, constraints, and intended outputs. Mentions quality/evaluation and typical failure modes."
        : "Describes workflow and system components. Mentions agents, traces/logging, and the need for validation and reproducibility.",
    keyTakeaways: [
      "Constraints and success criteria are implied but not locked.",
      "Focus on structured outputs + auditability.",
      "Need baselines to compare improvements.",
    ],
  }));

  return {
    overview:
      "The uploaded docs collectively describe an ARS-style system: ingest documents, build a knowledge base, generate hypotheses, design experiments, run/validate, and log everything for auditability.",
    thesis:
      "Core thesis: A junior research scientist agent should turn raw documents into (1) grounded understanding, (2) testable hypotheses, and (3) a measurable experiment plan — with validations that prevent confident wrong conclusions.",
    docSummaries,
    concepts: ["Groundedness", "Hypothesis testing", "Baselines", "Evaluation", "Ablations", "Reproducibility", "Audit logs"],
    entities: ["ARS", "Knowledge Agent", "Hypothesis Agent", "Experiment Agent", "Validation Agent"],
    keyClaims: [
      { claim: "RAG / retrieval improves factual accuracy for doc-based tasks.", confidence: "medium", verify: "Compare hallucination rate with/without retrieval" },
      { claim: "Validation layer reduces false conclusions and improves robustness.", confidence: "high", verify: "Run ablations removing validation" },
      { claim: "Role-limited agents reduce tool errors and improve planning quality.", confidence: "medium", verify: "Measure tool failure rate + plan quality" },
    ],
    evidenceNeeds: [
      "Define a groundedness metric (citation precision/recall or human rating rubric).",
      "Pick baseline(s): single-agent summary, simple RAG, no-validation pipeline.",
      "Define datasets/inputs for experiments and how to sample test cases.",
    ],
    gaps: [
      "No explicit success metrics are finalized.",
      "No clear evaluation rubric / scoring function is specified.",
      "No data schema definition for tools or experiments is included.",
    ],
    researchPlaybook: [
      {
        title: "Step 1: Extract the research question",
        desc: "Write 1 sentence: 'We want to improve X under constraints Y with metric Z'.",
      },
      {
        title: "Step 2: Build a baseline first",
        desc: "Create a baseline approach (simple RAG or single agent) to compare multi-agent gains.",
      },
      {
        title: "Step 3: Generate hypotheses that can be falsified",
        desc: "Every hypothesis must predict a measurable change in a metric.",
      },
      {
        title: "Step 4: Design experiments + ablations",
        desc: "Test each hypothesis, and do ablations (remove a component and measure drop).",
      },
      {
        title: "Step 5: Validate & stress test",
        desc: "Check leakage, adversarial docs, contradictions, and reproducibility.",
      },
      {
        title: "Step 6: Build your opinion from evidence",
        desc: "Your opinion should be: claim + evidence + limitations + next test.",
      },
    ],
    opinionFramework: [
      {
        label: "Claim",
        text: "What do you believe is true based on docs + experiments?",
      },
      {
        label: "Evidence",
        text: "Which results/citations support it? What baseline did you beat?",
      },
      {
        label: "Counter-evidence",
        text: "When does it fail? What contradicts it?",
      },
      {
        label: "Limitations",
        text: "Data size, evaluation bias, tool limits, prompt sensitivity, etc.",
      },
      {
        label: "Next test",
        text: "One experiment you will run next to increase confidence.",
      },
    ],
    questions: [
      "What exact metric defines success for this project (and why)?",
      "What is the minimal baseline that must be beaten?",
      "Which agent step causes the most errors (Knowledge/Hypothesis/Experiment/Validation)?",
      "How do we detect hallucinations automatically?",
      "How do we prove reproducibility of results?",
    ],
    readingPlan: [
      { bucket: "Foundations", items: ["How to form hypotheses", "Experimental design basics", "Evaluation metrics & rubrics"] },
      { bucket: "LLM Systems", items: ["RAG basics", "Tool use + agent orchestration", "Safety/validation patterns"] },
      { bucket: "Project-Specific", items: ["Your domain docs", "User constraints", "Failure modes in your pipeline"] },
    ],
    nextActions: [
      "Lock 3 metrics: groundedness, robustness, cost/time.",
      "Implement a baseline (single-agent or simple RAG).",
      "Create validation checklist and an ablation plan.",
    ],
    goalUsed: goal,
  };
}

export default function DocSummary() {
  const nav = useNavigate();
  const { state } = useLocation();

  const docs = state?.docs || [];
  const goal = state?.goal || "";
  const mode = state?.mode || "full";

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(state?.summary || null);
  const [tab, setTab] = useState("summary"); // summary | research | opinion

  const docIds = useMemo(() => docs.map((d) => d.id).filter(Boolean), [docs]);
  const canGenerate = docs.length > 0;

  async function generateRealSummary() {
    if (!canGenerate || loading) return;
    setLoading(true);

    // Try backend first; fallback to demo
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, docIds, mode }),
      });

      if (!res.ok) throw new Error("No backend yet");
      const data = await res.json();
      setSummary(data);
    } catch {
      setSummary(demoSummary({ docs, goal }));
    } finally {
      setLoading(false);
    }
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-white p-8">
        <div className="max-w-3xl mx-auto">
          <Card title="Generate Document Summary" right={<Pill tone="info">Junior Scientist</Pill>}>
            <div className="text-sm text-slate-700">
              Upload docs in Dashboard, then generate a structured summary + research guidance + opinion-building framework.
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                className="px-4 py-2 rounded-xl bg-white ring-1 ring-slate-200 text-slate-800 hover:bg-slate-50 text-sm font-medium"
                onClick={() => nav("/app")}
              >
                Back to Dashboard
              </button>

              <button
                className="px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-700 text-sm disabled:bg-slate-200 disabled:text-slate-500"
                onClick={generateRealSummary}
                disabled={!canGenerate || loading}
              >
                {loading ? "Generating…" : "Generate Summary"}
              </button>
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold text-slate-700">Docs detected</div>
              <div className="mt-2 space-y-2">
                {(docs || []).map((d) => (
                  <div key={d.id} className="rounded-xl bg-white ring-1 ring-slate-200 px-3 py-2">
                    <div className="text-sm font-medium text-slate-900 truncate">{d.name}</div>
                    <div className="text-xs text-slate-500">{d.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-white">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white/70 backdrop-blur border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              Doc Summary <Pill tone="info">Junior Scientist</Pill>
            </div>
            <div className="text-xs text-slate-600">Understand docs → plan research → build opinion</div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              className="px-3 py-2 rounded-xl bg-white ring-1 ring-slate-200 text-slate-800 hover:bg-slate-50 text-sm font-medium"
              onClick={() => nav("/app")}
            >
              Back
            </button>

            <button
              className="px-3 py-2 rounded-xl bg-white ring-1 ring-slate-200 text-slate-800 hover:bg-slate-50 text-sm font-medium"
              onClick={generateRealSummary}
              disabled={loading}
            >
              {loading ? "Refreshing…" : "Regenerate"}
            </button>

            <button
              className="px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-700 text-sm"
              onClick={() =>
                nav("/research", {
                  state: {
                    ...state,
                    summary,
                  },
                })
              }
            >
              Continue to Research →
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 pb-4 flex flex-wrap gap-2">
          <TabBtn active={tab === "summary"} onClick={() => setTab("summary")}>
            Summary
          </TabBtn>
          <TabBtn active={tab === "research"} onClick={() => setTab("research")}>
            How to Research
          </TabBtn>
          <TabBtn active={tab === "opinion"} onClick={() => setTab("opinion")}>
            Build Your Opinion
          </TabBtn>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-5 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main */}
        <div className="lg:col-span-8 space-y-6">
          {tab === "summary" && (
            <>
              <Card title="Overview" right={<Pill>Auto</Pill>}>
                <div className="text-sm text-slate-800 whitespace-pre-wrap">{summary.overview}</div>
              </Card>

              <Card title="Core Thesis (Main Area)" right={<Pill tone="warn">Central</Pill>}>
                <div className="text-sm text-slate-800 whitespace-pre-wrap">{summary.thesis}</div>
              </Card>

              <Card title="Doc-wise Summary" right={<Pill tone="neutral">{summary.docSummaries?.length || 0} docs</Pill>}>
                <div className="space-y-3">
                  {(summary.docSummaries || []).map((d) => (
                    <div key={d.id} className="rounded-2xl bg-white ring-1 ring-slate-200 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-slate-900 truncate">{d.name}</div>
                        <Pill tone="info">Summary</Pill>
                      </div>
                      <div className="text-sm text-slate-700 mt-2">{d.summary}</div>
                      {!!d.keyTakeaways?.length && (
                        <ul className="mt-3 list-disc pl-5 text-sm text-slate-700 space-y-1">
                          {d.keyTakeaways.map((k, i) => (
                            <li key={i}>{k}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Key Claims to Verify" right={<Pill tone="warn">Don’t trust blindly</Pill>}>
                <div className="space-y-3">
                  {(summary.keyClaims || []).map((c, i) => (
                    <div key={i} className="rounded-2xl bg-amber-50 ring-1 ring-amber-100 p-4">
                      <div className="text-sm font-semibold text-slate-900">{c.claim}</div>
                      <div className="text-xs text-slate-700 mt-1">
                        Confidence: <span className="font-semibold">{c.confidence}</span>
                      </div>
                      <div className="text-sm text-slate-700 mt-2">
                        How to verify: <span className="font-medium">{c.verify}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Gaps / Missing Info" right={<Pill tone="bad">Important</Pill>}>
                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-800">
                  {(summary.gaps || []).map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </Card>
            </>
          )}

          {tab === "research" && (
            <>
              <Card title="Research Playbook" right={<Pill tone="info">Step-by-step</Pill>}>
                <div className="space-y-3">
                  {(summary.researchPlaybook || []).map((s, i) => (
                    <div key={i} className="rounded-2xl bg-sky-50 ring-1 ring-sky-100 p-4">
                      <div className="text-sm font-semibold text-slate-900">{s.title}</div>
                      <div className="text-sm text-slate-700 mt-1">{s.desc}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Evidence You Must Collect" right={<Pill tone="warn">Before conclusions</Pill>}>
                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-800">
                  {(summary.evidenceNeeds || []).map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </Card>

              <Card title="Research Questions" right={<Pill tone="neutral">Ask this</Pill>}>
                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-800">
                  {(summary.questions || []).map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </Card>
            </>
          )}

          {tab === "opinion" && (
            <>
              <Card title="Opinion Builder Framework" right={<Pill tone="info">Write like a scientist</Pill>}>
                <div className="space-y-3">
                  {(summary.opinionFramework || []).map((o, i) => (
                    <div key={i} className="rounded-2xl bg-white ring-1 ring-slate-200 p-4">
                      <div className="text-sm font-semibold text-slate-900">{o.label}</div>
                      <div className="text-sm text-slate-700 mt-2">{o.text}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="What to read next" right={<Pill tone="neutral">Reading Plan</Pill>}>
                <div className="space-y-3">
                  {(summary.readingPlan || []).map((b, i) => (
                    <div key={i} className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
                      <div className="text-sm font-semibold text-slate-900">{b.bucket}</div>
                      <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
                        {(b.items || []).map((it, j) => (
                          <li key={j}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Action checklist" right={<Pill tone="good">Next</Pill>}>
                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-800">
                  {(summary.nextActions || []).map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </Card>
            </>
          )}
        </div>

        {/* Side */}
        <div className="lg:col-span-4 space-y-6">
          <Card title="Topics & Concepts" right={<Pill tone="neutral">{summary.concepts?.length || 0}</Pill>}>
            <div className="flex flex-wrap gap-2">
              {(summary.concepts || []).map((t) => (
                <Pill key={t} tone="neutral">{t}</Pill>
              ))}
            </div>
          </Card>

          <Card title="Entities" right={<Pill tone="neutral">{summary.entities?.length || 0}</Pill>}>
            <div className="flex flex-wrap gap-2">
              {(summary.entities || []).map((e) => (
                <Pill key={e} tone="neutral">{e}</Pill>
              ))}
            </div>
          </Card>

          <Card title="Docs Used" right={<Pill tone="info">{docs.length}</Pill>}>
            <div className="space-y-2">
              {docs.map((d) => (
                <div key={d.id} className="rounded-xl bg-white ring-1 ring-slate-200 px-3 py-2">
                  <div className="text-sm font-medium text-slate-900 truncate">{d.name}</div>
                  <div className="text-xs text-slate-500">{d.status}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Goal" right={<Pill tone="neutral">From Dashboard</Pill>}>
            <div className="text-sm text-slate-800 whitespace-pre-wrap">{summary.goalUsed || goal || "—"}</div>
          </Card>
        </div>
      </div>
    </div>
  );
}