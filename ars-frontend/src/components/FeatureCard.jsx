export default function Section({ title, subtitle, children }) {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">{title}</h2>
          {subtitle && <p className="mt-2 text-white/70">{subtitle}</p>}
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}