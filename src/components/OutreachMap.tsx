"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Map as LeafletMap, LayerGroup, Rectangle, LeafletMouseEvent, Path } from "leaflet";
import "leaflet/dist/leaflet.css";

type Contact = { id: string; name: string | null; title: string | null; email: string | null };
type Org = {
  id: string;
  name: string;
  kind: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  website: string | null;
  atmSystem: string | null;
  simulatorKind: string;
  simulatorVendor: string | null;
  simulatorAcquired: string | null;
  simulatorPrice: string | null;
  notes: string | null;
  contacts: Contact[];
  unreadCount: number;
  receivedCount: number;
};
type Cluster = { key: string; lat: number; lng: number; orgs: Org[] };
type Mail = {
  id: string;
  direction: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  body: string;
  unread: boolean;
  occurredAt: string;
  organizationId: string | null;
  organization?: { name: string } | null;
};

const KIND: Record<string, string> = {
  ANSP: "Air navigation service",
  TRAINING_ACADEMY: "Training academy",
  UNIVERSITY: "University",
  OTHER: "Other",
};

function clusterOrgs(orgs: Org[]): Cluster[] {
  const groups = new Map<string, Org[]>();
  for (const org of orgs) {
    const key = `${org.lat.toFixed(1)},${org.lng.toFixed(1)}`;
    groups.set(key, [...(groups.get(key) || []), org]);
  }
  return [...groups.entries()].map(([key, list]) => ({
    key,
    lat: list.reduce((sum, org) => sum + org.lat, 0) / list.length,
    lng: list.reduce((sum, org) => sum + org.lng, 0) / list.length,
    orgs: list,
  }));
}

function field(label: string, value: string | null | undefined) {
  return (
    <p className="mt-2 text-[14px] text-ink">
      <span className="text-muted">{label}. </span>
      {value || "Not published"}
    </p>
  );
}

