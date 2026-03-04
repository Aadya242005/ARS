import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

import { Canvas } from "@react-three/fiber";
import { Center, Environment, OrbitControls, useGLTF } from "@react-three/drei";

import { SoundButton } from "../context/SoundContext";
import { motion } from "framer-motion";

import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TimerReset,
  Layers,
  ExternalLink,
  Send,
} from "lucide-react";

import heroBg from "../assets/image.png";

import explore1 from "../assets/lit.png";
import explore2 from "../assets/research2.jpg";
import explore3 from "../assets/research3.jpg";
import explore4 from "../assets/research4.jpg";
import explore5 from "../assets/research5.png";

import ars1 from "../assets/lit.png";
import ars2 from "../assets/gap.jpg";
import ars3 from "../assets/exp.jpg";
import ars4 from "../assets/trace.png";

/* ---------------- animations ---------------- */
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const Pill = ({ children }) => (
  <span className="text-xs px-3 py-1.5 rounded-full bg-white/80 text-zinc-700 border border-zinc-200 backdrop-blur hover:bg-white transition">
    {children}
  </span>
);

const MiniTag = ({ children }) => (
  <span className="text-[11px] px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 hover:bg-zinc-200/60 transition">
    {children}
  </span>
);

/* ---------------- Chat Panel ---------------- */
function ChatPanel({
  listRef,
  messages,
  busy,
  input,
  setInput,
  sendMessage,
  onKeyDown,
  onBack,
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-[#ffe6dc] overflow-hidden">
      <div
        ref={listRef}
        className="h-[420px] sm:h-[520px] overflow-y-auto p-4 space-y-3 max-w-[50ch]"
      >
        {messages.map((m, idx) => {
          const isUser = m.role === "user";
          return (
            <div
              key={idx}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`w-full max-w-full rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? "bg-white border-2 border-black text-black"
                    : "bg-white/80 border border-zinc-200 text-zinc-800"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}

        {busy ? (
          <div className="flex justify-start">
            <div className="max-w-[70%] rounded-2xl px-4 py-3 text-sm bg-white/80 border border-zinc-200 text-zinc-700">
              Cora is thinking…
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-zinc-200 bg-white/60 p-3">
        <div className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Ask anything…"
            className="flex-1 max-w-[50ch] resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 outline-none focus:border-black"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-black bg-black text-white px-4 py-3 text-sm font-semibold hover:bg-zinc-900 transition disabled:opacity-60"
          >
            Send <Send className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 text-[11px] text-zinc-600">
          Powered by Gemini • Cognova (ARS)
        </div>

        <div className="mt-3 text-center">
          <button
            type="button"
            className="text-sm underline text-zinc-700"
            onClick={onBack}
          >
            ← Back to avatar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ✅ FeatureCard with image + step */
const FeatureCard = ({ img, icon: Icon, title, desc, index }) => (
  <motion.div
    variants={fadeUp}
    className="group rounded-3xl border border-zinc-200 bg-white overflow-hidden
               shadow-[0_14px_50px_-35px_rgba(0,0,0,0.25)]
               hover:shadow-[0_28px_90px_-45px_rgba(0,0,0,0.35)]
               hover:-translate-y-1 transition-all duration-300"
  >
    <div className="relative h-44 overflow-hidden">
      <img
        src={img}
        alt={title}
        className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.05]"
      />
      <div className="absolute top-4 left-4 bg-black text-white text-xs px-3 py-1 rounded-full font-semibold">
        0{index}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
    </div>

    <div className="p-6">
      <div className="flex items-center gap-3">
        <span className="h-10 w-10 rounded-2xl border border-zinc-200 bg-zinc-50 grid place-items-center">
          <Icon className="h-5 w-5 text-zinc-900" />
        </span>
        <div className="text-lg font-semibold text-zinc-900">{title}</div>
      </div>
      <p className="mt-3 text-sm text-zinc-600 leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

/* ✅ TopicCard */
const TopicCard = ({ title, desc, href, tags = [] }) => (
  <motion.a
    variants={fadeUp}
    href={href}
    target="_blank"
    rel="noreferrer"
    className="group relative rounded-3xl bg-white border-2 border-black overflow-hidden
               shadow-[0_10px_30px_-15px_rgba(0,0,0,0.18)]
               hover:-translate-y-1 hover:shadow-[0_22px_65px_-22px_rgba(0,0,0,0.32)]
               transition-all duration-300"
  >
    <div className="absolute top-0 left-0 h-[3px] w-full bg-black" />
    <div className="relative p-7">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-lg font-semibold text-black tracking-tight leading-snug">
          {title}
        </h4>
        <ExternalLink className="h-4 w-4 text-zinc-500 group-hover:text-black transition mt-1" />
      </div>

      <p className="mt-4 text-sm text-zinc-600 leading-relaxed line-clamp-4">
        {desc}
      </p>

      {tags?.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="text-[11px] px-3 py-1 rounded-full border border-black bg-white text-black
                         group-hover:bg-black group-hover:text-white transition"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-between">
        <span className="text-xs text-zinc-500">Open on Wikipedia</span>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-black">
          Read <ArrowRight className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-5 h-[2px] w-12 bg-black group-hover:w-full transition-all duration-500" />
    </div>
  </motion.a>
);

/* ===================== 3D MODEL ===================== */
function Model() {
  const { scene } = useGLTF("/models/pixellabs-robot-character-3317.glb");
  return (
    <Center>
      <primitive object={scene} scale={1.85} />
    </Center>
  );
}

class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-sm text-red-600 bg-white">
          <div className="font-semibold">3D model failed to load</div>
          <div className="mt-1 text-xs text-zinc-600">
            Check file path:{" "}
            <span className="font-mono">
              /models/pixellabs-robot-character-3317.glb
            </span>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
useGLTF.preload("/models/pixellabs-robot-character-3317.glb");

/* ===================== HOME ===================== */
export default function Home() {
  const TRENDING_TOPICS = useMemo(
    () => [
      {
        title: "Retrieval-Augmented Generation (RAG)",
        desc: "Ground LLM outputs using external knowledge sources (docs, PDFs, DBs) to reduce hallucinations and improve accuracy.",
        href: "https://en.wikipedia.org/wiki/Retrieval-augmented_generation",
        tags: ["LLMs", "Search", "Knowledge"],
      },
      {
        title: "Agentic AI",
        desc: "Autonomous systems that plan, use tools, take actions, and iterate toward a goal with feedback and memory.",
        href: "https://en.wikipedia.org/wiki/Intelligent_agent",
        tags: ["Tools", "Planning", "Autonomy"],
      },
      {
        title: "Causal Inference",
        desc: "Methods to estimate cause-effect relationships (not just correlations) for better decisions and experiments.",
        href: "https://en.wikipedia.org/wiki/Causal_inference",
        tags: ["Experiments", "Statistics", "Impact"],
      },
      {
        title: "Graph Neural Networks (GNNs)",
        desc: "Neural models for graph-structured data—useful for citations, knowledge graphs, molecules, networks, and recommendations.",
        href: "https://en.wikipedia.org/wiki/Graph_neural_network",
        tags: ["Graphs", "Deep Learning"],
      },
      {
        title: "Diffusion Models",
        desc: "Generative models powering modern image synthesis and increasingly used for video, audio, and scientific design tasks.",
        href: "https://en.wikipedia.org/wiki/Diffusion_model",
        tags: ["Generative", "Synthesis"],
      },
      {
        title: "Federated Learning",
        desc: "Train models across many devices/clients without moving raw data—useful for privacy-preserving ML at scale.",
        href: "https://en.wikipedia.org/wiki/Federated_learning",
        tags: ["Privacy", "Distributed"],
      },
    ],
    []
  );

  // Chat state
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi 👋 I’m Cora. Drop your goal prompt and I’ll start a Cognova research cycle.",
    },
  ]);

  // avatar OR chat
  const [showChat, setShowChat] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, busy]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || busy) return;

    const history = messages.slice(-8).map((x) => ({ role: x.role, text: x.text }));

    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setBusy(true);

    try {
      const res = await fetch("http://localhost:5050/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || data?.error || "Failed to get reply");

      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: `⚠️ I couldn't reach Gemini. Check backend is running on :5050.\n\nError: ${e.message}`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  /* ✅ Trending (compact by default, expand on click) */
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [topicFilter, setTopicFilter] = useState("All");
  const [topicQuery, setTopicQuery] = useState("");

  const filteredTopics = useMemo(() => {
    const q = topicQuery.trim().toLowerCase();

    const byQuery = !q
      ? TRENDING_TOPICS
      : TRENDING_TOPICS.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.desc.toLowerCase().includes(q) ||
            (t.tags || []).some((x) => x.toLowerCase().includes(q))
        );

    if (topicFilter === "All") return byQuery;

    const map = {
      "Gen AI": ["generative", "diffusion", "synthesis"],
      LLMs: ["llms", "rag", "transformers"],
      Graphs: ["graphs", "gnn"],
      Privacy: ["privacy", "federated"],
      Stats: ["statistics", "experiments", "impact", "causal"],
    };

    const keys = map[topicFilter] || [];
    return byQuery.filter((t) =>
      (t.tags || []).some((tag) =>
        keys.some((k) => tag.toLowerCase().includes(k))
      )
    );
  }, [TRENDING_TOPICS, topicQuery, topicFilter]);

  return (
    <div className="min-h-screen bg-[#f6f0e6]">
      {/* Soft background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(251,191,36,0.14),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.12),transparent_60%),radial-gradient(circle_at_55%_70%,rgba(59,130,246,0.10),transparent_60%)]" />
      </div>

      <Navbar />

      {/* ================= HERO ================= */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-10 md:pt-14">
          <div className="relative overflow-hidden rounded-[40px] border border-white/60 bg-white/55 backdrop-blur-xl shadow-[0_30px_90px_-55px_rgba(0,0,0,0.45)]">
            <div
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage: `url(${heroBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/55 via-white/70 to-white/90" />

            <div className="relative px-6 py-12 md:px-12 md:py-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                {/* Left */}
                <div className="pt-2">
                  <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border-2 border-zinc-900 bg-white/80 text-zinc-900 backdrop-blur">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Cognova — Powered by ARS
                  </div>

                  <h1 className="mt-5 text-4xl md:text-6xl font-semibold tracking-tight text-zinc-900 leading-[1.05]">
                    Advancing knowledge
                    <br className="hidden md:block" />
                    through research.
                  </h1>

                  <p className="mt-4 text-zinc-700 max-w-xl leading-relaxed">
                    A multi-agent research system that reads literature, proposes hypotheses,
                    designs experiments, evaluates results, and improves iteratively — with full explainability.
                  </p>

                  <div className="mt-7 flex flex-col sm:flex-row gap-3">
                    <SoundButton
                      className="group relative inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 text-white font-semibold transition overflow-hidden
                                 hover:-translate-y-0.5 hover:shadow-[0_18px_60px_-35px_rgba(0,0,0,0.55)]"
                      onClick={() => (window.location.href = "/app")}
                    >
                      <span className="relative flex items-center gap-2">
                        Start Research Cycle <ArrowRight className="h-4 w-4" />
                      </span>
                    </SoundButton>

                 
                  </div>
                </div>

                {/* Right panel */}
                <div className="hidden lg:block">
                  <div className="relative rounded-3xl bg-black text-white p-8 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.6)] overflow-hidden">
                    <div className="text-lg font-semibold tracking-tight">
                      Autonomous Research Cycle
                    </div>

                    <p className="mt-3 text-sm text-white/80 leading-relaxed">
                      One goal prompt → a complete cycle: ingest sources, find gaps, propose hypotheses,
                      design experiments, analyze results, and log every decision for transparency.
                    </p>

                    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                      <div className="text-xs text-white/60 mb-3">Pipeline</div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {["Ingest", "Extract", "Gap", "Hypothesis", "Experiment", "Analyze", "Validate", "Learn"].map(
                          (s) => (
                            <span
                              key={s}
                              className="px-3 py-1.5 rounded-full border border-white/15 bg-white/10 text-white/85 hover:bg-white/20 transition"
                            >
                              {s}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <section className="bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left hub */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              className="lg:col-span-6"
            >
              <div className="rounded-3xl border border-zinc-200 bg-white p-10 shadow-[0_20px_70px_-55px_rgba(0,0,0,0.35)]">
                

                <h2 className="mt-5 text-4xl md:text-5xl font-extrabold text-zinc-950 tracking-tight leading-[1.05]">
                  A hub for research <br /> and discovery
                </h2>

                <p className="mt-4 text-zinc-700 leading-relaxed text-[15px]">
                  Give a goal prompt once — ARS runs end-to-end research cycles autonomously, while keeping everything
                  explainable via decision logs and reasoning traces.
                </p>

                <div className="mt-5 rounded-2xl border border-zinc-900/10 bg-zinc-50 px-4 py-3">
                  <p className="text-sm text-zinc-800 italic leading-relaxed">
                    “One prompt in. A full research cycle out — with traceable reasoning at every step.”
                  </p>
                </div>

                <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                    <div className="flex items-center gap-2 font-semibold text-zinc-900">
                      <Layers className="h-4 w-4" /> Multi-agent pipeline
                    </div>
                    <div className="mt-1 text-sm text-zinc-600">Modular, scalable architecture</div>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                    <div className="flex items-center gap-2 font-semibold text-zinc-900">
                      <ShieldCheck className="h-4 w-4" /> Explainable outputs
                    </div>
                    <div className="mt-1 text-sm text-zinc-600">Decision logs + reasoning traces</div>
                  </div>
                </div>

                <Link
                  to="/about"
                  className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 text-white font-semibold hover:bg-zinc-800 hover:shadow-lg hover:-translate-y-0.5 transition"
                >
                  Explore usage <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            {/* Right: avatar OR chat */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              className="lg:col-span-6"
            >
              <div className="relative">
                <div className="pointer-events-none absolute -inset-8 -z-10">
                  <div className="absolute inset-0 rounded-[48px] bg-gradient-to-br from-rose-200/45 via-purple-200/30 to-sky-200/40 blur-2xl" />
                </div>

                <div className="rounded-[40px] border-2 border-black bg-white shadow-[0_26px_90px_-60px_rgba(0,0,0,0.45)] overflow-hidden">
                  <div className="px-6 pt-6 pb-4 border-b border-zinc-200 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-extrabold text-black">Cora</div>
                      <div className="text-xs text-zinc-500">Your Cognova research assistant</div>
                    </div>
                    <span className="text-[11px] px-3 py-1 rounded-full border-2 border-black bg-white text-black font-semibold">
                      Online
                    </span>
                  </div>

                  <div className="p-6">
                    {showChat ? (
                      <ChatPanel
                        listRef={listRef}
                        messages={messages}
                        busy={busy}
                        input={input}
                        setInput={setInput}
                        sendMessage={sendMessage}
                        onKeyDown={onKeyDown}
                        onBack={() => setShowChat(false)}
                      />
                    ) : (
                      <>
                        <div className="rounded-3xl border-2 border-black bg-white overflow-hidden">
                          <div className="h-[620px] w-full">
                            <ModelErrorBoundary>
                              <Canvas camera={{ position: [0, 1.1, 2.35], fov: 34 }}>
                                <ambientLight intensity={0.95} />
                                <directionalLight position={[6, 6, 6]} intensity={1.6} />
                                <directionalLight position={[-5, 4, 2]} intensity={0.9} />

                                <Suspense fallback={null}>
                                  <Model />
                                  <Environment preset="studio" />
                                </Suspense>

                                {/* ✅ SPEED UP ROTATION + DRAG FEEL */}
                                <OrbitControls
                                  enablePan={false}
                                  enableZoom={true}
                                  minDistance={1.9}
                                  maxDistance={3.6}
                                  autoRotate
                                  autoRotateSpeed={1.8}  // 🔥 was slow, now medium-fast
                                  rotateSpeed={1.15}     // faster drag rotate
                                  zoomSpeed={1.1}
                                  enableDamping
                                  dampingFactor={0.06}
                                />
                              </Canvas>
                            </ModelErrorBoundary>
                          </div>

                          <div className="px-4 py-3 border-t border-zinc-200 flex items-center justify-between text-sm">
                            <div className="text-black font-semibold">Interactive 3D agent</div>
                            <div className="text-zinc-500">Drag • Scroll • Rotate</div>
                          </div>
                        </div>

                        <div className="mt-3 text-center">
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-2xl border-2 border-black bg-black text-white px-4 py-2 text-sm font-semibold hover:bg-zinc-900 transition"
                            onClick={() => setShowChat(true)}
                          >
                            Chat <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    )}

                    <div className="mt-4 text-[11px] text-zinc-500">
                      Tip: Ask for: “Summarize this paper”, “Generate hypotheses”, “Design an experiment”, “Make a research plan”.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Enrich section */}
          <div className="mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                className="lg:col-span-6"
              >
                <div className="relative group">
                  <div className="grid grid-cols-6 gap-3">
                    {[
                      { src: explore1, span: "col-span-3", h: "h-44" },
                      { src: explore2, span: "col-span-3", h: "h-44" },
                      { src: explore3, span: "col-span-2", h: "h-28" },
                      { src: explore4, span: "col-span-2", h: "h-28" },
                      { src: explore5, span: "col-span-2", h: "h-28" },
                    ].map((img, idx) => (
                      <div key={idx} className={img.span}>
                        <img
                          src={img.src}
                          alt={`source ${idx + 1}`}
                          className={`w-full ${img.h} object-cover rounded-2xl border border-zinc-200 shadow-sm
                                      transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-r from-rose-200/30 via-purple-200/25 to-sky-200/30 blur-2xl opacity-80 group-hover:opacity-100 transition" />
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                className="lg:col-span-6"
              >
                <div className="max-w-xl">
                  <div className="text-xs font-semibold text-zinc-800">EXPLORE</div>
                  <h3 className="mt-3 text-3xl md:text-4xl font-semibold text-zinc-900 leading-tight tracking-tight">
                    Enrich your research with primary sources
                  </h3>
                  <p className="mt-4 text-zinc-600 leading-relaxed">
                    Upload your paper or notes — Cognova extracts key insights, matches related work,
                    identifies research gaps, and produces a clear conclusion with next steps.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {/* <Link
                      to="/about"
                      className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 font-semibold hover:bg-zinc-50 hover:shadow-md hover:-translate-y-0.5 transition"
                    >
                      Browse by collection
                    </Link> */}

                    <SoundButton
                      className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-zinc-900 text-white font-semibold hover:bg-zinc-800 hover:shadow-lg hover:-translate-y-0.5 transition"
                      onClick={() => (window.location.href = "/app")}
                    >
                      Start with an upload <ArrowRight className="h-4 w-4 ml-2" />
                    </SoundButton>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Trending topics (compact by default) */}
          <div className="mt-16">
            <div className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-zinc-200 bg-white text-zinc-700">
                    <Sparkles className="h-4 w-4" />
                    Trending topics
                  </div>
                  <div className="mt-2 text-xl font-extrabold text-zinc-950">
                    Explore research topics
                  </div>
                  <div className="mt-1 text-sm text-zinc-600">
                    Click a category to expand.
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {["Gen AI", "LLMs", "Graphs", "Privacy", "Stats"].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        setTopicFilter(chip);
                        setTopicsOpen(true);
                      }}
                      className="text-xs px-3 py-2 rounded-full border-2 border-black bg-white text-black font-semibold
                                 hover:bg-black hover:text-white transition"
                    >
                      {chip}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setTopicFilter("All");
                      setTopicQuery("");
                      setTopicsOpen((v) => !v);
                    }}
                    className="text-xs px-3 py-2 rounded-full border border-zinc-200 bg-white text-zinc-700 hover:border-black transition"
                  >
                    {topicsOpen ? "Close" : "View all"}
                  </button>
                </div>
              </div>

              {topicsOpen ? (
                <div className="mt-5 rounded-3xl border border-zinc-200 bg-white p-4">
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="text-sm font-semibold text-zinc-900">
                      Showing: <span className="font-extrabold">{topicFilter}</span>{" "}
                      <span className="text-zinc-500 font-normal">
                        ({filteredTopics.length})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2">
                      <input
                        value={topicQuery}
                        onChange={(e) => setTopicQuery(e.target.value)}
                        placeholder="Search…"
                        className="w-full bg-transparent outline-none text-sm text-zinc-900 placeholder:text-zinc-500"
                      />
                    </div>
                  </div>

                  <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    transition={{ staggerChildren: 0.06 }}
                    className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {filteredTopics.slice(0, 6).map((t) => (
                      <TopicCard
                        key={t.title}
                        title={t.title}
                        desc={t.desc}
                        href={t.href}
                        tags={t.tags}
                      />
                    ))}
                  </motion.div>

                  {filteredTopics.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
                      No topics match your search. Try a different keyword.
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-xs text-zinc-600 flex items-center gap-2">
                      <TimerReset className="h-4 w-4" />
                      Tip: Open a topic → ask Cognova to summarize.
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTopicFilter("All");
                          setTopicQuery("");
                        }}
                        className="text-xs px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:border-black transition"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => setTopicsOpen(false)}
                        className="text-xs px-3 py-2 rounded-xl border-2 border-black bg-black text-white font-semibold hover:bg-zinc-900 transition"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* End-to-end with images */}
          <div className="mt-16">
            <h3 className="text-2xl font-semibold text-zinc-900 text-center tracking-tight">
              What ARS does end-to-end
            </h3>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ staggerChildren: 0.08 }}
              className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <FeatureCard
                img={ars1}
                icon={Sparkles}
                index={1}
                title="Autonomous Literature Understanding"
                desc="Extracts methods, results, limitations and builds a structured memory."
              />
              <FeatureCard
                img={ars2}
                icon={ShieldCheck}
                index={2}
                title="Gap Detection & Hypothesis Generation"
                desc="Detects contradictions and underexplored areas to propose novel hypotheses."
              />
              <FeatureCard
                img={ars3}
                icon={Layers}
                index={3}
                title="Experiment Design & Execution"
                desc="Creates reproducible experiment plans and runs simulations/training automatically."
              />
              <FeatureCard
                img={ars4}
                icon={TimerReset}
                index={4}
                title="Explainability & Traceability"
                desc="Maintains decision logs and reasoning traces for every step of the cycle."
              />
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}