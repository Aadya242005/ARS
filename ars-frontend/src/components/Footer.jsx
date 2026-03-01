export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-zinc-950/40">
      <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="text-sm text-white/60">
          © {new Date().getFullYear()} ARS Lab • Autonomous Research Agent
        </div>
        <div className="text-sm text-white/60 flex gap-4">
          <a className="hover:text-white" href="#">GitHub</a>
          <a className="hover:text-white" href="#">Docs</a>
          <a className="hover:text-white" href="#">Contact</a>
        </div>
      </div>
    </footer>
  );
}