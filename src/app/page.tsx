import Link from "next/link";
import Devices from "@/components/Devices";

const FEATURES = [
  {
    title: "The simulator.",
    description:
      "A human-machine interface that replicates the operational environment of air traffic control.",
  },
  {
    title: "Airspace.",
    description:
      "Create airspace in the platform. Bring in aeronautical information publication maps, or maps that already exist in other simulators.",
  },
  {
    title: "Exercises.",
    description:
      "Build an exercise graphically, import aircraft as data, or acquire traffic from ADS-B.",
  },
  {
    title: "Replay.",
    description:
      "No large video files. A log records the exercise and plays it back as a reconstruction of what happened.",
  },
  {
    title: "Voice.",
    description:
      "A voice communication system in the browser. People connect without installing or configuring anything locally.",
  },
  {
    title: "Intelligence.",
    description:
      "AI pilots aircraft, coordinates with neighboring sectors, and scripts emergencies and non-standard communications. It reasons about a trainee's questions, using responses instructors define.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="px-6 pb-8 pt-20 text-center sm:pt-28">
        <h1 className="text-[40px] font-semibold leading-[1.05] tracking-tight text-ink sm:text-[64px] lg:text-[80px]">
          AITC
        </h1>
        <p className="mt-3 text-[21px] text-muted sm:text-[28px]">Air traffic control. Reimagined.</p>
        <div className="mt-6 flex items-center justify-center gap-8">
          <Link href="/register" className="apple-link">
            Request access &gt;
          </Link>
          <Link href="#platform" className="apple-link">
            Learn more &gt;
          </Link>
        </div>
      </section>

      <section id="simulator" className="bg-canvas px-2 pb-24 pt-16 sm:pt-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-[32px] font-semibold tracking-tight text-ink sm:text-[48px]">
            On any screen.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-muted sm:text-[21px]">
            AITC runs in the browser. The same simulator on an iMac, a MacBook, and an iPad. No install. No special hardware.
          </p>
        </div>
        <div className="mt-16">
          <Devices />
        </div>
      </section>

      <section id="platform" className="mx-auto max-w-3xl px-6 py-24 text-center sm:py-32">
        <h2 className="text-[32px] font-semibold tracking-tight text-ink sm:text-[48px]">
          One platform.
          <br />
          Every position.
        </h2>
        <p className="mt-5 text-[17px] leading-relaxed text-muted sm:text-[21px]">
          From ground and tower to approach and en-route, AITC gives students, instructors, and researchers a shared place to run realistic exercises. It stays in the browser, with an AI layer that understands aviation.
        </p>
      </section>

      <section id="features" className="bg-canvas py-24 sm:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-[32px] font-semibold tracking-tight text-ink sm:text-[48px]">
            Everything the simulation needs.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-[17px] leading-relaxed text-muted sm:text-[21px]">
            One platform for the whole job. The interface, the airspace, the exercises, the replay, the voice, and the intelligence.
          </p>
          <div className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title}>
                <h3 className="text-[21px] font-semibold tracking-tight text-ink">{feature.title}</h3>
                <p className="mt-2 text-[17px] leading-relaxed text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 text-center sm:py-32">
        <h2 className="text-[32px] font-semibold tracking-tight text-ink sm:text-[48px]">
          Coming online.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-muted sm:text-[21px]">
          Register to reserve a seat. Early access includes a personal dashboard and priority as new airspace modules go live.
        </p>
        <div className="mt-8 flex items-center justify-center gap-8">
          <Link href="/register" className="apple-link">
            Create account &gt;
          </Link>
          <Link href="/contact" className="apple-link">
            Talk to the team &gt;
          </Link>
        </div>
      </section>
    </div>
  );
}
