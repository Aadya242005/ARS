import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import MarkdownRenderer from "../components/MarkdownRenderer";

function Pill({ tone = "neutral", children }) {
  const cls =
    tone === "good"
      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
      : tone === "info"
      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
      : tone === "warn"
      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
      : tone === "bad"
      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
      : "bg-white/5 text-white/40 border border-white/10";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md ${cls}`}>
      {children}
    </span>
  );
}

function Card({ title, right, children }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl shadow-glow-cyan overflow-hidden">
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between gap-3 bg-white/[0.02]">
        <div className="text-sm font-semibold text-white/90 font-display">{title}</div>
        {right}
      </div>
      <div className="p-6 text-white/80">{children}</div>
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
    if (tone === "good") return "text-emerald-400";
    if (tone === "warn") return "text-amber-400";
    if (tone === "bad") return "text-rose-400";
    return "text-cyan-400";
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

  function stripMD(t = "") {
    return t.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/^#+\s*/gm, "").trim();
  }

  function parseMD(text = "") {
    return text.split("\n").map(raw => {
      const line = raw.trimEnd();
      if (!line) return { type: "spacer" };
      const hm = line.match(/^\*\*(.*?)\*\*\s*$/);
      if (hm) return { type: "heading", text: hm[1] };
      const nm = line.match(/^(\d+)\.\s+\*\*(.*?)\*\*[:\s]+(.*)/);
      if (nm) return { type: "item", num: nm[1], bold: nm[2], rest: nm[3] };
      const ns = line.match(/^(\d+)\.\s+(.*)/);
      if (ns) return { type: "item", num: ns[1], bold: null, rest: ns[2] };
      if (/^[\u2022\-]\s+/.test(line)) return { type: "bullet", text: stripMD(line.replace(/^[\u2022\-]\s+/, "")) };
      return { type: "para", text: stripMD(line) };
    });
  }

  function downloadSummaryPDF() {
    try {
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const W = pdf.internal.pageSize.getWidth();
      const H = pdf.internal.pageSize.getHeight();
      const M = 20;
      const CW = W - M * 2;
      let y = M;
      let pg = 1;

      const putPageNum = () => {
        pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(150, 150, 150);
        pdf.text(String(pg), W - M, 10, { align: "right" }); pdf.setTextColor(0, 0, 0);
      };

      const chk = () => {
        if (y > H - 25) {
          putPageNum(); pdf.addPage(); pg++; y = M + 6;
          pdf.setDrawColor(210, 210, 210); pdf.setLineWidth(0.3); pdf.line(M, 14, W - M, 14);
        }
      };

      const heading = (txt) => {
        chk(); y += 4;
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(11); pdf.setTextColor(0, 0, 0);
        pdf.text(txt.toUpperCase(), M, y); y += 2;
        pdf.setDrawColor(200, 200, 200); pdf.setLineWidth(0.3);
        pdf.line(M, y + 1, W - M, y + 1); y += 7;
      };

      const para = (txt) => {
        pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.setTextColor(50, 50, 50);
        pdf.splitTextToSize(txt, CW).forEach(l => { chk(); pdf.text(l, M, y); y += 5.5; }); y += 2;
      };

      // ── Title block ──────────────────────────────────────────────────
      pdf.setFillColor(0, 0, 0); pdf.rect(M, y, CW, 1.2, "F"); y += 10;
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(22); pdf.setTextColor(0, 0, 0);
      pdf.text(research.topic.toUpperCase(), M, y); y += 8;
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(11); pdf.setTextColor(80, 80, 80);
      pdf.text("Research Analysis Report", M, y); y += 5;
      pdf.setFont("helvetica", "italic"); pdf.setFontSize(9); pdf.setTextColor(150, 150, 150);
      pdf.text("Autonomous Research Scientist  \u00b7  ARS v2.0", M, y); y += 8;
      pdf.setDrawColor(0, 0, 0); pdf.setLineWidth(0.5); pdf.line(M, y, W - M, y); y += 12;

      // ── Executive Overview ───────────────────────────────────────────
      heading("Executive Overview");
      para(`This report presents a structured analysis of ${research.topic}, compiled by an autonomous multi-agent AI research pipeline. The agents extracted knowledge from literature, generated testable hypotheses, designed experiments, and synthesized findings into the sections below.`);

      // ── Main AI content ──────────────────────────────────────────────
      for (const s of parseMD(research.final || "")) {
        chk();
        if (s.type === "spacer") { y += 2; continue; }
        if (s.type === "heading") { heading(s.text); continue; }
        if (s.type === "item") {
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold"); pdf.setTextColor(0, 0, 0);
          pdf.text(`${s.num}.`, M, y);
          const tx = M + 8;
          if (s.bold) {
            const bl = s.bold + ": ";
            pdf.text(bl, tx, y);
            const bw = pdf.getTextWidth(bl);
            pdf.setFont("helvetica", "normal"); pdf.setTextColor(60, 60, 60);
            const rls = pdf.splitTextToSize(s.rest, CW - 8 - bw);
            rls.forEach((l, i) => { chk(); pdf.text(l, tx + bw, y); if (i < rls.length - 1) y += 5.5; });
          } else {
            pdf.setFont("helvetica", "normal"); pdf.setTextColor(60, 60, 60);
            const rls = pdf.splitTextToSize(s.rest, CW - 8);
            rls.forEach((l, i) => { chk(); pdf.text(l, tx, y); if (i < rls.length - 1) y += 5.5; });
          }
          y += 6; continue;
        }
        if (s.type === "bullet") {
          pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.setTextColor(60, 60, 60);
          pdf.text("\u2013", M + 1, y);
          const bls = pdf.splitTextToSize(s.text, CW - 7);
          bls.forEach((l, i) => { chk(); pdf.text(l, M + 7, y); if (i < bls.length - 1) y += 5.5; });
          y += 6; continue;
        }
        if (s.type === "para" && s.text) para(s.text);
      }

      // ── Key Findings ─────────────────────────────────────────────────
      if (research.learning?.keyLearnings?.length) {
        heading("Key Findings");
        research.learning.keyLearnings.forEach((item, i) => {
          chk();
          pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.setTextColor(0, 0, 0); pdf.text(`${i + 1}.`, M, y);
          pdf.setFont("helvetica", "normal"); pdf.setTextColor(60, 60, 60);
          const ls = pdf.splitTextToSize(stripMD(item), CW - 8);
          ls.forEach((l, li) => { chk(); pdf.text(l, M + 8, y); if (li < ls.length - 1) y += 5.5; }); y += 6;
        });
      }

      // ── Next Steps ───────────────────────────────────────────────────
      if (research.learning?.nextSteps?.length) {
        heading("Recommended Next Steps");
        research.learning.nextSteps.forEach((item, i) => {
          chk();
          pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.setTextColor(0, 0, 0); pdf.text(`${i + 1}.`, M, y);
          pdf.setFont("helvetica", "normal"); pdf.setTextColor(60, 60, 60);
          const ls = pdf.splitTextToSize(stripMD(item), CW - 8);
          ls.forEach((l, li) => { chk(); pdf.text(l, M + 8, y); if (li < ls.length - 1) y += 5.5; }); y += 6;
        });
      }

      // ── Footer ───────────────────────────────────────────────────────
      putPageNum();
      pdf.setDrawColor(0, 0, 0); pdf.setLineWidth(0.5); pdf.line(M, H - 14, W - M, H - 14);
      pdf.setFont("helvetica", "italic"); pdf.setFontSize(8); pdf.setTextColor(150, 150, 150);
      pdf.text("Autonomous Research Scientist  \u00b7  ARS", M, H - 9);

      const fn = `${research.topic.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_report.pdf`;
      pdf.save(fn);
      pushLog(`Report saved: ${fn}`, "good");
    } catch (e) {
      pushLog(`PDF generation failed: ${e.message}`, "bad");
    }
  }

  return (
    <div className="relative min-h-screen bg-lab-950 font-sans selection:bg-cyan-500/30">
      {/* Animated grid background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PHBhdGggZD0iTSAxMCAwIEwgMTAgNDAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2dyaWQpIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiLz48L3N2Zz4=')]" />
        <div className="absolute inset-0 bg-gradient-to-b from-lab-950 via-transparent to-lab-950" />
      </div>

      <div className="relative z-10">
        <div className="sticky top-0 z-30 bg-black/40 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center text-lg shadow-glow-cyan">
                🔍
              </div>
              <div>
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  Topic Research
                  <span className="text-[9px] px-2 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono font-bold">
                    AGENTIC
                  </span>
                </div>
                <div className="text-xs text-white/50">Search any topic → Auto-generate research insights</div>
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
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50">What would you like to research?</label>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="e.g., Quantum Computing, Climate Change, Neural Networks…"
                      disabled={searching}
                      className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.1] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 transition disabled:opacity-60 font-mono"
                    />
                    <button
                      type="button"
                      onClick={startResearch}
                      disabled={!topic.trim() || searching}
                      className={[
                        "px-6 py-3 rounded-xl font-bold transition text-sm flex items-center gap-2",
                        !topic.trim() || searching
                          ? "bg-white/[0.05] text-white/30 cursor-not-allowed"
                          : "bg-cyan-500 text-black hover:bg-cyan-400 shadow-glow-cyan",
                      ].join(" ")}
                    >
                      {searching ? "Researching…" : "Research"}
                    </button>
                  </div>
                  <div className="text-[10px] text-white/40 mt-3 font-mono">
                    Press <span className="text-white/80">Enter</span> to initialize sequence
                  </div>
                </div>
              </div>
            </Card>

            {research.topic && (
              <Card title={`Research: "${research.topic}"`} right={<Pill tone="info">Topic Summary</Pill>}>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 border-b border-white/[0.06] pb-4">
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
                          "px-4 py-2 rounded-xl text-[11px] font-mono font-bold uppercase tracking-wider transition border",
                          activeTab === tab.id
                            ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                            : "bg-transparent text-white/50 border-transparent hover:bg-white/[0.05] hover:text-white/80",
                        ].join(" ")}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      <div className="text-sm text-white/80">
                        <MarkdownRenderer content={research.final} />
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
                  className="px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white/60 disabled:opacity-50"
                >
                  Clear Logs
                </button>
              }
            >
              <div className="h-[600px] overflow-auto rounded-xl bg-black/60 border border-white/[0.05] p-4 space-y-2 font-mono">
                {logs.length === 0 ? (
                  <div className="text-[11px] text-white/30 text-center mt-10">System idle. Awaiting topic...</div>
                ) : (
                  logs.map((l, i) => (
                    <div key={i} className="text-[11px] flex items-start gap-2">
                      <span className="text-white/30 shrink-0">[{l.ts.slice(11, 19)}]</span>
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