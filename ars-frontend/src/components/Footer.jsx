import React from "react";
import { Link } from "react-router-dom";
import {
  Github,
  Mail,
  MapPin,
  ExternalLink,
  BookOpen,
  ShieldCheck,
  FileText,
  Sparkles,
} from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  // ✅ Change these once (easy)
  const CONTACT_EMAIL = "support@arslab.ai"; // put your email
  const LOCATION = "India"; // optional
  const GITHUB_URL = "https://github.com/your-org/your-repo"; // put your repo
  const DOCS_URL = "https://your-docs-site.com"; // optional
  const PAPER_URL = "https://arxiv.org"; // optional
  const PRIVACY_URL = "/privacy"; // if you have route
  const TERMS_URL = "/terms"; // if you have route

  return (
    <footer className="relative border-t border-zinc-200 bg-white/60 backdrop-blur">
      {/* soft glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_30%_0%,rgba(59,130,246,0.12),transparent_60%),radial-gradient(circle_at_75%_0%,rgba(168,85,247,0.10),transparent_60%)]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-2xl border-2 border-black bg-white grid place-items-center">
                <Sparkles className="h-5 w-5 text-black" />
              </div>
              <div>
                <div className="text-lg font-extrabold text-zinc-950 tracking-tight">
                  ARS Lab
                </div>
                <div className="text-xs text-zinc-600">
                  Autonomous Research Agent • Cognova
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm text-zinc-700 leading-relaxed max-w-md">
              ARS is a multi-agent research system that reads literature, detects gaps,
              generates hypotheses, designs experiments, and keeps decision logs for
              transparency and reproducibility.
            </p>

            {/* Contact quick */}
            <div className="mt-6 space-y-2 text-sm">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 text-zinc-800 hover:text-black"
              >
                <Mail className="h-4 w-4" />
                {CONTACT_EMAIL}
              </a>
              <div className="flex items-center gap-2 text-zinc-700">
                <MapPin className="h-4 w-4" />
                {LOCATION}
              </div>

              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-zinc-800 hover:text-black"
              >
                <Github className="h-4 w-4" />
                GitHub <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-3">
            <div className="text-sm font-bold text-zinc-950">Product</div>
            <ul className="mt-4 space-y-2 text-sm text-zinc-700">
              <li>
                <Link className="hover:text-black" to="/about">
                  About ARS
                </Link>
              </li>
              <li>
                <Link className="hover:text-black" to="/app">
                  Start a Research Cycle
                </Link>
              </li>
              <li>
                <a
                  className="hover:text-black inline-flex items-center gap-2"
                  href={DOCS_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  Documentation <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
              <li>
                <a
                  className="hover:text-black inline-flex items-center gap-2"
                  href={PAPER_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  Research Paper <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Research */}
          <div className="md:col-span-4">
            <div className="text-sm font-bold text-zinc-950">Research</div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center gap-2 font-semibold text-zinc-900 text-sm">
                  <BookOpen className="h-4 w-4" /> Literature
                </div>
                <div className="mt-1 text-xs text-zinc-600">
                  Summaries, citations, and connected context.
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center gap-2 font-semibold text-zinc-900 text-sm">
                  <FileText className="h-4 w-4" /> Experiments
                </div>
                <div className="mt-1 text-xs text-zinc-600">
                  Reproducible plans, evaluations, and results.
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center gap-2 font-semibold text-zinc-900 text-sm">
                  <ShieldCheck className="h-4 w-4" /> Ethics
                </div>
                <div className="mt-1 text-xs text-zinc-600">
                  Safety-first outputs and transparent reasoning.
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center gap-2 font-semibold text-zinc-900 text-sm">
                  <Sparkles className="h-4 w-4" /> Agents
                </div>
                <div className="mt-1 text-xs text-zinc-600">
                  Multi-agent orchestration with logs.
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="mt-5 rounded-3xl border-2 border-black bg-white p-4">
              <div className="text-sm font-extrabold text-black">
                Stay updated
              </div>
              <div className="mt-1 text-xs text-zinc-600">
                Release notes, research updates, and new agent features.
              </div>

              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="Email address"
                  className="flex-1 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-black"
                />
                <button
                  type="submit"
                  className="rounded-2xl border-2 border-black bg-black text-white px-4 py-2 text-sm font-semibold hover:bg-zinc-900 transition"
                >
                  Subscribe
                </button>
              </form>
              <div className="mt-2 text-[11px] text-zinc-500">
                No spam. Unsubscribe anytime.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-zinc-200 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="text-xs text-zinc-600">
            © {year} ARS Lab • Autonomous Research Agent. All rights reserved.
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-600">
            <Link className="hover:text-black" to={PRIVACY_URL}>
              Privacy
            </Link>
            <Link className="hover:text-black" to={TERMS_URL}>
              Terms
            </Link>
            <a className="hover:text-black" href={`mailto:${CONTACT_EMAIL}`}>
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}