import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import bgImage from "../assets/bg11.jpg";

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
    <div className="rounded-2xl bg-white/95 backdrop-blur-sm shadow-xl ring-1 ring-white/20 hover:shadow-2xl transition">
      <div className="px-6 py-4 border-b border-slate-200/40 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {right}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function SearchResearch() {
  const nav = useNavigate();
  const logEndRef = useRef(null);

  const [topic, setTopic] = useState("");
  const [searching, setSearching] = useState(false);
  const [logs, setLogs] = useState([]);

  const [research, setResearch] = useState({
    topic: "",
    knowledge: [],
    hypotheses: [],
    experiments: [],
    results: [],
    validation: [],
    learning: {},
    final: "",
  });

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  function pushLog(msg, tone = "info") {
    setLogs((p) => [...p, { ts: new Date().toISOString(), tone, msg }]);
  }

  function toneToClass(tone) {
    if (tone === "good") return "text-emerald-700";
    if (tone === "warn") return "text-amber-700";
    if (tone === "bad") return "text-rose-700";
    return "text-slate-700";
  }

  async function startResearch() {
    if (!topic.trim() || searching) return;

    const cleanTopic = topic.trim();

    setSearching(true);
    setLogs([]);
    setResearch({
      topic: cleanTopic,
      knowledge: [],
      hypotheses: [],
      experiments: [],
      results: [],
      validation: [],
      learning: {},
      final: "",
    });

    pushLog(`Starting agentic research on: "${cleanTopic}"`, "info");

    try {
      pushLog("Initiating backend research pipeline…", "info");

      const startRes = await fetch("http://127.0.0.1:5050/api/research/topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: cleanTopic, mode: "full" }),
      });

      const data = await startRes.json();

      if (!startRes.ok) {
        throw new Error(data.detail || `Backend error: ${startRes.status} ${startRes.statusText}`);
      }

      pushLog("✓ Backend research response received", "good");
      pushLog("Processing research insights…", "info");

      setResearch({
        topic: data.topic || cleanTopic,
        knowledge: [],
        hypotheses: [],
        experiments: [],
        results: [],
        validation: [],
        learning: {
          keyLearnings: [
            "Topic research response generated successfully.",
            "Structured research summary was created by backend.",
          ],
          bestPractices: [
            "Use academic sources for deeper validation.",
            "Cross-check findings with recent publications.",
          ],
          nextSteps: [
            "Break this topic into sub-problems.",
            "Collect sources, papers, and datasets.",
            "Convert summary into formal research document.",
          ],
          risks: [
            "LLM-generated summary may need factual verification.",
            "Further domain-specific evidence may be required.",
          ],
        },
        final: data.reply || "No research summary returned from backend.",
      });

      pushLog("✓ Research summary generated", "good");
      pushLog("✅ All research insights ready for review", "good");
      setActiveTab("overview");
    } catch (e) {
      pushLog(`❌ Error: ${e.message}`, "bad");
      pushLog("Check backend logs on port 5050 for exact error details.", "warn");
    } finally {
      setSearching(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !searching) {
      startResearch();
    }
  }

  function generateResearchSummary() {
    const { topic, knowledge, hypotheses, experiments, results, validation, learning, final } = research;

    let summary = `RESEARCH SUMMARY: ${topic.toUpperCase()}\n`;
    summary += `Generated on: ${new Date().toLocaleDateString()}\n\n`;

    summary += `EXECUTIVE SUMMARY\n`;
    summary += `This research investigated ${topic} using an automated research workflow. `;
    summary += `The current system generated a structured topic-level summary and planning response. `;
    summary += `Knowledge items: ${knowledge.length}, Hypotheses: ${hypotheses.length}, Experiments: ${experiments.length}, Validations: ${validation.length}.\n\n`;

    summary += `RESEARCH OUTPUT\n`;
    summary += `${final}\n\n`;

    summary += `KEY FINDINGS\n`;
    if (learning.keyLearnings?.length) {
      learning.keyLearnings.forEach((item, i) => {
        summary += `${i + 1}. ${item}\n`;
      });
    } else {
      summary += `1. Initial topic-level summary generated.\n`;
      summary += `2. More agent stages can be integrated later.\n`;
    }

    summary += `\nBEST PRACTICES\n`;
    if (learning.bestPractices?.length) {
      learning.bestPractices.forEach((item) => {
        summary += `• ${item}\n`;
      });
    }

    summary += `\nNEXT STEPS\n`;
    if (learning.nextSteps?.length) {
      learning.nextSteps.forEach((item, i) => {
        summary += `${i + 1}. ${item}\n`;
      });
    }

    summary += `\nRISKS\n`;
    if (learning.risks?.length) {
      learning.risks.forEach((item) => {
        summary += `• ${item}\n`;
      });
    }

    return summary;
  }

  function downloadSummaryPDF() {
    try {
      const summary = generateResearchSummary();
      const pdf = new jsPDF();

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);

      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Research Summary: ${research.topic}`, 15, 20);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 15, 30);

      const lines = pdf.splitTextToSize(summary, 180);
      let y = 45;
      let pageCount = 1;

      lines.forEach((line) => {
        if (y > 270) {
          pdf.addPage();
          pageCount++;
          pdf.setFontSize(10);
          pdf.text(`Page ${pageCount}`, 15, 15);
          y = 25;
        }
        pdf.text(line, 15, y);
        y += 5;
      });

      if (y > 250) {
        pdf.addPage();
        y = 20;
      }

      y += 10;
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("RECOMMENDED RESEARCH SOURCES", 15, y);
      y += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const sources = [
        "• Wikipedia - " + research.topic,
        "• Google Scholar - Academic papers on " + research.topic,
        "• News sources: BBC, Reuters, The Guardian",
        "• ResearchGate - Latest publications",
        "• arXiv - Preprint papers",
        "• PubMed - Medical/scientific research",
        "• IEEE Xplore - Technical papers",
        "• JSTOR - Academic journals",
      ];

      sources.forEach((source) => {
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(source, 15, y);
        y += 7;
      });

      const filename = `${research.topic.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_research_summary.pdf`;
      pdf.save(filename);

      pushLog(`PDF downloaded: ${filename}`, "good");
    } catch (error) {
      pushLog(`PDF generation failed: ${error.message}`, "bad");
    }
  }

  return (
    <div
      className="relative min-h-screen"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      <div className="relative z-10">
        <div className="sticky top-0 z-30 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 ring-1 ring-white/20 shadow-lg" />
              <div>
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  🔍 Topic Research
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold shadow-lg">
                    AGENTIC
                  </span>
                </div>
                <div className="text-xs text-slate-300">Search any topic → Auto-generate research insights</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => nav("/app")}
                className="px-3 py-2 rounded-xl text-sm font-medium bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20 backdrop-blur-sm transition"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => nav("/dashboard")}
                className="px-3 py-2 rounded-xl text-sm font-medium bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20 backdrop-blur-sm transition"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <Card title="Search Topic" right={<Pill tone={searching ? "info" : "neutral"}>{searching ? "Researching…" : "Ready"}</Pill>}>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-800">What would you like to research?</label>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="e.g., Quantum Computing, Climate Change, Neural Networks…"
                      disabled={searching}
                      className="flex-1 rounded-2xl bg-white ring-1 ring-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:ring-purple-300 disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={startResearch}
                      disabled={!topic.trim() || searching}
                      className={[
                        "px-6 py-3 rounded-2xl font-semibold transition",
                        !topic.trim() || searching
                          ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                          : "bg-purple-600 text-white hover:bg-purple-700",
                      ].join(" ")}
                    >
                      {searching ? "Researching…" : "Research"}
                    </button>
                  </div>
                  <div className="text-xs text-slate-600 mt-2">
                    Press <span className="font-mono">Enter</span> or click Research button
                  </div>
                </div>
              </div>
            </Card>

            {research.topic && (
              <Card title={`Research: "${research.topic}"`} right={<Pill tone="info">Topic Summary</Pill>}>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
                    {[
                      { id: "overview", label: "Overview" },
                      { id: "knowledge", label: "Knowledge" },
                      { id: "hypotheses", label: "Hypotheses" },
                      { id: "experiments", label: "Experiments" },
                      { id: "validation", label: "Validation" },
                      { id: "learning", label: "Learning" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={[
                          "px-3 py-2 rounded-xl text-sm font-medium transition ring-1",
                          activeTab === tab.id
                            ? "bg-purple-600 text-white ring-purple-600"
                            : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      <div className="text-sm text-slate-600">
                        <p className="font-semibold text-slate-900 mb-2">Research Summary</p>
                        <p className="whitespace-pre-wrap">{research.final}</p>
                      </div>

                      {research.final && (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={downloadSummaryPDF}
                            className="px-6 py-3 rounded-xl font-semibold bg-purple-600 text-white hover:bg-purple-700 transition flex items-center gap-2"
                          >
                            📄 Download PDF Summary
                          </button>
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-6 py-3 rounded-xl font-semibold bg-slate-600 text-white hover:bg-slate-700 transition flex items-center gap-2"
                          >
                            🖨️ Print Summary
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "knowledge" && (
                    <div className="space-y-3">
                      {!research.knowledge.length ? (
                        <div className="text-sm text-slate-600">Knowledge extraction stage not connected yet.</div>
                      ) : (
                        research.knowledge.map((k, i) => (
                          <div key={i} className="rounded-2xl bg-sky-50 ring-1 ring-sky-100 p-4">
                            <div className="text-sm font-semibold text-slate-900">{k.claim}</div>
                            <div className="text-xs text-slate-600 mt-2">
                              Source: <span className="font-medium">{k.source}</span> • Confidence: {Math.round((k.confidence || 0) * 100)}%
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === "hypotheses" && (
                    <div className="space-y-3">
                      {!research.hypotheses.length ? (
                        <div className="text-sm text-slate-600">Hypothesis stage not connected yet.</div>
                      ) : (
                        research.hypotheses.map((h) => (
                          <div key={h.id} className="rounded-2xl bg-white ring-1 ring-slate-200 p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="text-sm font-semibold text-slate-900">
                                  {h.id}: {h.claim}
                                </div>
                                <div className="text-sm text-slate-700 mt-2">📊 {h.prediction}</div>
                              </div>
                              <Pill tone="info">Testable</Pill>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === "experiments" && (
                    <div className="space-y-3">
                      {!research.experiments.length ? (
                        <div className="text-sm text-slate-600">Experiment stage not connected yet.</div>
                      ) : (
                        research.experiments.map((e) => (
                          <div key={e.id} className="rounded-2xl bg-white ring-1 ring-slate-200 p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="text-sm font-semibold text-slate-900">
                                  {e.id} • {e.hypothesis}
                                </div>
                                <div className="text-sm text-slate-700 mt-2">📋 Design: {e.design}</div>
                                <div className="text-sm text-slate-700 mt-1">📈 Metric: {e.metric}</div>
                                <div className="text-sm text-slate-700 mt-1">✓ Success: {e.success}</div>
                              </div>
                              <Pill tone="warn">Design</Pill>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === "validation" && (
                    <div className="space-y-3">
                      {!research.validation.length ? (
                        <div className="text-sm text-slate-600">Validation stage not connected yet.</div>
                      ) : (
                        research.validation.map((v, i) => (
                          <div key={i} className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 flex items-center justify-between">
                            <div className="text-sm font-semibold text-slate-900">{v.check}</div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-600">{v.confidence}</span>
                              <Pill tone={v.status === "PASS" ? "good" : "bad"}>{v.status}</Pill>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === "learning" && (
                    <div className="space-y-4">
                      {research.learning.keyLearnings && (
                        <div>
                          <p className="font-semibold text-slate-900 mb-2 text-sm">Key Learnings</p>
                          <ul className="space-y-2 text-sm text-slate-700">
                            {research.learning.keyLearnings.map((l, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-purple-600 font-bold">•</span>
                                <span>{l}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {research.learning.bestPractices && (
                        <div>
                          <p className="font-semibold text-slate-900 mb-2 text-sm">Best Practices</p>
                          <ul className="space-y-2 text-sm text-slate-700">
                            {research.learning.bestPractices.map((b, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {research.learning.nextSteps && (
                        <div>
                          <p className="font-semibold text-slate-900 mb-2 text-sm">Next Steps</p>
                          <ul className="space-y-2 text-sm text-slate-700">
                            {research.learning.nextSteps.map((s, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-blue-600 font-bold">→</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {research.learning.risks && (
                        <div>
                          <p className="font-semibold text-slate-900 mb-2 text-sm">Potential Risks</p>
                          <ul className="space-y-2 text-sm text-slate-700">
                            {research.learning.risks.map((r, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-rose-600 font-bold">⚠</span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          <div className="lg:col-span-5">
            <Card
              title="Live Research Log"
              right={
                <button
                  type="button"
                  onClick={() => setLogs([])}
                  disabled={searching}
                  className="px-3 py-2 rounded-xl text-sm bg-white hover:bg-slate-50 ring-1 ring-slate-200 text-slate-800 disabled:opacity-50"
                >
                  Clear
                </button>
              }
            >
              <div className="h-[600px] overflow-auto rounded-2xl bg-white ring-1 ring-slate-200 p-4 space-y-2">
                {logs.length === 0 ? (
                  <div className="text-sm text-slate-600">Search a topic above to start the research cycle…</div>
                ) : (
                  logs.map((l, i) => (
                    <div key={i} className="text-xs">
                      <span className="text-slate-400">{l.ts.slice(11, 19)}</span>
                      <span className="text-slate-300"> • </span>
                      <span className={toneToClass(l.tone)}>{l.msg}</span>
                    </div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}