import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative border-t border-cyan-glow/10 bg-void-950/80 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div>
            <Image
              src="/logo/agi-logo.png"
              alt="AGI Aeronautics"
              width={160}
              height={40}
              className="h-8 w-auto brightness-0 invert opacity-90"
            />
            <p className="mt-4 max-w-sm font-mono text-xs leading-relaxed text-slate-500">
              AGI AERONAUTICS &mdash; INTELLIGENCE FOR AVIATION.
              <br />
              AITC Platform: a web-based, AI-augmented air traffic control simulator.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-cyan-glow/80">
                Platform
              </p>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/#platform" className="hover:text-cyan-glow">Overview</Link></li>
                <li><Link href="/#features" className="hover:text-cyan-glow">Capabilities</Link></li>
                <li><Link href="/#simulator" className="hover:text-cyan-glow">Simulator</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-cyan-glow/80">
                Company
              </p>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/contact" className="hover:text-cyan-glow">Contact</Link></li>
                <li><Link href="/login" className="hover:text-cyan-glow">Log in</Link></li>
                <li><Link href="/register" className="hover:text-cyan-glow">Register</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-cyan-glow/10 pt-6 font-mono text-[11px] text-slate-500 sm:flex-row">
          <span>&copy; {new Date().getFullYear()} AGI Aeronautics LLC. All rights reserved.</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-glow-sm animate-pulse-slow" />
            SYSTEMS NOMINAL
          </span>
        </div>
      </div>
    </footer>
  );
}
