"use client";

/**
 * PTW Dashboard — summary of the permits currently in scope (the app-wide
 * project filter is already applied by PermitContext).
 */

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, MapPin, PauseCircle, ShieldCheck } from "lucide-react";
import type { PermitToWork } from "@/types/permit";
import { getPermitProgress } from "@/lib/permitProgress";

const TYPE_COLORS = ["#F36F24", "#3B82F6", "#22C55E", "#8B5CF6", "#14B8A6", "#F59E0B", "#EF4444", "#64748B"];

function isClosed(p: PermitToWork) {
  return p.permitStatus === "Closed" || p.status === "Closed";
}

function endOf(p: PermitToWork): Date | null {
  if (!p.endDate) return null;
  const d = new Date(`${p.endDate}T${p.endTime || "23:59"}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Why a permit needs someone's attention, or null when it doesn't. */
function actionNeeded(p: PermitToWork): string | null {
  if (isClosed(p) || p.status === "Rejected") return null;
  if (p.status === "Suspended") return "Suspended";
  const end = endOf(p);
  if (end && end < new Date()) return "Expired – close out";
  if (p.status === "Pending Approval") return "Awaiting approval";
  return null;
}

export function permitTypeLabel(p: PermitToWork) {
  return p.permitType === "Other" ? p.permitTypeOther || "Other" : p.permitType || "—";
}

function countBy<T>(rows: T[], key: (r: T) => string) {
  const m = new Map<string, number>();
  rows.forEach((r) => {
    const k = key(r).trim() || "—";
    m.set(k, (m.get(k) ?? 0) + 1);
  });
  return Array.from(m, ([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

export default function PtwDashboard({ permits }: { permits: PermitToWork[] }) {
  const active = permits.filter(
    (p) => !isClosed(p) && (p.status === "Approved" || p.status === "Active") && getPermitProgress(p) !== "Closed"
  );
  const awaiting = permits.filter((p) => !isClosed(p) && p.status === "Pending Approval");
  const closed = permits.filter(isClosed);
  const suspended = permits.filter((p) => !isClosed(p) && p.status === "Suspended");

  const byType = countBy(permits, permitTypeLabel);
  const maxType = Math.max(1, ...byType.map((r) => r.count));
  const issuedFF = permits.filter((p) => p.issuedBy === "FF").length;
  const issuedClient = permits.filter((p) => p.issuedBy === "Client").length;
  const issuedUnset = permits.length - issuedFF - issuedClient;
  const byLocation = countBy(active, (p) => [p.projectName, p.workLocation].filter(Boolean).join(" – "));
  const requiringAction = permits
    .map((p) => ({ p, reason: actionNeeded(p) }))
    .filter((r): r is { p: PermitToWork; reason: string } => r.reason !== null);

  const cards = [
    { label: "Active Permits", value: active.length, icon: ShieldCheck, color: "#16A34A", bg: "#DCFCE7" },
    { label: "Awaiting Approval", value: awaiting.length, icon: Clock, color: "#D97706", bg: "#FEF3C7" },
    { label: "Closed Permits", value: closed.length, icon: CheckCircle2, color: "#475569", bg: "#E2E8F0" },
    { label: "Suspended Permits", value: suspended.length, icon: PauseCircle, color: "#DC2626", bg: "#FEE2E2" },
  ];

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-bold text-brand-black">PTW Dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card flex items-center gap-4 !p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: c.bg, color: c.color }}>
              <c.icon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-semibold text-brand-gray">{c.label}</p>
              <p className="text-3xl font-extrabold leading-tight text-brand-black">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Permits by type */}
        <div className="card !p-5">
          <h3 className="text-base font-bold text-brand-black">Permits by Type</h3>
          {byType.length === 0 ? (
            <p className="mt-6 text-center text-sm text-brand-gray">No permits yet</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {byType.map((r, i) => (
                <li key={r.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-brand-grayDark">{r.label}</span>
                    <span className="font-bold text-brand-black">{r.count}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: "#EEF1F4" }}>
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${(r.count / maxType) * 100}%`, background: TYPE_COLORS[i % TYPE_COLORS.length] }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Permits requiring action */}
        <div className="card !p-5">
          <h3 className="flex items-center gap-2 text-base font-bold text-brand-black">
            <AlertTriangle className="h-4 w-4 text-brand-orange" />
            Permits Requiring Action
            <span className="ms-auto rounded-full bg-brand-orange/10 px-2 py-0.5 text-xs font-bold text-brand-orange">
              {requiringAction.length}
            </span>
          </h3>
          {requiringAction.length === 0 ? (
            <p className="mt-6 text-center text-sm text-brand-gray">Nothing needs action</p>
          ) : (
            <ul className="mt-3 max-h-64 divide-y divide-brand-border overflow-y-auto">
              {requiringAction.map(({ p, reason }) => (
                <li key={p.id}>
                  <Link href={`/permit-to-work/${p.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:opacity-80">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brand-black">
                        #{p.permitNumber} · {permitTypeLabel(p)}
                      </p>
                      <p className="truncate text-xs text-brand-gray">
                        {p.projectName}
                        {p.workLocation ? ` – ${p.workLocation}` : ""}
                      </p>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={
                        reason === "Awaiting approval"
                          ? { background: "#FEF3C7", color: "#B45309" }
                          : { background: "#FEE2E2", color: "#B91C1C" }
                      }
                    >
                      {reason}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Issued by + active by location */}
        <div className="flex flex-col gap-4">
          <div className="card !p-5">
            <h3 className="text-base font-bold text-brand-black">No. of Permits Issued by</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3 text-center" style={{ background: "#FFEDD5" }}>
                <p className="text-2xl font-extrabold text-brand-black">{issuedFF}</p>
                <p className="text-xs font-semibold text-brand-grayDark">First Fix (FF)</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "#DBEAFE" }}>
                <p className="text-2xl font-extrabold text-brand-black">{issuedClient}</p>
                <p className="text-xs font-semibold text-brand-grayDark">Client</p>
              </div>
            </div>
            {issuedUnset > 0 && (
              <p className="mt-2 text-xs text-brand-gray">{issuedUnset} permit(s) without an issuer set</p>
            )}
          </div>

          <div className="card flex-1 !p-5">
            <h3 className="text-base font-bold text-brand-black">Active by Work Location</h3>
            {byLocation.length === 0 ? (
              <p className="mt-4 text-center text-sm text-brand-gray">No active permits</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {byLocation.map((r) => (
                  <li key={r.label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2 text-brand-grayDark">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-orange" />
                      <span className="truncate">{r.label}</span>
                    </span>
                    <span className="font-bold text-brand-black">{r.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
