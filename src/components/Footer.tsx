import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-canvas">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-10 border-b border-black/10 pb-8 md:flex-row md:justify-between">
          <div>
            <Image src="/logo/agi-logo.png" alt="AGI Aeronautics" width={1370} height={652} className="h-12 w-auto" />
            <p className="mt-4 max-w-xs text-[12px] leading-relaxed text-muted">
              AiTC is a browser-based air traffic control simulator for training, research, and operations development.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12 text-[12px]">
            <div>
              <p className="mb-3 text-ink">Platform</p>
              <ul className="space-y-2 text-muted">
                <li><Link href="/#platform" className="hover:underline">Overview</Link></li>
                <li><Link href="/#features" className="hover:underline">Capabilities</Link></li>
                <li><Link href="/#simulator" className="hover:underline">Devices</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-ink">Company</p>
              <ul className="space-y-2 text-muted">
                <li><Link href="/contact" className="hover:underline">Contact</Link></li>
                <li><Link href="/login" className="hover:underline">Log in</Link></li>
                <li><Link href="/register" className="hover:underline">Register</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <p className="pt-5 text-[12px] text-muted">
          Copyright © {new Date().getFullYear()} AGI Aeronautics LLC. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
