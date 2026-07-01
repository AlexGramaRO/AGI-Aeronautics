import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-cyan-glow/80">// Operator Console</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-slate-50">
        Welcome, {user?.name?.split(" ")[0] ?? "Operator"}.
      </h1>
      <p className="mt-3 max-w-2xl text-slate-400">
        Your personal AITC dashboard. Simulator sessions, training modules, and progress
        tracking will appear here as the platform comes online.
      </p>

      <div className="corner-brackets hud-panel mt-10 flex min-h-[320px] flex-col items-center justify-center rounded-2xl p-10 text-center">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border border-cyan-glow/30" />
          <div className="absolute inset-2 rounded-full border border-cyan-glow/20" />
          <div className="absolute inset-0 origin-center animate-radar-sweep">
            <div className="absolute left-1/2 top-1/2 h-1/2 w-8 origin-top -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-glow/40 to-transparent" />
          </div>
        </div>
        <p className="mt-6 font-mono text-xs uppercase tracking-widest text-slate-400">
          Module standby
        </p>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Aviation training modules, simulator access, and session history are on the way.
          Check back soon.
        </p>
      </div>
    </div>
  );
}
