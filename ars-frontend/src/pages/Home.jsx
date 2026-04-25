import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

import { Canvas } from "@react-three/fiber";
import { Center, Environment, OrbitControls, useGLTF } from "@react-three/drei";

import { SoundButton } from "../context/SoundContext";
import { motion, useScroll, useTransform } from "framer-motion";

import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TimerReset,
  Layers,
  ExternalLink,
  Send,
  Activity
} from "lucide-react";

import { RevealOnScroll, StaggerContainer, StaggerItem, CountUp } from "../components/ScrollReveal";

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

/* ---------------- Chat Panel ---------------- */
function ChatPanel({ listRef, messages, busy, input, setInput, sendMessage, onKeyDown, onBack }) {
  return (
    <div className="rounded-3xl border border-white/[0.1] bg-black/40 backdrop-blur-xl overflow-hidden shadow-glow-cyan">
      <div ref={listRef} className="h-[420px] sm:h-[520px] overflow-y-auto p-4 space-y-4 font-mono text-xs">
        {messages.map((m, idx) => {
          const isUser = m.role === "user";
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed border ${
                  isUser
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-50"
                    : "bg-white/[0.05] border-white/[0.1] text-white/80"
                }`}
              >
                {m.text}
              </div>
            </motion.div>
          );
        })}
        {busy && (
          <div className="flex justify-start">
            <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-white/[0.05] border border-white/[0.1] text-cyan-400 animate-pulse flex items-center gap-2">
              <span className="h-2 w-2 bg-cyan-400 rounded-full" /> Synthesizing data...
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/[0.1] bg-black/60 p-3">
        <div className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Initialize query..."
            className="flex-1 resize-none rounded-2xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all font-mono"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 text-black px-4 py-3 text-sm font-bold hover:bg-cyan-400 transition hover:shadow-glow-cyan disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex justify-between items-center px-2">
          <button type="button" className="text-[10px] uppercase tracking-wider text-white/40 hover:text-white transition" onClick={onBack}>
            ← System Interface
          </button>
          <div className="text-[10px] text-white/30 font-mono">STATUS: ONLINE</div>
        </div>
      </div>
    </div>
  );
}

/* ✅ FeatureCard */
const FeatureCard = ({ img, icon: Icon, title, desc, index }) => (
  <StaggerItem className="group relative rounded-[2rem] border border-white/[0.08] bg-black/40 backdrop-blur-md overflow-hidden transition-all duration-500 hover:border-cyan-500/30 hover:shadow-glow-cyan">
    <div className="relative h-56 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
      <img
        src={img}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
      />
      <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full border border-white/20 bg-white/10 backdrop-blur flex items-center justify-center text-xs font-mono font-bold text-white">
          0{index}
        </div>
        <div className="h-[1px] w-12 bg-white/20 group-hover:w-24 group-hover:bg-cyan-500 transition-all duration-700" />
      </div>
    </div>

    <div className="p-8 relative z-20 -mt-8">
      <div className="flex items-center gap-4 mb-4">
        <span className="h-12 w-12 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center shadow-lg">
          <Icon className="h-6 w-6 text-cyan-400" />
        </span>
        <h3 className="text-xl font-display font-semibold text-white group-hover:text-cyan-50 transition-colors">
          {title}
        </h3>
      </div>
      <p className="text-white/60 leading-relaxed text-sm">
        {desc}
      </p>
    </div>
  </StaggerItem>
);

/* ✅ TopicCard */
const TopicCard = ({ title, desc, href, tags = [] }) => (
  <StaggerItem className="group relative rounded-3xl bg-white/[0.02] border border-white/[0.08] overflow-hidden transition-all duration-500 hover:border-purple-500/30 hover:shadow-glow-purple backdrop-blur-sm p-8">
    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <div className="flex justify-between items-start mb-6">
      <h4 className="text-xl font-display font-semibold text-white leading-tight pr-4">
        {title}
      </h4>
      <ExternalLink className="h-5 w-5 text-white/30 group-hover:text-purple-400 transition shrink-0" />
    </div>

    <p className="text-sm text-white/60 leading-relaxed mb-6 line-clamp-3">
      {desc}
    </p>

    <div className="flex flex-wrap gap-2 mb-8">
      {tags.map((t) => (
        <span key={t} className="text-[10px] px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-white/50 group-hover:border-purple-500/20 group-hover:text-purple-300 transition uppercase tracking-wider font-semibold">
          {t}
        </span>
      ))}
    </div>

    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-white/80 group-hover:text-white transition">
      Explore Concept <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
    </a>
  </StaggerItem>
);

/* ===================== 3D MODEL ===================== */
function Model() {
  const { scene } = useGLTF("/models/pixellabs-robot-character-3317.glb");
  return (
    <Center>
      <primitive object={scene} scale={2} />
    </Center>
  );
}

class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return (
      <div className="w-full h-full flex flex-col items-center justify-center text-sm text-rose-400 font-mono">
        <div>[System Error: Model failed to load]</div>
      </div>
    );
    return this.props.children;
  }
}
useGLTF.preload("/models/pixellabs-robot-character-3317.glb");

/* ===================== HOME ===================== */
export default function Home() {
  const { scrollYProgress } = useScroll();
  const yHeroBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  
  const TRENDING_TOPICS = useMemo(() => [
    { title: "Retrieval-Augmented Generation (RAG)", desc: "Ground LLM outputs using external knowledge sources to reduce hallucinations and improve accuracy.", href: "https://en.wikipedia.org/wiki/Retrieval-augmented_generation", tags: ["LLMs", "Search"] },
    { title: "Agentic AI", desc: "Autonomous systems that plan, use tools, take actions, and iterate toward a goal with feedback and memory.", href: "https://en.wikipedia.org/wiki/Intelligent_agent", tags: ["Autonomy", "Agents"] },
    { title: "Causal Inference", desc: "Methods to estimate cause-effect relationships for better decisions and experiments.", href: "https://en.wikipedia.org/wiki/Causal_inference", tags: ["Statistics", "Impact"] },
    { title: "Graph Neural Networks (GNNs)", desc: "Neural models for graph-structured data—useful for citations, knowledge graphs, and networks.", href: "https://en.wikipedia.org/wiki/Graph_neural_network", tags: ["Graphs", "Deep Learning"] },
    { title: "Diffusion Models", desc: "Generative models powering modern image synthesis and increasingly used for scientific design tasks.", href: "https://en.wikipedia.org/wiki/Diffusion_model", tags: ["Generative"] },
    { title: "Federated Learning", desc: "Train models across many devices/clients without moving raw data—useful for privacy ML.", href: "https://en.wikipedia.org/wiki/Federated_learning", tags: ["Privacy", "Distributed"] },
  ], []);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "System online. Initializing ARS protocols. How can I assist your research today?" },
  ]);
  const [showChat, setShowChat] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, busy]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || busy) return;
    const history = messages.slice(-8).map((x) => ({ role: x.role, text: x.text }));
    setInput(""); setMessages((m) => [...m, { role: "user", text }]); setBusy(true);

    try {
      const res = await fetch("http://localhost:5050/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || data?.error || "Failed to get reply");
      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", text: `[ERR]: Backend connection failed.` }]);
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }

  return (
    <div className="min-h-screen bg-lab-950 text-white selection:bg-cyan-500/30 overflow-hidden font-sans">
      
      {/* Animated grid background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PHBhdGggZD0iTSAxMCAwIEwgMTAgNDAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2dyaWQpIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiLz48L3N2Zz4=')]" />
        <div className="absolute inset-0 bg-gradient-to-b from-lab-950 via-transparent to-lab-950" />
      </div>

      <Navbar />

      {/* ================= HERO (PARALLAX) ================= */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-32">
        <motion.div style={{ y: yHeroBg }} className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,240,255,0.15),transparent_60%),radial-gradient(circle_at_80%_60%,rgba(168,85,247,0.1),transparent_50%)]" />
        </motion.div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-7">
            <RevealOnScroll direction="up" delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold mb-8 uppercase tracking-widest shadow-glow-cyan">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                System v2.0 Online
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={0.2}>
              <h1 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-display font-bold leading-[1.05] tracking-tight mb-6">
                Automating <br/>
                <span className="shimmer-text">Scientific Discovery.</span>
              </h1>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={0.3}>
              <p className="text-lg text-white/60 max-w-2xl leading-relaxed mb-10 font-light">
                ARS is a 7-agent neural framework that ingests raw literature, 
                detects knowledge gaps, proposes novel hypotheses, runs automated 
                experiments, and synthesizes data—all with full statistical transparency.
              </p>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4">
                <SoundButton
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-sm transition-all overflow-hidden hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                  onClick={() => (window.location.href = "/app")}
                >
                  <span>Initialize Pipeline</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </SoundButton>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/20 bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-all backdrop-blur"
                >
                  Read the Paper
                </Link>
              </div>
            </RevealOnScroll>
            
            <RevealOnScroll direction="up" delay={0.6}>
              <div className="mt-16 flex items-center gap-8 border-t border-white/10 pt-8">
                <div>
                  <div className="text-3xl font-mono font-bold text-cyan-400"><CountUp value={7} />+</div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">Specialized Agents</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <div className="text-3xl font-mono font-bold text-purple-400"><CountUp value={100} suffix="%" /></div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">Traceable Reasoning</div>
                </div>
                <div className="w-px h-10 bg-white/10 hidden sm:block" />
                <div className="hidden sm:block">
                  <div className="text-3xl font-mono font-bold text-emerald-400">Groq</div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">LPU Inference</div>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          <div className="lg:col-span-5 relative">
            <RevealOnScroll direction="left" delay={0.3}>
              <div className="relative z-10 w-full aspect-square rounded-[3rem] border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-1 backdrop-blur-xl shadow-2xl">
                <div className="absolute inset-0 bg-cyan-500/5 blur-3xl rounded-full" />
                <div className="w-full h-full rounded-[2.5rem] bg-black/60 overflow-hidden relative">
                  
                  {/* Avatar / Chat logic inside Hero */}
                  {showChat ? (
                    <div className="absolute inset-0 z-20">
                      <ChatPanel
                        listRef={listRef} messages={messages} busy={busy}
                        input={input} setInput={setInput} sendMessage={sendMessage}
                        onKeyDown={onKeyDown} onBack={() => setShowChat(false)}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                        <div>
                          <div className="text-xs font-bold text-white tracking-widest uppercase">CORA.v2</div>
                          <div className="text-[10px] text-cyan-400 font-mono">IDLE / AWAITING INPUT</div>
                        </div>
                        <Activity className="text-cyan-500 h-5 w-5 animate-pulse" />
                      </div>
                      
                      <ModelErrorBoundary>
                        <Canvas camera={{ position: [0, 1.1, 2.35], fov: 34 }}>
                          <ambientLight intensity={0.95} />
                          <directionalLight position={[6, 6, 6]} intensity={1.6} />
                          <Environment preset="city" />
                          <Suspense fallback={null}><Model /></Suspense>
                          <OrbitControls enablePan={false} autoRotate autoRotateSpeed={2.5} maxDistance={4} minDistance={2} />
                        </Canvas>
                      </ModelErrorBoundary>

                      <div className="absolute bottom-6 left-6 right-6 z-10">
                        <button onClick={() => setShowChat(true)} className="w-full py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-sm font-bold text-white hover:bg-white/20 transition-all shadow-[0_0_30px_rgba(0,240,255,0.1)] flex items-center justify-center gap-3 group">
                          Establish Uplink <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </RevealOnScroll>
          </div>

        </div>
      </section>

      {/* ================= ARCHITECTURE PIPELINE ================= */}
      <section className="py-32 relative border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto px-6">
          <RevealOnScroll direction="up">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest mb-4">Core Architecture</h2>
              <h3 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">The 7-Agent Research Cycle</h3>
              <p className="text-white/50 text-lg font-light">From raw document ingestion to statistically validated conclusions, every phase is handled by specialized neural nodes.</p>
            </div>
          </RevealOnScroll>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard img={ars1} icon={Sparkles} index={1} title="Literature Extraction" desc="Processes complex PDFs and extracts variables, methodologies, and findings via dense retrieval." />
            <FeatureCard img={ars2} icon={ShieldCheck} index={2} title="Hypothesis Gen" desc="Identifies contradictions and knowledge gaps to formulate mathematically testable predictions." />
            <FeatureCard img={ars3} icon={Layers} index={3} title="Experiment Design" desc="Architects simulation protocols, defines control variables, and establishes baseline metrics." />
            <FeatureCard img={ars4} icon={TimerReset} index={4} title="Validation & Proof" desc="Executes rigorous statistical checks (p-values) and flags potential data leakage." />
          </StaggerContainer>
        </div>
      </section>

      {/* ================= DATA PROCESSING / EXPLORE ================= */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <RevealOnScroll direction="left">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img src={explore1} alt="Vis 1" className="w-full h-48 object-cover rounded-3xl border border-white/10" />
                  <img src={explore3} alt="Vis 3" className="w-full h-64 object-cover rounded-3xl border border-white/10" />
                </div>
                <div className="space-y-4 mt-8">
                  <img src={explore2} alt="Vis 2" className="w-full h-64 object-cover rounded-3xl border border-white/10" />
                  <img src={explore4} alt="Vis 4" className="w-full h-48 object-cover rounded-3xl border border-white/10" />
                </div>
              </div>
            </RevealOnScroll>
          </div>
          
          <div>
            <RevealOnScroll direction="right">
              <h2 className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-widest mb-4">Deep Analytics</h2>
              <h3 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">Beyond text generation. Real statistics.</h3>
              <p className="text-white/60 text-lg leading-relaxed font-light mb-8">
                Unlike standard LLMs that generate superficial summaries, ARS actively processes metrics. 
                It creates heatmaps of attention weights, computes statistical significance (p-values) against baselines, 
                and visualizes probability distributions for its findings.
              </p>
              <ul className="space-y-4 mb-10">
                {['Attention Matrix Visualization', 'Confidence Distribution Plots', 'Automated A/B Testing Protocols'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-white/80 text-sm font-medium">
                    <span className="h-5 w-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/app" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-400 transition hover:shadow-glow-purple">
                View Live Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ================= TRENDING ================= */}
      <section className="py-32 bg-black/60 border-t border-white/5 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-6">
          <RevealOnScroll direction="up" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Explore Research Vectors</h2>
            <p className="text-white/50">Current high-velocity topics traversing the ARS pipeline.</p>
          </RevealOnScroll>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRENDING_TOPICS.map((t) => (
              <TopicCard key={t.title} {...t} />
            ))}
          </StaggerContainer>
        </div>
      </section>

      <Footer />
    </div>
  );
}