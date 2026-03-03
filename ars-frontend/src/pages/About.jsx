import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Section from "../components/Section";
import emo from "../assets/image2.png";
import { CheckCircle2, Search, SlidersHorizontal, ExternalLink } from "lucide-react";

import flowVideo from "../assets/video.mp4";

const Pill = ({ children }) => (
  <span className="text-xs px-3 py-1.5 rounded-full border border-zinc-200 bg-blue-50 text-blue-700">
    {children}
  </span>
);

const PAPERS = [
  {
    type: "ARTICLE",
    title: "Attention Is All You Need",
    source: "NeurIPS 2017",
    tag: "Transformers",
    year: 2017,
    link: "https://arxiv.org/abs/1706.03762",
  },
  {
    type: "ARTICLE",
    title: "BERT: Pre-training of Deep Bidirectional Transformers",
    source: "NAACL 2019",
    tag: "NLP",
    year: 2019,
    link: "https://arxiv.org/abs/1810.04805",
  },
  {
    type: "ARTICLE",
    title: "Deep Residual Learning for Image Recognition (ResNet)",
    source: "CVPR 2016",
    tag: "Vision",
    year: 2016,
    link: "https://arxiv.org/abs/1512.03385",
  },
  {
    type: "ARTICLE",
    title: "Generative Adversarial Nets (GANs)",
    source: "NeurIPS 2014",
    tag: "Generative AI",
    year: 2014,
    link: "https://arxiv.org/abs/1406.2661",
  },
  {
    type: "ARTICLE",
    title: "Language Models are Few-Shot Learners (GPT-3)",
    source: "NeurIPS 2020",
    tag: "LLMs",
    year: 2020,
    link: "https://arxiv.org/abs/2005.14165",
  },
  {
    type: "ARTICLE",
    title: "ImageNet Classification with Deep CNNs (AlexNet)",
    source: "NeurIPS 2012",
    tag: "Deep Learning",
    year: 2012,
    link: "https://dl.acm.org/doi/10.1145/3065386",
  },
];

const ResultCard = ({ p }) => (
  <a
    href={p.link}
    target="_blank"
    rel="noreferrer"
    className="group relative rounded-2xl border border-zinc-200 bg-blue-50 overflow-hidden
               transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
  >
    {/* glow on hover */}
    <div className="pointer-events-none absolute -inset-24 opacity-0 group-hover:opacity-100 transition duration-500">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-200/50 via-cyan-200/40 to-indigo-200/50 blur-3xl" />
    </div>

    <div className="relative p-5">
      <div className="text-xs font-semibold text-zinc-500 tracking-wide">{p.type}</div>

      <div className="mt-2 text-lg font-semibold text-zinc-900 leading-snug line-clamp-2">
        {p.title}
      </div>

      <div className="mt-2 text-sm text-zinc-600">{p.source}</div>

      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
          {p.tag}
        </span>
        <span className="text-xs px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
          {p.year}
        </span>

        <span className="ml-auto inline-flex items-center gap-1 text-xs text-zinc-500 group-hover:text-zinc-900">
          Open <ExternalLink className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  </a>
);

