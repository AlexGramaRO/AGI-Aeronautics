import Link from "next/link";
import Image from "next/image";
import FeatureCard from "@/components/FeatureCard";
import StatReadout from "@/components/StatReadout";

const FEATURES = [
  {
    index: "01",
    title: "Live Radar Simulation",
    description:
      "Realistic sector scopes, aircraft tagging, and traffic flow rendered in real time directly in the browser - no client install required.",
  },
  {
    index: "02",
    title: "AI Co-Pilot for Controllers",
    description:
      "An assistive AI layer that flags conflicts, suggests vectors, and helps trainees build separation awareness during live sessions.",
  },
  {
    index: "03",
    title: "Procedural Airspace & Scenarios",
    description:
      "Generate approach, departure, and en-route scenarios across custom airspace models for structured, repeatable training.",
  },
  {
    index: "04",
    title: "Voice & Text R/T Comms",
    description:
      "Pilot-controller communication workflows built around standard phraseology, with readback validation and instructor override.",
  },
  {
    index: "05",
    title: "Performance Analytics",
    description:
      "Session replay, separation-loss detection, and instructor scoring dashboards to track trainee progress over time.",
  },
  {
    index: "06",
    title: "Multi-Position Sessions",
    description:
      "Run multi-sector, multi-controller exercises with pilots, instructors, and observers connected to the same live simulation.",
  },
];

export default function HomePage() {
  return (
    <div className="relative">
      <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 pt-10 text-center">
        <div className="mb-6 flex items-center gap-2 rounded-full border border-cyan-glow/25 bg-void-900/60 px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-cyan-glow">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-glow animate-pulse-slow" />
          AITC Platform &mdash; Now in active development
        </div>

        <h1 className="max-w-4xl font-display text-4xl font-bold leading-tight text-slate-50 sm:text-6xl">
          Air Traffic Control,
          <br />
          <span className="text-gradient">Reimagined with AI.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-slate-400 sm:text-lg">
          AGI Aeronautics builds AITC &mdash; a futuristic, web-based air traffic control
          simulator that fuses realistic airspace simulation with an AI co-pilot layer,
          purpose-built for training, research, and next-generation ATC development.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-md bg-gradient-to-r from-accent-blue to-accent-cyan px-8 py-3 font-mono text-sm uppercase tracking-widest text-void-950 shadow-glow transition hover:scale-[1.02]"
          >
            Request Access
          </Link>
          <Link
            href="#platform"
            className="rounded-md border border-cyan-glow/30 px-8 py-3 font-mono text-sm uppercase tracking-widest text-slate-200 transition hover:bg-cyan-glow/10"
          >
            Explore Platform
          </Link>
        </div>

        <div className="mt-20 grid w-full max-w-3xl grid-cols-2 gap-6 border-t border-cyan-glow/10 pt-10 sm:grid-cols-4">
          <StatReadout value="AI" label="Co-Pilot Layer" />
          <StatReadout value="100%" label="Browser Based" />
          <StatReadout value="24/7" label="Simulation Uptime" />
          <StatReadout value="LIVE" label="Radar Rendering" />
        </div>
      </section>

      <section id="platform" className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-cyan-glow/80">
              // Platform Overview
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-slate-50 sm:text-4xl">
              One platform. Every position in the tower.
            </h2>
            <p className="mt-5 leading-relaxed text-slate-400">
              AITC gives ATC students, instructors, and researchers a shared, web-native
              environment to run realistic control exercises &mdash; from ground and tower to
              approach and en-route &mdash; without specialized hardware. Everything runs in the
              browser, backed by an AI layer that understands aviation context.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              {["No installation - runs entirely in the browser", "Realistic airspace, traffic, and phraseology", "AI assistance tuned specifically for ATC workflows"].map(
                (item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-glow" />
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="corner-brackets relative rounded-2xl border border-cyan-glow/15 bg-void-900/60 p-2">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-void-950">
              <div className="absolute inset-0 grid-overlay opacity-70" />
              <div className="absolute left-1/2 top-1/2 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-glow/20">
                <div className="absolute inset-[15%] rounded-full border border-cyan-glow/15" />
                <div className="absolute inset-[30%] rounded-full border border-cyan-glow/10" />
                <div className="absolute inset-0 origin-center animate-radar-sweep">
                  <div className="absolute left-1/2 top-1/2 h-1/2 w-52 origin-top -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-glow/20 via-transparent to-transparent" />
                </div>
                {[
                  { top: "20%", left: "60%" },
                  { top: "45%", left: "25%" },
                  { top: "65%", left: "70%" },
                  { top: "35%", left: "50%" },
                ].map((pos, i) => (
                  <span
                    key={i}
                    className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-amber shadow-glow-sm"
                    style={pos}
                  />
                ))}
              </div>
              <Image
                src="/logo/agi-logo.png"
                alt=""
                width={64}
                height={64}
                className="absolute bottom-4 right-4 h-10 w-auto opacity-40 brightness-0 invert"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="mb-14 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-cyan-glow/80">
            // Capabilities
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-slate-50 sm:text-4xl">
            Built for controllers, pilots, and instructors.
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.index} {...feature} />
          ))}
        </div>
      </section>

      <section id="simulator" className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="hud-panel corner-brackets relative overflow-hidden rounded-2xl px-8 py-16 text-center sm:px-16">
          <div className="absolute inset-0 grid-overlay opacity-40" />
          <p className="relative font-mono text-xs uppercase tracking-widest text-cyan-glow/80">
            // Simulator Access
          </p>
          <h2 className="relative mt-3 font-display text-3xl font-bold text-slate-50 sm:text-4xl">
            The AITC simulator is coming online.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-slate-400">
            Register now to reserve your seat. Early access users get a personal dashboard
            and priority onboarding as new airspace modules go live.
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-md bg-gradient-to-r from-accent-blue to-accent-cyan px-8 py-3 font-mono text-sm uppercase tracking-widest text-void-950 shadow-glow transition hover:scale-[1.02]"
            >
              Create Account
            </Link>
            <Link
              href="/contact"
              className="rounded-md border border-cyan-glow/30 px-8 py-3 font-mono text-sm uppercase tracking-widest text-slate-200 transition hover:bg-cyan-glow/10"
            >
              Talk to the Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
