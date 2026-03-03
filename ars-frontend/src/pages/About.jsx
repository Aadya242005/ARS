import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import heroBg from "../assets/image.png";
import howBg from "../assets/bg11.jpg";
import workImg from "../assets/work.jpg";

import { ArrowRight, Brain, FileText, FlaskConical, ShieldCheck } from "lucide-react";

export default function About() {
  const STEPS = [
    {
      title: "1) Give a goal prompt",
      desc: "Start with a clear research objective—ARS uses it to plan the entire cycle.",
      icon: Brain,
      bullets: ["Defines scope + constraints", "Chooses the right agent flow", "Creates a structured plan"],
    },
    {
      title: "2) Ingest & understand literature",
      desc: "ARS reads sources and extracts key methods, findings, and limitations.",
      icon: FileText,
      bullets: ["Summarizes core ideas", "Extracts methods & results", "Flags limitations/assumptions"],
    },
    {
      title: "3) Find gaps & propose hypotheses",
      desc: "The system identifies underexplored directions and drafts testable hypotheses.",
      icon: ShieldCheck,
      bullets: ["Detects contradictions & missing links", "Generates hypotheses", "Adds rationale for each"],
    },
    {
      title: "4) Design experiments",
      desc: "ARS creates reproducible experiment plans to validate hypotheses.",
      icon: FlaskConical,
      bullets: ["Defines datasets & baselines", "Chooses metrics", "Outlines evaluation steps"],
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#f6f0e6] text-zinc-900 overflow-hidden">
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-10">
          <div className="relative overflow-hidden rounded-[40px] border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_30px_90px_-55px_rgba(0,0,0,0.45)]">
            <div
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage: `url(${heroBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/80 to-white/95" />

            <div className="relative px-8 py-14 text-center">
              <div className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full border-2 border-black bg-white text-black font-semibold">
                About ARS
              </div>

              <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight">
                Autonomous Research, explained simply.
              </h1>

              <p className="mt-6 max-w-2xl mx-auto text-zinc-700 leading-relaxed">
                ARS is a multi-agent research system that helps you go from a research question to a structured
                plan—summaries, gaps, hypotheses, and experiment design—while keeping the output clear and explainable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS (BG + SIDE IMAGE) ================= */}
      <section className="relative overflow-hidden">
        {/* background only for this section */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${howBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-white/85 backdrop-blur-sm" />

        <div className="relative mx-auto max-w-6xl px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full border border-zinc-200 bg-white text-zinc-700">
              How it works
            </div>

            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">
              One prompt → a complete research cycle
            </h2>

            <p className="mt-3 text-zinc-700 max-w-2xl mx-auto leading-relaxed">
              ARS follows a structured workflow so you always get organized outputs—not messy paragraphs.
            </p>
          </div>

          {/* layout: image + steps */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* left image */}
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <div className="rounded-[28px] border-2 border-black bg-white/80 backdrop-blur overflow-hidden shadow-[0_20px_70px_-55px_rgba(0,0,0,0.35)]">
                  <div className="relative">
                    <img
                      src={workImg}
                      alt="How ARS works"
                      className="w-full h-[420px] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/85 via-white/15 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border-2 border-black bg-white text-black font-semibold">
                        Research workflow
                      </div>
                      <div className="mt-2 text-sm font-semibold text-zinc-900">
                        Clear steps • Structured output • Explainable
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-zinc-200 bg-white/80 backdrop-blur p-4 text-sm text-zinc-700">
                  Tip: Use short prompts like <span className="font-semibold">“Summarize + gaps + experiments”</span> for the best results.
                </div>
              </div>
            </div>

            {/* right steps */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {STEPS.map((s) => (
                  <StepCard key={s.title} {...s} />
                ))}
              </div>

              {/* Output Preview */}
              <div className="mt-8 rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-md">
                <div className="text-sm font-extrabold text-zinc-900">What you get</div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {["Literature Summary", "Gap Analysis", "Hypotheses", "Experiment Blueprint"].map((x) => (
                    <div
                      key={x}
                      className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900"
                    >
                      {x}
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-xs text-zinc-600">
                  Tip: Use this cycle for thesis planning, paper reviews, or hackathon research validation.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= READY TO RUN ================= */}
      <section className="bg-[#f6f0e6]">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Ready to run your first research cycle?
          </h2>

          <p className="mt-4 text-zinc-600">
            Start with a goal prompt and let ARS generate structured research outputs.
          </p>

          <a
            href="/app"
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-black text-white font-semibold hover:bg-zinc-800 transition"
          >
            Start Research <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function StepCard({ icon: Icon, title, desc, bullets }) {
  return (
    <div className="group rounded-3xl border border-zinc-200 bg-white/90 backdrop-blur p-7
                    shadow-[0_14px_50px_-40px_rgba(0,0,0,0.25)]
                    hover:shadow-[0_28px_90px_-55px_rgba(0,0,0,0.35)]
                    hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-2xl border-2 border-black bg-white grid place-items-center">
          <Icon className="h-6 w-6 text-black" />
        </div>

        <div className="flex-1">
          <div className="text-lg font-extrabold text-zinc-900">{title}</div>
          <div className="mt-2 text-sm text-zinc-600 leading-relaxed">{desc}</div>

          <ul className="mt-4 space-y-2 text-sm text-zinc-700">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-black shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 h-[2px] w-12 bg-black group-hover:w-full transition-all duration-500" />
    </div>
  );
}