export default function About() {
  const [query, setQuery] = useState("");
  const [contentType, setContentType] = useState("All Content");
  const [selectedTags, setSelectedTags] = useState([]);
  const [yearFrom, setYearFrom] = useState(2012);
  const [yearTo, setYearTo] = useState(2025);

  const tags = useMemo(() => {
    const set = new Set(PAPERS.map((p) => p.tag));
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return PAPERS.filter((p) => {
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.source.toLowerCase().includes(q) ||
        p.tag.toLowerCase().includes(q);

      const matchesType = contentType === "All Content" || p.type === contentType;
      const matchesTags = selectedTags.length === 0 || selectedTags.includes(p.tag);
      const matchesYear = p.year >= yearFrom && p.year <= yearTo;

      return matchesQuery && matchesType && matchesTags && matchesYear;
    });
  }, [query, contentType, selectedTags, yearFrom, yearTo]);

  const toggleTag = (t) => {
    setSelectedTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  return (
    <div className="relative min-h-screen bg-blue-50 text-zinc-900 overflow-hidden">
      {/* page-wide glow blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 bg-cyan-300/25 rounded-full blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[520px] w-[520px] bg-indigo-300/25 rounded-full blur-3xl animate-pulse" />

      <Navbar />

      {/* ===== HERO (with glow + emo image) ===== */}
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-6 relative">
        <div className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 p-8 shadow-md
                        transition duration-300 hover:shadow-2xl hover:-translate-y-1">
          {/* hover glow */}
          <div className="pointer-events-none absolute -inset-24 opacity-0 group-hover:opacity-100 transition duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-300/35 via-blue-300/30 to-indigo-300/35 blur-3xl" />
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* LEFT */}
            <div>
              <div className="flex flex-wrap gap-2">
                <Pill>Multi-Agent System</Pill>
                <Pill>Autonomous Research Loop</Pill>
                <Pill>Experiment + Evaluation</Pill>
                <Pill>Decision Logs</Pill>
              </div>

              <h1 className="mt-5 text-3xl md:text-4xl font-semibold leading-tight">
                Innovation in Research —{" "}
                <span className="text-cyan-700">powered by autonomous agents</span>
              </h1>

              <p className="mt-3 text-zinc-600 max-w-3xl leading-relaxed">
                ARS automates the research workflow: it reads papers, identifies gaps, generates hypotheses,
                designs experiments, evaluates outcomes, and improves over iterations — with full explainability.
              </p>
            </div>

            {/* RIGHT emo image */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-blue-200/40 via-cyan-200/30 to-indigo-200/40 blur-3xl opacity-70" />
              <img
                src={emo}
                alt="ARS illustration"
                className="relative w-72 md:w-[420px] rounded-3xl border border-zinc-200 shadow-xl
                           hover:scale-[1.03] transition duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== HOW IT WORKS ===== */}
      <Section
        title="How ARS works"
        subtitle="A complete research cycle that repeats and improves over time."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video */}
          <div className="group relative rounded-3xl border border-zinc-200 bg-blue-50 p-5 shadow-sm
                          transition duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
            {/* hover glow */}
            <div className="pointer-events-none absolute -inset-24 opacity-0 group-hover:opacity-100 transition duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-200/35 via-blue-200/30 to-indigo-200/35 blur-3xl" />
            </div>

            <div className="relative">
              <div className="text-sm font-semibold mb-3 text-zinc-900">Workflow overview</div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 overflow-hidden">
                <video
                  src={flowVideo}
                  className="rounded-xl w-full object-contain"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                />
              </div>

              <div className="mt-4 text-xs text-zinc-500">
                Keep this model consistent across app screens and pitch deck.
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="group relative rounded-3xl border border-zinc-200 bg-blue-50 p-6 shadow-sm
                          transition duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
            {/* hover glow */}
            <div className="pointer-events-none absolute -inset-24 opacity-0 group-hover:opacity-100 transition duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-200/35 via-cyan-200/25 to-indigo-200/35 blur-3xl" />
            </div>

            <div className="relative">
              <div className="font-semibold text-lg">Research Cycle</div>
              <ol className="mt-4 space-y-3 text-sm text-zinc-700">
                {[
                  "User uploads research document",
                  "AI analyzes and extracts insights",
                  "System matches with research database",
                  "Gap detection & contradiction analysis",
                  "Hypothesis generation + novelty scoring",
                  "Conclusion with suggested next steps",
                ].map((x) => (
                  <li key={x} className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span>{x}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </Section>

      {/* ===== EXPLORE LIBRARY ===== */}
      <section className="bg-white text-zinc-900">
        <div className="border-b border-zinc-200">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl md:text-3xl font-semibold">Explore Research Library</h2>
              <button className="text-sm underline text-zinc-700 hover:text-zinc-900">
                Advanced Search
              </button>
            </div>

            <div className="mt-6 flex flex-col md:flex-row gap-3">
              <div className="md:w-56">
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full h-12 rounded-xl border border-zinc-300 bg-blue-50 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option>All Content</option>
                  <option>ARTICLE</option>
                </select>
              </div>

              <div className="flex-1 relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search journals, papers, books, datasets..."
                  className="w-full h-12 rounded-xl border border-zinc-300 bg-blue-50 pl-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-3">
              <div className="sticky top-24">
                <div className="group relative rounded-2xl border border-zinc-200 bg-blue-50 p-5 shadow-sm
                                transition duration-300 hover:shadow-xl overflow-hidden">
                  <div className="pointer-events-none absolute -inset-24 opacity-0 group-hover:opacity-100 transition duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-200/35 via-cyan-200/25 to-indigo-200/35 blur-3xl" />
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4 text-zinc-700" />
                      <div className="font-semibold">Filters</div>
                    </div>

                    <div className="mt-5">
                      <div className="text-xs font-semibold text-zinc-500">TOPICS</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {tags.map((t) => {
                          const active = selectedTags.includes(t);
                          return (
                            <button
                              key={t}
                              onClick={() => toggleTag(t)}
                              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                                active
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100"
                              }`}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="text-xs font-semibold text-zinc-500">YEAR</div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-[11px] text-zinc-500 mb-1">From</div>
                          <input
                            type="number"
                            value={yearFrom}
                            onChange={(e) => setYearFrom(Number(e.target.value))}
                            className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                          />
                        </div>
                        <div>
                          <div className="text-[11px] text-zinc-500 mb-1">To</div>
                          <input
                            type="number"
                            value={yearTo}
                            onChange={(e) => setYearTo(Number(e.target.value))}
                            className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setQuery("");
                        setContentType("All Content");
                        setSelectedTags([]);
                        setYearFrom(2012);
                        setYearTo(2025);
                      }}
                      className="mt-6 w-full h-11 rounded-xl border border-zinc-200 bg-blue-50 hover:bg-blue-100 transition text-sm font-medium"
                    >
                      Reset filters
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Results */}
            <main className="lg:col-span-9">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-zinc-600">
                  Showing{" "}
                  <span className="font-semibold text-zinc-900">{filtered.length}</span>{" "}
                  results
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((p) => (
                  <ResultCard key={p.title} p={p} />
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="mt-10 rounded-2xl border border-zinc-200 bg-blue-50 p-6 text-zinc-700">
                  No results found. Try changing keywords or filters.
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}