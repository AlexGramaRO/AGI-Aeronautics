export default function RadarBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-void-950">
      <div className="absolute inset-0 grid-overlay" />
      <div className="absolute left-1/2 top-1/3 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-hud-radial opacity-60" />

      <div className="absolute left-1/2 top-1/3 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-0 rounded-full border border-cyan-glow/10" />
        <div className="absolute inset-[80px] rounded-full border border-cyan-glow/10" />
        <div className="absolute inset-[160px] rounded-full border border-cyan-glow/15" />
        <div className="absolute inset-[240px] rounded-full border border-cyan-glow/20" />
        <div className="absolute inset-0 origin-center animate-radar-sweep">
          <div className="absolute left-1/2 top-1/2 h-1/2 w-[2px] origin-top bg-gradient-to-b from-cyan-glow/70 to-transparent" />
          <div className="absolute left-1/2 top-1/2 h-1/2 w-40 origin-top -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-glow/15 via-transparent to-transparent" />
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-void-950/40 to-void-950" />
      <div className="absolute inset-0 bg-gradient-to-r from-void-950 via-transparent to-void-950" />
    </div>
  );
}
