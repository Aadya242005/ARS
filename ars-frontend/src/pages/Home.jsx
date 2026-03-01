import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import Avatar3D from "../components/Avatar3D";
import heroBg from "../assets/bg1.jpg";

import { SoundButton } from "../context/SoundContext";
import { motion } from "framer-motion";

import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TimerReset,
  Layers,
} from "lucide-react";

import explore1 from "../assets/research1.jpg";
import explore2 from "../assets/research2.jpg";
import explore3 from "../assets/research3.jpg";
import explore4 from "../assets/research4.jpg";
import explore5 from "../assets/research5.png";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

const Bullet = ({ children }) => (
  <div className="flex gap-3 group">
    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5 group-hover:scale-110 transition" />
    <p className="text-sm text-zinc-700 leading-relaxed">{children}</p>
  </div>
);

const Pill = ({ children }) => (
  <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition">
    {children}
  </span>
);

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <motion.div
    variants={fadeUp}
    className="group relative rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm overflow-hidden
               hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
  >
    {/* glow */}
    <div className="pointer-events-none absolute -inset-24 opacity-0 group-hover:opacity-100 transition duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-200/40 via-cyan-200/30 to-indigo-200/40 blur-3xl" />
    </div>

    <div className="relative">
      <div className="inline-flex items-center gap-2 text-zinc-900 font-semibold">
        <span className="h-10 w-10 rounded-2xl border border-zinc-200 bg-zinc-50 grid place-items-center
                         group-hover:scale-105 transition">
          <Icon className="h-5 w-5 text-blue-600" />
        </span>
        <span className="text-lg">{title}</span>
      </div>
      <div className="mt-2 text-sm text-zinc-600 leading-relaxed">{desc}</div>

      <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-700 opacity-0 group-hover:opacity-100 transition">
        Learn more <ArrowRight className="h-4 w-4" />
      </div>
    </div>
  </motion.div>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div
          className="h-[560px] w-full"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.92)), url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* animated glow blobs */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute inset-0"
        >
          <motion.div
            className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-28 -right-28 h-[520px] w-[520px] rounded-full bg-indigo-400/15 blur-3xl"
            animate={{ x: [0, -25, 0], y: [0, -15, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <div className="absolute inset-0">
          <div className="mx-auto max-w-6xl px-4 pt-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              {/* LEFT */}
              <div className="pt-10">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full
                             border border-white/15 bg-white/5 text-white/80 backdrop-blur"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Autonomous Research System (ARS)
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.05 }}
                  className="mt-5 text-4xl md:text-5xl font-semibold text-white leading-tight"
                >
                  Advancing knowledge <br className="hidden md:block" />
                  through research.
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.12 }}
                  className="mt-4 text-white/75 max-w-xl leading-relaxed"
                >
                  A multi-agent research system that reads literature, proposes hypotheses,
                  designs experiments, evaluates results, and improves iteratively — with full explainability.
                </motion.p>

                {/* Buttons */}
                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <SoundButton
                    className="group relative inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl
                               bg-white text-zinc-900 font-semibold transition overflow-hidden
                               hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(255,255,255,0.18)]"
                    onClick={() => (window.location.href = "/app")}
                  >
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition
                                     bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
                    <span className="relative flex items-center gap-2">
                      Start Research Cycle <ArrowRight className="h-4 w-4" />
                    </span>
                  </SoundButton>

                  <SoundButton
                    className="inline-flex items-center justify-center px-5 py-3 rounded-xl
                               border border-white/20 bg-white/5 text-white backdrop-blur transition
                               hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                    onClick={() => (window.location.href = "/about")}
                  >
                    Learn More
                  </SoundButton>
                </div>

                {/* tags */}
                <div className="mt-9 flex flex-wrap gap-3">
                  <Pill>7 Agents</Pill>
                  <Pill>Decision Logs</Pill>
                  <Pill>Reasoning Traces</Pill>
                  <Pill>Self-Improving</Pill>
                </div>
              </div>

              {/* RIGHT PANEL */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="hidden lg:block pt-12"
              >
                <div className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 overflow-hidden">
                  <div className="pointer-events-none absolute -inset-24 opacity-0 group-hover:opacity-100 transition duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-300/10 via-indigo-300/10 to-emerald-300/10 blur-3xl" />
                  </div>

                  <div className="relative">
                    <div className="text-white font-semibold">Autonomous Research Cycle</div>
                    <p className="mt-2 text-sm text-white/75 leading-relaxed">
                      ARS starts after your initial goal prompt and completes the full cycle automatically.
                      Every decision is logged for transparency and auditing.
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      {[
                        ["Input", "Goal Prompt"],
                        ["Output", "Hypothesis + Justification"],
                        ["Explainability", "Reasoning Traces"],
                        ["Iteration", "Self-Improvement"],
                      ].map(([k, v]) => (
                        <div
                          key={k}
                          className="rounded-xl border border-white/10 bg-black/20 p-4 hover:bg-black/30 transition"
                        >
                          <div className="text-xs text-white/60">{k}</div>
                          <div className="mt-1 text-sm text-white font-medium">{v}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
                      <div className="text-xs text-white/60 mb-2">Pipeline</div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {["Ingest", "Extract", "Gap", "Hypothesis", "Experiment", "Analyze", "Validate", "Learn"].map(
                          (s) => (
                            <span
                              key={s}
                              className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/80
                                         hover:bg-white/10 transition"
                            >
                              {s}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-white/55">
                      Note: Live stats/logs will appear once backend integration is connected.
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHITE SECTION ================= */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left card */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              variants={fadeUp}
              className="lg:col-span-6"
            >
              <div className="group relative rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm overflow-hidden
                              hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="pointer-events-none absolute -inset-24 opacity-0 group-hover:opacity-100 transition duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-200/40 via-cyan-200/30 to-indigo-200/40 blur-3xl" />
                </div>

                <div className="relative">
                  <div className="text-xs font-semibold text-blue-600 tracking-wide">
                    AUTONOMOUS RESEARCH
                  </div>

                  <h2 className="mt-3 text-3xl font-semibold text-zinc-900">
                    A hub for discovery <br /> and exploration
                  </h2>

                  <p className="mt-3 text-zinc-600 leading-relaxed">
                    Give a goal prompt once — ARS runs end-to-end research cycles autonomously,
                    while keeping everything explainable via decision logs and reasoning traces.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {["No human intervention", "Hypothesis justification", "Traceability"].map((t) => (
                      <span
                        key={t}
                        className="text-xs px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200
                                   hover:bg-zinc-200/60 transition"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-4">
                    {[
                      { icon: Layers, title: "Multi-agent pipeline", sub: "Modular, scalable architecture" },
                      { icon: ShieldCheck, title: "Explainable outputs", sub: "Decision logs + reasoning traces" },
                    ].map((c) => (
                      <div
                        key={c.title}
                        className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4
                                   hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition"
                      >
                        <div className="flex items-center gap-2 text-zinc-900 font-medium">
                          <c.icon className="h-4 w-4 text-blue-600" /> {c.title}
                        </div>
                        <div className="mt-1 text-sm text-zinc-600">{c.sub}</div>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/about"
                    className="mt-8 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold
                               hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition"
                  >
                    Explore our research <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Avatar */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.05 }}
              variants={fadeUp}
              className="lg:col-span-6"
            >
              <div className="group relative rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm overflow-hidden
                              hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="pointer-events-none absolute -inset-24 opacity-0 group-hover:opacity-100 transition duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-200/40 via-cyan-200/30 to-indigo-200/40 blur-3xl" />
                </div>

                <div className="relative w-full h-[360px] sm:h-[420px] md:h-[480px] rounded-2xl overflow-hidden">
                  <Avatar3D />
                </div>

                <div className="relative mt-3 flex items-center justify-between text-sm">
                  <div className="text-zinc-700 font-medium">Interactive 3D agent</div>
                  <div className="text-zinc-500">Drag • Scroll • Rotate</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Requirements + Evaluation */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              variants={fadeUp}
              className="group relative rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm overflow-hidden
                         hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="pointer-events-none absolute -inset-24 opacity-0 group-hover:opacity-100 transition duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-200/35 via-cyan-200/25 to-indigo-200/35 blur-3xl" />
              </div>

              <div className="relative">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <h3 className="text-xl font-semibold text-zinc-900">Key Requirements</h3>
                </div>

                <div className="mt-6 space-y-4">
                  <Bullet>No human intervention after initial goal prompt</Bullet>
                  <Bullet>System must justify why it chose a hypothesis</Bullet>
                  <Bullet>Must show reasoning traces or decision logs</Bullet>
                </div>

                <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                  Output includes: hypothesis + justification + reasoning traces + experiment plan + metrics.
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.05 }}
              variants={fadeUp}
              className="group relative rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm overflow-hidden
                         hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="pointer-events-none absolute -inset-24 opacity-0 group-hover:opacity-100 transition duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-200/35 via-cyan-200/25 to-indigo-200/35 blur-3xl" />
              </div>

              <div className="relative">
                <div className="flex items-center gap-2">
                  <TimerReset className="h-5 w-5 text-blue-600" />
                  <h3 className="text-xl font-semibold text-zinc-900">Evaluation Criteria</h3>
                </div>

                <div className="mt-6 space-y-4">
                  <Bullet>Novelty of hypotheses</Bullet>
                  <Bullet>Depth of reasoning</Bullet>
                  <Bullet>Self-improvement over iterations</Bullet>
                  <Bullet>Explainability and traceability</Bullet>
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  {["Novelty Scoring", "Trace Viewer", "Iteration History"].map((t) => (
                    <span
                      key={t}
                      className="text-xs px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 hover:bg-zinc-200/60 transition"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Explore Collage */}
          <div className="mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Collage */}
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
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

                  <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-r from-blue-200/40 via-cyan-200/30 to-indigo-200/40 blur-2xl opacity-80 group-hover:opacity-100 transition" />
                </div>
              </motion.div>

              {/* Text */}
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.05 }}
                variants={fadeUp}
                className="lg:col-span-6"
              >
                <div className="max-w-xl">
                  <div className="text-xs font-semibold text-blue-600">EXPLORE</div>
                  <h3 className="mt-3 text-3xl md:text-4xl font-semibold text-zinc-900 leading-tight">
                    Enrich your research with primary sources
                  </h3>
                  <p className="mt-4 text-zinc-600 leading-relaxed">
                    Upload your paper or notes — ARS extracts key insights, matches related work,
                    identifies research gaps, and produces a clear conclusion with next steps.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      to="/about"
                      className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-zinc-200 bg-white
                                 text-zinc-900 font-semibold hover:bg-zinc-50 hover:shadow-md hover:-translate-y-0.5 transition"
                    >
                      Browse by collection
                    </Link>

                    <SoundButton
                      className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold
                                 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition"
                      onClick={() => (window.location.href = "/app")}
                    >
                      Start with an upload <ArrowRight className="h-4 w-4 ml-2" />
                    </SoundButton>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Explore main research */}
          <div className="mt-16">
            <h3 className="text-2xl font-semibold text-zinc-900 text-center">
              Explore our main research
            </h3>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <FeatureCard
                icon={Sparkles}
                title="Autonomous Literature Understanding"
                desc="Extracts methods, results, limitations and builds a structured memory."
              />
              <FeatureCard
                icon={ShieldCheck}
                title="Gap Detection & Hypothesis Generation"
                desc="Detects contradictions and underexplored areas to propose novel hypotheses."
              />
              <FeatureCard
                icon={Layers}
                title="Experiment Design & Execution"
                desc="Creates reproducible experiment plans and runs simulations/training automatically."
              />
              <FeatureCard
                icon={TimerReset}
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
}p