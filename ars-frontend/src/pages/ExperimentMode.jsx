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

function SuggestionCard({ suggestion, index }) {
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

        <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-100">
          <button className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition">
            Start Experiment <ArrowRight className="h-4 w-4" />
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

  const handleNewExperiment = () => {
    setProblem("");
    setResults(null);
    setError("");
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
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {results.suggestions.map((suggestion, index) => (
                <SuggestionCard
                  key={index}
                  suggestion={suggestion}
                  index={index}
                />
              ))}
            </div>

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