export default function OutreachMap() {
  const router = useRouter();
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const drawRef = useRef<{ start: { lat: number; lng: number } | null; rect: Rectangle | null; drawing: boolean }>({
    start: null,
    rect: null,
    drawing: false,
  });

  const [orgs, setOrgs] = useState<Org[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [active, setActive] = useState<Cluster | null>(null);
  const [tab, setTab] = useState<"details" | "correspondence">("details");
  const [mail, setMail] = useState<Mail[]>([]);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const clusters = useMemo(() => clusterOrgs(orgs), [orgs]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  useEffect(() => {
    fetch("/api/admin/outreach/organizations")
      .then((res) => res.json())
      .then((data) => setOrgs(data.organizations || []))
      .catch(() => setError("Could not load organisations."));
  }, []);

  useEffect(() => {
    if (!active) return;
    const ids = active.orgs.map((org) => org.id).join(",");
    fetch(`/api/admin/outreach/messages?organizationIds=${ids}`)
      .then((res) => res.json())
      .then((data) => setMail(data.messages || []));
  }, [active]);

  useEffect(() => {
    let cancelled = false;
    const host = mapEl.current;
    if (!host) return;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !host || mapRef.current) return;
      const map = L.map(host, {
        worldCopyJump: false,
        minZoom: 2,
        maxBounds: L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180)),
        maxBoundsViscosity: 0.8,
      }).setView([20, 10], 2);
      map.attributionControl.setPrefix(false);
      map.attributionControl.addAttribution("Natural Earth");
      let countries: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };
      try {
        const res = await fetch("/geo/countries.geojson");
        if (!res.ok) throw new Error("countries");
        countries = (await res.json()) as GeoJSON.FeatureCollection;
      } catch {
        if (!cancelled) setError("Could not load country outlines.");
      }
      if (cancelled) {
        map.remove();
        return;
      }
      countries.features = countries.features.filter((feature) => feature.properties?.name !== "Antarctica");
      const outline = { color: "#c7c7cc", weight: 0.8, fillColor: "#ffffff", fillOpacity: 1 };
      const highlight = { color: "#1d1d1f", weight: 1.2, fillColor: "#f5f5f7", fillOpacity: 1 };
      const shapes = L.geoJSON(countries, {
        style: () => outline,
        onEachFeature(feature, layer) {
          const name = feature.properties?.name;
          if (!name) return;
          const shape = layer as Path;
          shape.bindTooltip(String(name), { sticky: true, direction: "top", opacity: 1, className: "country-tip" });
          shape.on("mouseover", () => shape.setStyle(highlight));
          shape.on("mouseout", () => shape.setStyle(outline));
        },
      }).addTo(map);
      if (countries.features.length) map.fitBounds(shapes.getBounds(), { padding: [12, 12], maxZoom: 3 });
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      map.on("mousedown", (event: LeafletMouseEvent) => {
        if (!drawRef.current.drawing) return;
        map.dragging?.disable();
        drawRef.current.start = event.latlng;
        drawRef.current.rect = L.rectangle(L.latLngBounds(event.latlng, event.latlng), {
          color: "#0071e3",
          weight: 1,
          fillOpacity: 0.08,
        }).addTo(map);
      });
      map.on("mousemove", (event: LeafletMouseEvent) => {
        const draw = drawRef.current;
        if (!draw.start || !draw.rect) return;
        draw.rect.setBounds(L.latLngBounds(draw.start, event.latlng));
      });
      map.on("mouseup", () => {
        const draw = drawRef.current;
        if (!draw.rect || !draw.start) return;
        const bounds = draw.rect.getBounds();
        const hits = (host as HTMLDivElement & { __clusters?: Cluster[] }).__clusters || [];
        const ids = hits
          .filter((cluster) => bounds.contains(L.latLng(cluster.lat, cluster.lng)))
          .flatMap((cluster) => cluster.orgs.map((org) => org.id));
        if (ids.length) {
          setSelected((current) => [...new Set([...current, ...ids])]);
        }
        map.removeLayer(draw.rect);
        draw.rect = null;
        draw.start = null;
        draw.drawing = false;
        map.dragging?.enable();
      });
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const host = mapEl.current as (HTMLDivElement & { __clusters?: Cluster[] }) | null;
    if (host) host.__clusters = clusters;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled) return;
      layer.clearLayers();
      for (const cluster of clusters) {
        const unread = cluster.orgs.reduce((sum, org) => sum + org.unreadCount, 0);
        const received = cluster.orgs.reduce((sum, org) => sum + org.receivedCount, 0);
        const on = cluster.orgs.some((org) => selectedSet.has(org.id));
        const badge = unread || received;
        const icon = L.divIcon({
          className: "",
          iconSize: [22, 22],
          iconAnchor: [11, 11],
          html: `<div class="outreach-pin${on ? " is-selected" : ""}" title="${received} received, ${unread} unread">${
            badge ? `<span class="outreach-badge${unread ? "" : " is-read"}">${unread || received}</span>` : ""
          }</div>`,
        });
        const marker = L.marker([cluster.lat, cluster.lng], { icon });
        marker.on("click", () => {
          if (selecting) {
            const ids = cluster.orgs.map((org) => org.id);
            setSelected((current) => {
              const allOn = ids.every((id) => current.includes(id));
              return allOn ? current.filter((id) => !ids.includes(id)) : [...new Set([...current, ...ids])];
            });
            return;
          }
          setTab("details");
          setActive(cluster);
        });
        marker.addTo(layer);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clusters, selectedSet, selecting]);

  function beginDraw() {
    drawRef.current.drawing = true;
    setMenu(null);
    setNotice("Drag a rectangle around the locations you want.");
  }

  async function prepareDrafts() {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/outreach/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationIds: selected, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error || "Could not prepare drafts.");
        return;
      }
      const skipped = (data.skipped || []).join(" ");
      setNotice(
        `Prepared ${data.created} draft${data.created === 1 ? "" : "s"}.${skipped ? ` Skipped: ${skipped}` : ""}`
      );
      setNoteOpen(false);
      setSelecting(false);
      setSelected([]);
      router.push("/admin/outreach/drafts");
    } finally {
      setBusy(false);
    }
  }

  async function markRead(message: Mail) {
    if (!message.unread) return;
    await fetch(`/api/admin/outreach/messages/${message.id}`, { method: "PATCH" });
    setMail((current) => current.map((item) => (item.id === message.id ? { ...item, unread: false } : item)));
    setOrgs((current) =>
      current.map((org) =>
        org.id === message.organizationId ? { ...org, unreadCount: Math.max(0, org.unreadCount - 1) } : org
      )
    );
  }

  return (
    <div>
      <div
        className="relative overflow-hidden rounded-3xl border border-black/10"
        onContextMenu={(event) => {
          event.preventDefault();
          setMenu({ x: event.clientX, y: event.clientY });
        }}
      >
        <div ref={mapEl} className="outreach-map h-[70vh] w-full" />
        {selecting && (
          <div className="absolute left-3 top-3 z-[500] flex flex-wrap items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-[13px] shadow">
            <span>{selected.length} selected</span>
            <button className="text-[#0066cc]" onClick={beginDraw}>
              Draw area
            </button>
            <button
              className="btn !px-3 !py-1 !text-[13px]"
              onClick={() => {
                if (!selected.length) {
                  setNotice("Select at least one location.");
                  return;
                }
                setNoteOpen(true);
              }}
            >
              End selection
            </button>
            <button
              className="text-muted"
              onClick={() => {
                setSelecting(false);
                setSelected([]);
                drawRef.current.drawing = false;
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {menu && (
        <>
          <button className="fixed inset-0 z-[590] cursor-default" aria-label="Close menu" onClick={() => setMenu(null)} />
          <button
            className="fixed z-[600] rounded-xl bg-white px-4 py-3 text-left text-[14px] text-ink shadow-lg"
            style={{ left: menu.x, top: menu.y }}
            onClick={() => {
              setSelecting(true);
              setMenu(null);
              setActive(null);
            }}
          >
            Select locations for correspondence
          </button>
        </>
      )}

      {notice && <p className="mt-4 text-[15px] text-muted">{notice}</p>}
      {error && <p className="mt-4 text-[15px] text-[#bf4800]">{error}</p>}

      {active && (
        <div className="mt-4 rounded-3xl bg-canvas p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4 text-[15px]">
              <button className={tab === "details" ? "text-ink" : "text-muted"} onClick={() => setTab("details")}>
                Details
              </button>
              <button
                className={tab === "correspondence" ? "text-ink" : "text-muted"}
                onClick={() => setTab("correspondence")}
              >
                Correspondence
              </button>
            </div>
            <button className="text-[13px] text-muted" onClick={() => setActive(null)}>
              Close
            </button>
          </div>

          {tab === "details" ? (
            <div className="mt-4 space-y-6">
              {active.orgs.map((org) => (
                <article key={org.id}>
                  <h3 className="text-[21px] font-semibold tracking-tight text-ink">{org.name}</h3>
                  <p className="text-[14px] text-muted">
                    {KIND[org.kind] || org.kind} · {org.city}, {org.country}
                  </p>
                  {field("ATM system", org.atmSystem)}
                  {field("Simulator", org.simulatorKind === "UNKNOWN" ? null : org.simulatorKind.replace(/_/g, " "))}
                  {field("Simulator vendor", org.simulatorVendor)}
                  {field("Acquired", org.simulatorAcquired)}
                  {field("Price", org.simulatorPrice)}
                  {org.website && (
                    <p className="mt-2 text-[14px]">
                      <a className="text-[#0066cc]" href={org.website} target="_blank" rel="noreferrer">
                        {org.website}
                      </a>
                    </p>
                  )}
                  <div className="mt-3">
                    {org.contacts.length === 0 && <p className="text-[14px] text-muted">No published contact email.</p>}
                    {org.contacts.map((contact) => (
                      <p key={contact.id} className="text-[14px] text-ink">
                        {contact.name || contact.title || "Contact"}
                        {contact.email ? ` · ${contact.email}` : ""}
                      </p>
                    ))}
                  </div>
                  {org.notes && <p className="mt-2 text-[13px] leading-relaxed text-muted">{org.notes}</p>}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {mail.length === 0 && <p className="text-[15px] text-muted">No correspondence yet.</p>}
              {mail.map((message) => (
                <button
                  key={message.id}
                  className="block w-full rounded-2xl bg-white p-4 text-left"
                  onClick={() => markRead(message)}
                >
                  <p className="text-[13px] text-muted">
                    {message.unread ? "Unread · " : ""}
                    {message.direction === "INBOUND" ? "Received" : "Sent"} ·{" "}
                    {new Date(message.occurredAt).toLocaleString()}
                  </p>
                  <p className="mt-1 font-medium text-ink">{message.subject}</p>
                  <p className="mt-1 text-[13px] text-muted">
                    {message.fromEmail} → {message.toEmail}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-[14px] text-ink">{message.body}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {noteOpen && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6">
            <h2 className="text-[24px] font-semibold tracking-tight text-ink">What should the letters say?</h2>
            <p className="mt-2 text-[15px] text-muted">
              A draft is prepared for each selected location, using this note and any earlier correspondence.
            </p>
            <textarea className="field mt-4" rows={5} value={note} onChange={(event) => setNote(event.target.value)} />
            <div className="mt-4 flex justify-end gap-4">
              <button className="text-[15px] text-muted" onClick={() => setNoteOpen(false)}>
                Cancel
              </button>
              <button className="btn" disabled={busy || !note.trim()} onClick={prepareDrafts}>
                {busy ? "Preparing…" : "Prepare drafts"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
