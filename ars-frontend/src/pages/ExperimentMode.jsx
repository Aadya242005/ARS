import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FlaskConical,
  Sparkles,
  ArrowRight,
  Clock,
  Database,
  Target,
  CheckCircle2,
  AlertCircle,
  Layout,
  Zap,
  Image,
  BarChart3,
  Code,
  ExternalLink,
} from "lucide-react";
import { BACKEND_API } from "../config";

const DOMAINS = [
  { value: "AI", label: "Artificial Intelligence", icon: "🤖" },
  { value: "Biology", label: "Biology", icon: "🧬" },
  { value: "Physics", label: "Physics", icon: "⚛️" },
  { value: "Chemistry", label: "Chemistry", icon: "🧪" },
  { value: "Medicine", label: "Medicine", icon: "🏥" },
  { value: "general", label: "General", icon: "📊" },
];

const DIFFICULTY_COLORS = {
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

          <p className="text-sm text-slate-600 mb-4 line-clamp-3">
            {suggestion.approach_description}
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Database className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-slate-500 mb-0.5">
                  Dataset
                </div>
                <div className="text-sm text-slate-900">
                  {suggestion.dataset}
                </div>
                {suggestion.dataset_url && (
                  <a
                    href={suggestion.dataset_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-600 hover:text-cyan-700 hover:underline"
                  >
                    View Dataset →
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Target className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-slate-500 mb-0.5">
                  Expected Output
                </div>
                <div className="text-sm text-slate-900">
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
                <div className="text-sm text-slate-900">
                  {suggestion.estimated_time}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-100 flex gap-2">
          <button onClick={() => onStart(suggestion)} className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition">
            Start Cycle
          </button>
          <button onClick={() => onSelect(suggestion)} className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition">
            Analyze <ArrowRight className="h-4 w-4" />
          </button>
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
        `${BACKEND_API}/api/experiment/mode`,
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
        const errorMsg = typeof data.detail === 'object' ? JSON.stringify(data.detail) : data.detail;
        setError(errorMsg || "Failed to generate suggestions");
      }
    } catch (err) {
      setError(
        "Failed to connect to backend. Make sure the server is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNewExperiment = () => {
    setProblem("");
    setResults(null);
    setError("");
  };

  const handleSelectSuggestion = async (suggestion) => {
    setSelectedSuggestion(suggestion);
    setAnalysis(null);
    setAnalyzing(true);
    setError("");

    try {
      const response = await fetch(`${BACKEND_API}/api/experiment/analyze`, {
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
        const errorMsg = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
        setError(errorMsg || "Failed to analyze suggestion");
      }
    } catch (err) {
      setError("Failed to connect to backend for analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStartExperiment = (suggestion) => {
    navigate("/app", {
      state: {
        goal: `Research problem: ${results.problem}. Approach: ${suggestion.approach}. ${suggestion.approach_description}. Dataset: ${suggestion.dataset}. Expected output: ${suggestion.expected_output}.`,
        domain: results.domain,
        autoStart: true,
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-zinc-950/40 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-300/30 to-indigo-400/30 border border-white/15 flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <div className="font-semibold leading-5 text-white">
                Experiment Mode
              </div>
              <div className="text-[11px] text-white/60">
                Research Scientist Assistant
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            <button
              onClick={() => navigate("/")}
              className="text-sm px-3 py-2 rounded-xl transition border border-transparent text-white/80 hover:text-white hover:bg-white/5"
            >
              Home
            </button>
            <button
              onClick={() => navigate("/app")}
              className="text-sm px-3 py-2 rounded-xl transition border border-transparent text-white/80 hover:text-white hover:bg-white/5"
            >
              Dashboard
            </button>
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-12">
        {!results ? (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                <span>Killer Feature</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Design Your Experiment
              </h1>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Describe your research problem and let ARS suggest the perfect
                dataset, approach, and expected output — like a real scientist.
              </p>
            </div>

            {/* Input Form */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Problem Statement
                  </label>
                  <textarea
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="e.g., Detect fake news, Predict stock prices, Classify medical images..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition resize-none"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Research Domain
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {DOMAINS.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => setDomain(d.value)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                          domain === d.value
                            ? "bg-cyan-500 text-white"
                            : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                        }`}
                      >
                        <span className="block text-lg mb-1">{d.icon}</span>
                        <span className="text-xs">{d.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !problem.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold hover:from-cyan-400 hover:to-indigo-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                      <span>Generating Suggestions...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      <span>Generate Experiment Suggestions</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            {/* Results Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                <span>Suggestions Ready</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {results.problem}
              </h2>
              <div className="flex items-center justify-center gap-4 text-sm text-white/60">
                <span>Domain: {results.domain}</span>
                <span>•</span>
                <span>{results.suggestions.length} approaches suggested</span>
              </div>
            </div>

            {/* Suggestions Grid */}
            {!selectedSuggestion ? (
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {results.suggestions.map((suggestion, index) => (
                  <SuggestionCard
                    key={index}
                    suggestion={suggestion}
                    index={index}
                    onStart={handleStartExperiment}
                    onSelect={handleSelectSuggestion}
                  />
                ))}
              </div>
            ) : (
              <div className="max-w-4xl mx-auto mb-12">
                {/* Back Button */}
                <button
                  onClick={() => { setSelectedSuggestion(null); setAnalysis(null); }}
                  className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition"
                >
                  ← Back to Suggestions
                </button>

                <div className="bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                  {/* Analysis Header */}
                  <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 px-8 py-10 text-white">
                    <div className="flex items-center gap-2 text-white/80 text-sm font-medium mb-3">
                      <Sparkles className="h-4 w-4" />
                      <span>Detailed Analysis</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-4">{selectedSuggestion.approach}</h2>
                    <p className="text-white/90 text-lg leading-relaxed max-w-3xl">
                      {selectedSuggestion.approach_description}
                    </p>
                  </div>

                  <div className="p-8">
                    {analyzing ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="animate-spin h-10 w-10 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full" />
                        <p className="text-slate-600 font-medium">Agent is performing deep analysis...</p>
                      </div>
                    ) : analysis ? (
                      <div className="space-y-10">
                        {/* Phase 2: Analysis & Images */}
                        <div className="grid md:grid-cols-2 gap-10">
                          <div className="space-y-6">
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
                              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-800 mb-2">
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
                              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-rose-800 mb-2">
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

                          <div className="space-y-6">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                              <Image className="h-5 w-5 text-cyan-600" />
                              Visual Preview
                            </h3>
                            <div className="aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
                              <img
                                src={`${BACKEND_API}${analysis.preview_image_url}`}
                                alt="Research Visualization"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-sm font-medium">Conceptual View</span>
                              </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                              <h4 className="text-sm font-bold text-slate-900 mb-2">Visualization Plan</h4>
                              <div className="space-y-4">
                                {analysis?.visualization_plan?.map((plan, i) => (
                                  <div key={i} className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                      <BarChart3 className="h-4 w-4 text-indigo-500" />
                                      <span className="font-medium text-sm text-slate-900">Viz Component {i + 1}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                      {plan}
                                    </p>
                                  </div>
                                ))}
                                {(!analysis?.visualization_plan || analysis.visualization_plan.length === 0) && (
                                  <p className="text-sm text-slate-400 italic">No visualization plan available.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Phase 3: Implementation */}
                        <div className="pt-10 border-t border-slate-100">
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                                <Code className="h-5 w-5 text-indigo-600" />
                                Implementation Offer
                              </h3>
                              <p className="text-sm text-slate-500 mt-1">Ready-to-use Python baseline for Google Colab</p>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(analysis.code);
                                alert("Code copied to clipboard!");
                              }}
                              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2"
                            >
                              Copy Code
                            </button>
                          </div>
                          
                          <div className="relative rounded-2xl bg-slate-900 p-6 overflow-hidden">
                            <div className="flex items-center gap-2 mb-4 text-slate-400 font-mono text-xs border-b border-white/10 pb-4">
                              <div className="flex gap-1.5">
                                <div className="h-3 w-3 rounded-full bg-rose-500" />
                                <div className="h-3 w-3 rounded-full bg-amber-500" />
                                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                              </div>
                              <span className="ml-2">experiment_baseline.py</span>
                            </div>
                            <pre className="text-sm text-cyan-400 font-mono overflow-x-auto">
                              <code>{analysis.code}</code>
                            </pre>
                            
                            <div className="mt-8 flex justify-center">
                              <a
                                href="https://colab.research.google.com/notebooks/intro.ipynb"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold hover:shadow-lg transition transform hover:-translate-y-0.5"
                              >
                                <ExternalLink className="h-5 w-5" />
                                Open in Google Colab
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-rose-500">{error}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleNewExperiment}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition"
              >
                <Sparkles className="h-4 w-4" />
                <span>New Problem</span>
              </button>
              <button
                onClick={() => navigate("/app")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-medium hover:from-cyan-400 hover:to-indigo-400 transition"
              >
                <FlaskConical className="h-4 w-4" />
                <span>Go to Dashboard</span>
              </button>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-white/40">
          ARS Lab • Autonomous Research Agent • Experiment Mode
        </div>
      </footer>
    </div>
  );
}
