import OutreachMap from "@/components/OutreachMap";

export const dynamic = "force-dynamic";

export default function OutreachPage() {
  return (
    <div>
      <h2 className="text-[28px] font-semibold tracking-tight text-ink">Correspondence</h2>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
        Right-click the map and choose Select locations for correspondence. Click a dot, or draw a rectangle, then end the selection. A blue bubble shows unread mail.
      </p>
      <div className="mt-6">
        <OutreachMap />
      </div>
    </div>
  );
}
