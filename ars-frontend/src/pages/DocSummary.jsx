import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

function TabBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-2 rounded-xl text-sm font-medium ring-1 transition",
        active ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white ring-cyan-400" : "bg-white/10 text-white ring-white/20 backdrop-blur-sm hover:bg-white/20",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function demoSummary({ docs = [], goal = "" }) {
  const docSummaries = docs.map((d, i) => ({
    id: d.id,
    name: d.name,
    summary: i % 2 === 0
      ? "Defines the problem context, constraints, and intended outputs. Mentions quality/evaluation and typical failure modes."
      : "Describes workflow and system components. Mentions agents, traces/logging, and the need for validation and reproducibility.",
    keyTakeaways: [
      "Constraints and success criteria are implied but not locked.",
      "Focus on structured outputs + auditability.",
      "Need baselines to compare improvements.",
    ],
  }));

  return {
    overview: "The uploaded docs collectively describe an ARS-style system: ingest documents, build a knowledge base, generate hypotheses, design experiments, run/validate, and log everything for auditability.",
    thesis: "Core thesis: A junior research scientist agent should turn raw documents into (1) grounded understanding, (2) testable hypotheses, and (3) a measurable experiment plan — with validations that prevent confident wrong conclusions.",
    docSummaries,
    concepts: ["Groundedness", "Hypothesis testing", "Baselines", "Evaluation", "Ablations", "Reproducibility", "Audit logs"],
    entities: ["ARS", "Knowledge Agent", "Hypothesis Agent", "Experiment Agent", "Validation Agent"],
    keyClaims: [
      { claim: "RAG / retrieval improves factual accuracy for doc-based tasks.", confidence: "medium", verify: "Compare hallucination rate with/without retrieval" },
      { claim: "Validation layer reduces false conclusions and improves robustness.", confidence: "high", verify: "Run ablations removing validation" },
    ],
    evidenceNeeds: [
      "Define a groundedness metric (citation precision/recall or human rating rubric).",
      "Pick baseline(s): single-agent summary, simple RAG, no-validation pipeline.",
      "Define datasets/inputs for experiments and how to sample test cases.",
    ],
    gaps: ["How to manage context windows in long documents?", "How to handle conflicting information across docs?"],
    researchPlaybook: [
      { title: "1. Build a groundedness rubric", desc: "Rate outputs on (a) citation presence, (b) citation accuracy, (c) completeness." },
      { title: "2. Create a test set", desc: "Sample 30–50 queries from docs + hidden ground-truth answers." },
      { title: "3. Run baselines", desc: "No retrieval, simple retrieval, retrieval + validation." },
      { title: "4. Measure & report", desc: "Compare hallucination rates, latency, cost." },
    ],
    opinionFramework: [
      { label: "What does each doc claim?", text: "Summarize the main thesis of each document brieflyto establish a baseline understanding." },
      { label: "What do they agree on?", text: "Identify common patterns, overlapping claims, and areas of consensus." },
      { label: "Where do they conflict?", text: "Note contradictions or differing methodologies." },
      { label: "What's missing?", text: "Identify gaps in the narrative, unanswered questions." },
    ],
    readingPlan: [
      {
        bucket: "To build foundational knowledge",
        items: ["ARS proposal", "Agent workflows", "Validation methodologies"],
      },
      {
        bucket: "To dive deep on risks",
        items: ["Hallucination mitigation", "Evaluation frameworks", "Confound analysis"],
      },
    ],
    nextActions: [
      "De-duplicate claims across all docs",
      "Rate confidence and evidence for each key claim",
      "Map out contradictions and ambiguities",
      "Create a hypothesis list from key claims",
      "Design experiments to test the hypotheses",
    ],
    questions: [
      "How do agents handle conflicting information in source documents?",
      "What's the cost/benefit of multi-turn validation?",
      "Can we auto-rate groundedness without human labels?",
    ],
    goalUsed: goal,
  };
}

