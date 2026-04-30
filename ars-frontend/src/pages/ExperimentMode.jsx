import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FlaskConical,
  Sparkles,
  ArrowRight,
  Clock,
  Database,
  Target,
  Zap,
  CheckCircle2,
  AlertCircle,
  Layout,
  ImageIcon,
  BarChart3,
  Code2,
  ExternalLink,
  Copy,
} from "lucide-react";

const DOMAINS = [
  { value: "AI", label: "Artificial Intelligence", icon: "🤖" },
  { value: "Biology", label: "Biology", icon: "🧬" },
  { value: "Physics", label: "Physics", icon: "⚛️" },
  { value: "Chemistry", label: "Chemistry", icon: "🧪" },
  { value: "Medicine", label: "Medicine", icon: "🏥" },
  { value: "general", label: "General", icon: "📊" },
];

const DIFFICULTY_COLORS = {
  beginner: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  intermediate: "bg-amber-100 text-amber-700 ring-amber-200",
  advanced: "bg-rose-100 text-rose-700 ring-rose-200",
};

function SuggestionCard({ suggestion, index, onStart, onSelect }) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative rounded-2xl bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl overflow-hidden">
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <div className="text-xs font-medium text-cyan-600 mb-1">
                Approach {index + 1}
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {suggestion.approach}
              </h3>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ring-1 ${DIFFICULTY_COLORS[suggestion.difficulty] || DIFFICULTY_COLORS.intermediate}`}
            >
              {suggestion.difficulty}
            </span>
          </div>

          <p className="text-sm text-slate-600 mb-4 line-clamp-3 h-[60px]">
            {suggestion.approach_description}
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Database className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-slate-500 mb-0.5">
                  Dataset
                </div>
                <div className="text-sm text-slate-900 truncate">
                  {suggestion.dataset}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Target className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-slate-500 mb-0.5">
                  Expected Output
                </div>
                <div className="text-sm text-slate-900 truncate">
                  {suggestion.expected_output}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-slate-500 mb-0.5">
                  Estimated Time
                </div>
                <div className="text-sm text-slate-900 truncate">
                  {suggestion.estimated_time}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-100 flex gap-2">
          <button 
            onClick={() => onSelect(suggestion)}
            className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
          >
            Analyze <ArrowRight className="h-4 w-4" />
          </button>
          <button 
            onClick={() => onStart(suggestion)}
            className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg py-2 px-3 transition"
          >
            Start Cycle <Zap className="h-3 w-3 fill-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AnalysisView({ analysis, onBack }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(analysis.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-white/60 hover:text-white transition group"
      >
        <ArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
        Back to Suggestions
      </button>

      <div className="relative rounded-3xl bg-white shadow-2xl overflow-hidden border border-white/20">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-cyan-500 px-8 py-10 text-white">
          <div className="flex items-center gap-2 text-indigo-100 mb-2 uppercase tracking-widest text-[10px] font-bold">
            <Sparkles className="h-3 w-3" />
            Detailed Analysis
          </div>
          <h1 className="text-3xl font-bold mb-4">ML/AI methodology</h1>
          <p className="text-indigo-50/90 text-lg max-w-2xl">
            Apply machine learning techniques appropriate for the data type and problem structure.
          </p>
        </div>

        <div className="p-8 md:p-12">
          <div className="space-y-12">
            {/* Phase 2: Analysis & Images */}
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
                    <Layout className="h-5 w-5 text-indigo-600" />
                    Methodology Deep-Dive
                  </h3>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {analysis.analysis}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-800 mb-3">
                      <CheckCircle2 className="h-4 w-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {analysis?.pros?.map((pro, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{pro}</span>
                        </li>
                      ))}
                      {(!analysis?.pros || analysis.pros.length === 0) && (
                        <li className="text-sm text-slate-400 italic">No specific strengths listed.</li>
                      )}
                    </ul>
                  </div>
                  <div className="p-5 rounded-2xl bg-rose-50 border border-rose-100">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-rose-800 mb-3">
                      <AlertCircle className="h-4 w-4" />
                      Challenges
                    </h4>
                    <ul className="space-y-2">
                      {analysis?.cons?.map((con, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <AlertCircle className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                          <span>{con}</span>
                        </li>
                      ))}
                      {(!analysis?.cons || analysis.cons.length === 0) && (
                        <li className="text-sm text-slate-400 italic">No specific challenges listed.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  Scientific Data Insights
                </h3>
                
                <div className="p-8 rounded-3xl bg-slate-900 shadow-2xl border border-slate-800">
                  <div className="flex items-center justify-between mb-8">
                    <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Statistical Projection</div>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  
                  <div className="space-y-6">
                    {analysis?.chart_data?.map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                          <span>{item.name}</span>
                          <span className="text-cyan-300">{item.value}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {(!analysis?.chart_data || analysis.chart_data.length === 0) && (
                      <p className="text-sm text-slate-500 italic text-center py-10">No chart data generated for this experiment.</p>
                    )}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-4">Visualization Plan</h4>
                  <div className="space-y-2">
                    {analysis?.visualization_plan?.map((plan, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <div className="h-1 w-1 rounded-full bg-indigo-400 mt-2 shrink-0" />
                        <span>{plan}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 3: Code Implementation */}
            <div className="border-t border-slate-100 pt-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-1">
                    <Code2 className="h-6 w-6 text-indigo-600" />
                    Implementation Offer
                  </h3>
                  <p className="text-slate-500">Ready-to-use Python baseline for Google Colab</p>
                </div>
                <button
                  onClick={copyCode}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 active:scale-95"
                >
                  {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              </div>

              <div className="rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 shadow-2xl">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">experiment_baseline.py</div>
                </div>
                <pre className="p-6 text-sm font-mono text-indigo-300 overflow-x-auto">
                  <code>{analysis.code}</code>
                </pre>
                <div className="p-6 bg-slate-800/30 flex justify-center border-t border-white/5">
                  <button 
                    onClick={() => window.open("https://colab.research.google.com/", "_blank")}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-900/20"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in Google Colab
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExperimentMode() {
  const navigate = useNavigate();
  const [problem, setProblem] = useState("");
  const [domain, setDomain] = useState("AI");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problem.trim()) return;

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await fetch(
        "http://localhost:5050/api/experiment/mode",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problem_statement: problem,
            domain: domain,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setResults(data);
      } else {
        setError(data.detail || "Failed to generate suggestions");
      }
    } catch (err) {
      setError(
        "Failed to connect to backend. Make sure the server is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = async (suggestion) => {
    setSelectedSuggestion(suggestion);
    setAnalysis(null);
    setAnalyzing(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5050/api/experiment/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_statement: problem,
          suggestion: suggestion,
          domain: domain,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setAnalysis(data);
      } else {
        setError(data.error || "Failed to analyze suggestion");
      }
    } catch (err) {
      setError("Failed to connect to backend for analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStartCycle = (suggestion) => {
    // Navigate to research with pre-filled context
    navigate("/research", { 
      state: { 
        goal: `${suggestion.approach} for ${problem}`,
        domain: domain 
      } 
    });
  };

  const handleNewExperiment = () => {
    setProblem("");
    setResults(null);
    setError("");
    setSelectedSuggestion(null);
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 text-white font-sans">
      {/* Header */}
      <div className="border-b border-white/10 bg-zinc-950/40 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-300/30 to-indigo-400/30 border border-white/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FlaskConical className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <div className="font-semibold leading-5 text-white">
                Experiment Mode
              </div>
              <div className="text-[11px] text-white/60 uppercase tracking-widest">
                Scientific Engine
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            <button
              onClick={() => navigate("/")}
              className="text-sm px-4 py-2 rounded-xl transition text-white/80 hover:text-white hover:bg-white/10"
            >
              Home
            </button>
            <button
              onClick={() => navigate("/app")}
              className="text-sm px-4 py-2 rounded-xl transition bg-white/10 text-white hover:bg-white/20 border border-white/10"
            >
              Dashboard
            </button>
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-12 md:py-20">
        {!results ? (
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="h-4 w-4 animate-pulse" />
              Killer Feature
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Design Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">Experiment</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Describe your research problem and let ARS suggest the perfect dataset, 
              approach, and expected output — like a real scientist.
            </p>

            <form onSubmit={handleSubmit} className="mt-12 space-y-6">
              <div className="space-y-2 text-left">
                <label className="text-sm font-bold text-slate-300 ml-1">Problem Statement</label>
                <textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="e.g., predict stock market trends using sentiment analysis from Twitter data..."
                  className="w-full h-40 rounded-3xl bg-white/5 border border-white/10 p-6 text-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition resize-none shadow-2xl"
                />
              </div>

              <div className="space-y-2 text-left">
                <label className="text-sm font-bold text-slate-300 ml-1">Research Domain</label>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  {DOMAINS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDomain(d.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                        domain === d.value
                          ? "bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 scale-105"
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-2xl">{d.icon}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{d.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !problem.trim()}
                className="w-full h-16 rounded-3xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-lg hover:from-indigo-500 hover:to-cyan-400 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating Suggestions...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Generate Experiment Approaches</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-12">
            {!selectedSuggestion ? (
              <>
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                    <CheckCircle2 className="h-3 w-3" />
                    Suggestions Ready
                  </div>
                  <h2 className="text-3xl font-bold">{problem}</h2>
                  <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
                    <span>Domain: {domain.toLowerCase()}</span>
                    <span>•</span>
                    <span>3 approaches suggested</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {results.suggestions.map((s, i) => (
                    <SuggestionCard 
                      key={i} 
                      suggestion={s} 
                      index={i} 
                      onSelect={handleSelectSuggestion}
                      onStart={handleStartCycle}
                    />
                  ))}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-16">
                  <button
                    onClick={handleNewExperiment}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition border border-white/10"
                  >
                    <Sparkles className="h-5 w-5 text-cyan-400" />
                    New Problem
                  </button>
                  <button
                    onClick={() => navigate("/app")}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold hover:from-cyan-400 hover:to-indigo-400 transition shadow-xl shadow-cyan-500/20"
                  >
                    <FlaskConical className="h-5 w-5" />
                    Go to Dashboard
                  </button>
                </div>
              </>
            ) : (
              <>
                {analyzing ? (
                  <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
                    <div className="relative h-24 w-24 mx-auto">
                      <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
                      <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                      <Zap className="absolute inset-0 m-auto h-8 w-8 text-cyan-400 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">Deep Dive in Progress</h3>
                      <p className="text-slate-400">Agent is performing technical methodology analysis...</p>
                    </div>
                  </div>
                ) : analysis ? (
                  <AnalysisView analysis={analysis} onBack={() => {
                    setSelectedSuggestion(null);
                    setAnalysis(null);
                  }} />
                ) : null}
              </>
            )}
          </div>
        )}

        {error && (
          <div className="max-w-xl mx-auto mt-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-center flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">{error}</span>
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 py-12 mt-20">
        <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-white/40">
          <div>© 2026 ARS Lab • Autonomous Research Agent</div>
          <div className="flex items-center gap-8 uppercase tracking-widest text-[10px] font-bold">
            <span className="text-cyan-500/60">Phase 1: Suggestions</span>
            <span className="text-indigo-500/60">Phase 2: Analysis</span>
            <span className="text-emerald-500/60">Phase 3: Implementation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
