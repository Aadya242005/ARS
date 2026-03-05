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

    setSearching(true);
    setLogs([]);
    setResearch({
      topic: topic.trim(),
      knowledge: [],
      hypotheses: [],
      experiments: [],
      results: [],
      validation: [],
      learning: {},
      final: "",
    });

    pushLog(`Starting agentic research on: "${topic}"`, "info");

    try {
      // Step 1: Start research on backend
      pushLog("Initiating backend research pipeline…", "info");
      const startRes = await fetch("http://localhost:8000/api/research/topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), mode: "full" }),
      });

      if (!startRes.ok) {
        throw new Error(`Backend error: ${startRes.status} ${startRes.statusText}`);
      }

      const { run_id } = await startRes.json();
      pushLog(`Research pipeline started: ${run_id}`, "good");

      // Step 2: Stream events from backend
      pushLog("Streaming agent updates…", "info");
      const streamRes = await fetch(`http://localhost:8000/api/runs/${run_id}/stream`);

      if (!streamRes.ok) {
        throw new Error("Failed to stream events");
      }

      const reader = streamRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          const eventMatch = line.match(/^event:(.+)$/m);
          const dataMatch = line.match(/^data:(.+)$/m);

          if (eventMatch && dataMatch) {
            const event = eventMatch[1];
            const data = JSON.parse(dataMatch[1]);

            if (event === "run_started") {
              pushLog("⚙️ Research cycle initiated", "info");
            } else if (event === "node_started") {
              const nodeName = data.node.toUpperCase();
              pushLog(`${nodeName} agent running…`, "info");
            } else if (event === "node_finished") {
              const nodeName = data.node.toUpperCase();
              pushLog(`✓ ${nodeName} agent complete`, "good");
            } else if (event === "state_update") {
              // Update research state with latest data
              setResearch({
                topic: data.goal ? data.goal.substring(0, 50) : topic.trim(),
                knowledge: data.workspace?.knowledge || [],
                hypotheses: data.workspace?.hypotheses || [],
                experiments: data.workspace?.experiments || [],
                results: data.workspace?.results || [],
                validation: data.workspace?.validation || [],
                learning: data.workspace?.learning || {},
                final: data.workspace?.final || "",
              });
            } else if (event === "run_finished") {
              pushLog("🎉 Research cycle complete!", "good");
            }
          }
        }
      }

      setActiveTab("knowledge");
      pushLog("✅ All research insights ready for review", "good");
    } catch (e) {
      pushLog(`❌ Error: ${e.message}`, "bad");
      pushLog("Make sure backend is running on http://localhost:8000", "warn");
    } finally {
      setSearching(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !searching) {
      startResearch();
    }
  }

  // Generate research summary like a junior research scientist
  function generateResearchSummary() {
    const { topic, knowledge, hypotheses, experiments, results, validation, learning, final } = research;

    let summary = `RESEARCH SUMMARY: ${topic.toUpperCase()}\n`;
    summary += `Generated on: ${new Date().toLocaleDateString()}\n\n`;

    summary += `EXECUTIVE SUMMARY\n`;
    summary += `This research investigated ${topic} using an automated 7-agent research pipeline. `;
    summary += `The analysis covered ${knowledge.length} key knowledge points, `;
    summary += `tested ${hypotheses.length} hypotheses through ${experiments.length} experiments, `;
    summary += `and achieved ${results.filter(r => r.status === 'PASS').length}/${results.length} successful validations.\n\n`;

    summary += `KEY FINDINGS\n`;
    if (learning.keyLearnings) {
      learning.keyLearnings.forEach((learning, i) => {
        summary += `${i + 1}. ${learning}\n`;
      });
    }
    summary += `\n`;

    summary += `METHODOLOGY\n`;
    summary += `• Knowledge Extraction: Analyzed ${knowledge.length} relevant data points from research sources\n`;
    summary += `• Hypothesis Generation: Developed ${hypotheses.length} testable research questions\n`;
    summary += `• Experimental Design: Created ${experiments.length} structured experiments with defined metrics\n`;
    summary += `• Validation: Conducted ${validation.length} validation checks for research integrity\n\n`;

    summary += `EXPERIMENTAL RESULTS\n`;
    results.forEach((result, i) => {
      summary += `Experiment ${result.experiment_id}: ${result.metric} = ${result.metric_value} `;
      summary += `(Baseline: ${result.baseline}, Improvement: ${result.improvement})\n`;
      summary += `Status: ${result.status} - ${result.log}\n\n`;
    });

    summary += `CONCLUSIONS\n`;
    if (learning.bestPractices) {
      summary += `Best Practices Identified:\n`;
      learning.bestPractices.forEach((practice, i) => {
        summary += `• ${practice}\n`;
      });
    }
    summary += `\n`;

    summary += `FUTURE RESEARCH DIRECTIONS\n`;
    if (learning.nextSteps) {
      learning.nextSteps.forEach((step, i) => {
        summary += `${i + 1}. ${step}\n`;
      });
    }
    summary += `\n`;

    summary += `VALIDATION STATUS\n`;
    const passedValidations = validation.filter(v => v.status === 'PASS').length;
    summary += `${passedValidations}/${validation.length} validation checks passed\n`;
    validation.forEach(v => {
      summary += `• ${v.check}: ${v.status}\n`;
    });

    return summary;
  }

  // Download summary as PDF
  function downloadSummaryPDF() {
    try {
      const summary = generateResearchSummary();
      const pdf = new jsPDF();

      // Set font and size
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);

      // Add title
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Research Summary: ${research.topic}`, 15, 20);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 15, 30);

      // Split text into lines that fit the page
      const lines = pdf.splitTextToSize(summary, 180);
      let y = 45;
      let pageCount = 1;

      lines.forEach((line) => {
        if (y > 270) { // New page if needed
          pdf.addPage();
          pageCount++;
          pdf.setFontSize(10);
          pdf.text(`Page ${pageCount}`, 15, 15);
          y = 25;
        }
        pdf.text(line, 15, y);
        y += 5;
      });

      // Add research sources section
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
        "• JSTOR - Academic journals"
      ];

      sources.forEach(source => {
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(source, 15, y);
        y += 7;
      });

      // Save the PDF
      const filename = `${research.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_research_summary.pdf`;
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
        {/* Header */}
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

        {/* Content */}
        <div className="max-w-7xl mx-auto px-5 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left - Search & Results */}
          <div className="lg:col-span-7 space-y-6">
            {/* Search Card */}
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

            {/* Results Card */}
            {research.topic && (
              <Card title={`Research: "${research.topic}"`} right={<Pill tone="info">7-Agent Cycle</Pill>}>
                <div className="space-y-4">
                  {/* Tabs */}
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

                  {/* Tab Content */}
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      <div className="text-sm text-slate-600">
                        <p className="font-semibold text-slate-900 mb-2">Research Summary</p>
                        <p className="whitespace-pre-wrap">{research.final}</p>
                      </div>

                      {/* PDF Download Button */}
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

                      {/* Research Sources & Further Reading */}
                      {research.final && (
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-3">📚 Where to Research More</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-semibold text-blue-900 mb-2">Academic & Research</h4>
                              <ul className="space-y-1 text-sm text-blue-800">
                                <li>• <a href={`https://scholar.google.com/scholar?q=${encodeURIComponent(research.topic)}`} target="_blank" rel="noopener noreferrer" className="hover:underline">Google Scholar</a></li>
                                <li>• <a href={`https://www.researchgate.net/search?q=${encodeURIComponent(research.topic)}`} target="_blank" rel="noopener noreferrer" className="hover:underline">ResearchGate</a></li>
                                <li>• <a href={`https://arxiv.org/search/?query=${encodeURIComponent(research.topic)}`} target="_blank" rel="noopener noreferrer" className="hover:underline">arXiv (Preprints)</a></li>
                                <li>• <a href={`https://ieeexplore.ieee.org/search/searchresult.jsp?queryText=${encodeURIComponent(research.topic)}`} target="_blank" rel="noopener noreferrer" className="hover:underline">IEEE Xplore</a></li>
                              </ul>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg">
                              <h4 className="font-semibold text-green-900 mb-2">News & Current Events</h4>
                              <ul className="space-y-1 text-sm text-green-800">
                                <li>• <a href={`https://www.bbc.com/search?q=${encodeURIComponent(research.topic)}`} target="_blank" rel="noopener noreferrer" className="hover:underline">BBC News</a></li>
                                <li>• <a href={`https://www.reuters.com/search/?query=${encodeURIComponent(research.topic)}`} target="_blank" rel="noopener noreferrer" className="hover:underline">Reuters</a></li>
                                <li>• <a href={`https://www.theguardian.com/search?q=${encodeURIComponent(research.topic)}`} target="_blank" rel="noopener noreferrer" className="hover:underline">The Guardian</a></li>
                                <li>• <a href={`https://news.google.com/search?q=${encodeURIComponent(research.topic)}`} target="_blank" rel="noopener noreferrer" className="hover:underline">Google News</a></li>
                              </ul>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg">
                              <h4 className="font-semibold text-purple-900 mb-2">General Knowledge</h4>
                              <ul className="space-y-1 text-sm text-purple-800">
                                <li>• <a href={`https://en.wikipedia.org/wiki/${encodeURIComponent(research.topic.replace(/\s+/g, '_'))}`} target="_blank" rel="noopener noreferrer" className="hover:underline">Wikipedia</a></li>
                                <li>• <a href={`https://www.britannica.com/search?query=${encodeURIComponent(research.topic)}`} target="_blank" rel="noopener noreferrer" className="hover:underline">Encyclopedia Britannica</a></li>
                                <li>• <a href={`https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(research.topic)}`} target="_blank" rel="noopener noreferrer" className="hover:underline">Khan Academy</a></li>
                                <li>• <a href={`https://www.coursera.org/search?query=${encodeURIComponent(research.topic)}`} target="_blank" rel="noopener noreferrer" className="hover:underline">Coursera</a></li>
                              </ul>
                            </div>

                            <div className="bg-orange-50 p-4 rounded-lg">
                              <h4 className="font-semibold text-orange-900 mb-2">Specialized Sources</h4>
                              <ul className="space-y-1 text-sm text-orange-800">
                                <li>• <a href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(research.topic)}`} target="_blank" rel="noopener noreferrer" className="hover:underline">PubMed (Medical)</a></li>
                                <li>• <a href={`https://www.jstor.org/action/doBasicSearch?Query=${encodeURIComponent(research.topic)}`} target="_blank" rel="noopener noreferrer" className="hover:underline">JSTOR (Academic)</a></li>
                                <li>• <a href={`https://www.semanticscholar.org/search?q=${encodeURIComponent(research.topic)}`} target="_blank" rel="noopener noreferrer" className="hover:underline">Semantic Scholar</a></li>
                                <li>• <a href={`https://www.academia.edu/search?q=${encodeURIComponent(research.topic)}`} target="_blank" rel="noopener noreferrer" className="hover:underline">Academia.edu</a></li>
                              </ul>
                            </div>
                          </div>
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              <strong>💡 Pro Tip:</strong> For comprehensive research, combine multiple sources. 
                              Academic papers provide depth, news sources offer current events, and Wikipedia gives overview context.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "knowledge" && (
                    <div className="space-y-3">
                      {!research.knowledge.length ? (
                        <div className="text-sm text-slate-600">Run research to see knowledge insights.</div>
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
                        <div className="text-sm text-slate-600">Run research to see hypotheses.</div>
                      ) : (
                        research.hypotheses.map((h) => (
                          <div key={h.id} className="rounded-2xl bg-white ring-1 ring-slate-200 p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="text-sm font-semibold text-slate-900">{h.id}: {h.claim}</div>
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
                        <div className="text-sm text-slate-600">Run research to see experiments.</div>
                      ) : (
                        research.experiments.map((e) => (
                          <div key={e.id} className="rounded-2xl bg-white ring-1 ring-slate-200 p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="text-sm font-semibold text-slate-900">{e.id} • {e.hypothesis}</div>
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
                        <div className="text-sm text-slate-600">Run research to see validation results.</div>
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

          {/* Right - Live Logs */}
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