export default function DocSummary() {
  const nav = useNavigate();
  const { state } = useLocation();

  const summary = state?.summary;
  const docs = state?.docs || [];
  const goal = state?.goal || "";

  const [tab, setTab] = useState("summary");
  const [loading, setLoading] = useState(false);

  const canGenerate = !!docs.length;

  async function generateRealSummary() {
    setLoading(true);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docIds: docs.map((d) => d.id), goal }),
      });
      if (!res.ok) throw new Error("No backend yet");
      const data = await res.json();
      // Here you would update state with real summary
    } catch {
      // Use demo mode
    } finally {
      setLoading(false);
    }
  }

  if (!summary) {
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
            <Card title="Generate Document Summary" right={<Pill tone="info">Summary</Pill>}>
              <div className="text-sm text-slate-700">
                Upload docs in Dashboard, then generate a structured summary + research guidance + opinion-building framework.
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button
                  className="px-4 py-2 rounded-xl bg-white/10 ring-1 ring-white/20 text-white hover:bg-white/20 backdrop-blur-sm text-sm font-medium transition"
                  onClick={() => nav("/app")}
                >
                  Back to Dashboard
                </button>
                <button
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-600 hover:to-blue-700 shadow-lg text-sm transition disabled:from-slate-400 disabled:to-slate-500"
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
                    <div key={d.id} className="rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm px-3 py-2 hover:bg-white/20 transition">
                      <div className="text-sm font-medium text-white truncate">{d.name}</div>
                      <div className="text-xs text-slate-300">{d.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show demo summary if no real data
  const displaySummary = summary || demoSummary({ docs, goal });

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
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="sticky top-0 z-30 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                📚 Doc Summary <Pill tone="info">Analysis</Pill>
              </div>
              <div className="text-xs text-slate-400">Understand docs → plan research → build opinion</div>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button
                className="px-3 py-2 rounded-xl bg-white/10 ring-1 ring-white/20 text-white hover:bg-white/20 backdrop-blur-sm text-sm font-medium transition"
                onClick={() => nav("/app")}
              >
                Back
              </button>
              <button
                className="px-3 py-2 rounded-xl bg-white/10 ring-1 ring-white/20 text-white hover:bg-white/20 backdrop-blur-sm text-sm font-medium transition"
                onClick={generateRealSummary}
                disabled={loading}
              >
                {loading ? "Refreshing…" : "Regenerate"}
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-600 hover:to-blue-700 shadow-lg text-sm transition"
                onClick={() =>
                  nav("/research", {
                    state: { ...state, summary: displaySummary },
                  })
                }
              >
                Continue →
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

        <div className="max-w-7xl mx-auto px-5 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {tab === "summary" && (
              <>
                <Card title="Overview" right={<Pill>Auto</Pill>}>
                  <div className="text-sm text-slate-700 whitespace-pre-wrap">{displaySummary.overview}</div>
                </Card>
                <Card title="Core Thesis" right={<Pill tone="warn">Central</Pill>}>
                  <div className="text-sm text-slate-700 whitespace-pre-wrap">{displaySummary.thesis}</div>
                </Card>
              </>
            )}
            {tab === "research" && (
              <>
                <Card title="Research Playbook" right={<Pill tone="info">Step-by-step</Pill>}>
                  <div className="space-y-3">
                    {(displaySummary.researchPlaybook || []).map((s, i) => (
                      <div key={i} className="rounded-2xl bg-gradient-to-br from-blue-50/50 to-cyan-50/50 ring-1 ring-blue-200/50 p-4 hover:shadow-lg transition">
                        <div className="text-sm font-semibold text-slate-900">{s.title}</div>
                        <div className="text-sm text-slate-700 mt-1">{s.desc}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}
            {tab === "opinion" && (
              <>
                <Card title="Opinion Builder Framework" right={<Pill tone="info">Write like a scientist</Pill>}>
                  <div className="space-y-3">
                    {(displaySummary.opinionFramework || []).map((o, i) => (
                      <div key={i} className="rounded-2xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 ring-1 ring-purple-200/50 p-4 hover:shadow-lg transition">
                        <div className="text-sm font-semibold text-slate-900">{o.label}</div>
                        <div className="text-sm text-slate-700 mt-2">{o.text}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card title="Topics & Concepts" right={<Pill tone="neutral">{displaySummary.concepts?.length || 0}</Pill>}>
              <div className="flex flex-wrap gap-2">
                {(displaySummary.concepts || []).map((t) => (
                  <Pill key={t} tone="neutral">{t}</Pill>
                ))}
              </div>
            </Card>
            <Card title="Docs Used" right={<Pill tone="info">{docs.length}</Pill>}>
              <div className="space-y-2">
                {docs.map((d) => (
                  <div key={d.id} className="rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm px-3 py-2 hover:bg-white/20 transition">
                    <div className="text-sm font-medium text-white truncate">{d.name}</div>
                    <div className="text-xs text-slate-300">{d.status}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
