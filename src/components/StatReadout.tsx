export default function StatReadout({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-2xl font-bold text-gradient sm:text-3xl">{value}</p>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-slate-500">{label}</p>
    </div>
  );
}
