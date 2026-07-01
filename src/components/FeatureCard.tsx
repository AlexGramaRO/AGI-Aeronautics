export default function FeatureCard({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description: string;
}) {
  return (
    <div className="corner-brackets group relative rounded-xl border border-cyan-glow/10 bg-void-900/50 p-6 transition hover:border-cyan-glow/40 hover:bg-void-800/60">
      <span className="font-mono text-xs text-cyan-glow/60">{index}</span>
      <h3 className="mt-3 font-display text-lg font-semibold text-slate-100">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}
