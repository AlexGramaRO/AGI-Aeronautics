import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="text-[40px] font-semibold tracking-tight text-ink sm:text-[48px]">
        Welcome, {user?.name?.split(" ")[0] ?? "there"}.
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-muted sm:text-[21px]">
        Simulator sessions, training modules, and progress will appear here as the platform comes online.
      </p>
      <div className="mt-12 rounded-3xl bg-canvas px-8 py-16">
        <p className="text-[21px] font-semibold tracking-tight text-ink">Nothing here yet.</p>
        <p className="mx-auto mt-2 max-w-sm text-[17px] text-muted">
          Training modules and session history are on the way.
        </p>
      </div>
    </div>
  );
}
