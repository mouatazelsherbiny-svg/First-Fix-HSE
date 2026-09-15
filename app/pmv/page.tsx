"use client";

import { useState } from "react";
import {
  Boxes,
  CalendarClock,
  ClipboardList,
  Construction,
  Container,
  FileWarning,
  Forklift,
  LayoutDashboard,
  MapPinned,
  Tractor,
  Truck,
  UserCheck,
  Zap,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardBackground from "@/components/DashboardBackground";
import Badge from "@/components/Badge";
import { useLanguage } from "@/context/LanguageContext";
import { getChartColor } from "@/lib/statusColors";
import { usePmvDashboard } from "@/lib/usePmvDashboard";
import { PMV_LOG_DEFINITIONS } from "@/lib/pmvLogs";
import PmvLogTable from "@/components/pmv/PmvLogTable";
import EquipmentTracker from "@/components/pmv/EquipmentTracker";
import type { PmvTypeBreakdown } from "@/types/pmv";

export default function PmvPage() {
  return (
    <ProtectedRoute>
      <PmvPageContent />
    </ProtectedRoute>
  );
}

type CardTone = "orange" | "amber" | "green" | "red";
type PmvTab = "dashboard" | "log" | "tracker";

const TONE_CLASSES: Record<CardTone, string> = {
  orange: "bg-brand-orange/20 text-brand-orange",
  amber: "bg-amber-500/20 text-amber-400",
  green: "bg-green-500/20 text-green-400",
  red: "bg-red-500/20 text-red-400",
};

const TYPE_ICONS: Record<PmvTypeBreakdown["key"], React.ElementType> = {
  vehicles: Truck,
  excavators: Construction,
  loaders: Tractor,
  forklifts: Forklift,
  dumpTrucks: Truck,
  generators: Zap,
  otherEquipment: Container,
};

// Everyday equipment colors used for the "PMV by Type" bars — matches the
// natural color of each machine type rather than the app's status palette.
const TYPE_BAR_COLORS: Record<PmvTypeBreakdown["key"], string> = {
  vehicles: "#3B82F6",
  excavators: "#F59E0B",
  loaders: "#22C55E",
  forklifts: "#8B5CF6",
  dumpTrucks: "#14B8A6",
  generators: "#94A3B8",
  otherEquipment: "#F43F5E",
};

// Real product photos (background removed) for each equipment type, served
// from /public/pmv. Swap the file to change a picture; no code change needed.
const EQUIPMENT_IMAGES: Record<PmvTypeBreakdown["key"], string> = {
  vehicles: "/pmv/vehicles.png",
  excavators: "/pmv/excavators.png",
  loaders: "/pmv/loaders.png",
  forklifts: "/pmv/forklifts.png",
  dumpTrucks: "/pmv/dumpTrucks.png",
  generators: "/pmv/generators.png",
  otherEquipment: "/pmv/otherEquipment.png",
};

// Max bar height in px (tallest category, currently Vehicles) and the fixed
// box every equipment photo scales to fit inside (object-contain keeps each
// photo's own aspect ratio regardless of orientation).
const MAX_BAR_HEIGHT_PX = 120;
const IMAGE_BOX_HEIGHT_PX = 104;
const IMAGE_BOX_WIDTH_PX = 128;

function IconBadge({ icon, tone }: { icon: React.ReactNode; tone: CardTone }) {
  return (
    <div
      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${TONE_CLASSES[tone]}`}
    >
      {icon}
    </div>
  );
}

function StatCard({
  icon,
  tone,
  label,
  value,
  sublabel,
}: {
  icon: React.ReactNode;
  tone: CardTone;
  label: string;
  value: number;
  sublabel: string;
}) {
  return (
    <div className="card flex items-center gap-5 !p-7">
      <IconBadge icon={icon} tone={tone} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-wide text-brand-gray">
          {label}
        </p>
        <p className="mt-2 text-4xl font-extrabold leading-none text-brand-black">
          {value.toLocaleString()}
        </p>
        <p className="mt-1 truncate text-sm font-medium text-brand-gray">{sublabel}</p>
      </div>
    </div>
  );
}

function PmvPageContent() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<PmvTab>("dashboard");

  return (
    <div className="relative isolate">
      <DashboardBackground />
      <div className="relative z-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-brand-black">{t.pmv.title}</h1>

          <div className="inline-flex rounded-xl border border-brand-border bg-brand-surface/60 p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setTab("dashboard")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === "dashboard"
                  ? "bg-brand-orange text-brand-onAccent shadow-sm"
                  : "text-brand-grayDark hover:bg-brand-grayLight/60"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              {t.pmv.tabDashboard}
            </button>
            <button
              type="button"
              onClick={() => setTab("log")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === "log"
                  ? "bg-brand-orange text-brand-onAccent shadow-sm"
                  : "text-brand-grayDark hover:bg-brand-grayLight/60"
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              {t.pmv.tabLog}
            </button>
            <button
              type="button"
              onClick={() => setTab("tracker")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === "tracker"
                  ? "bg-brand-orange text-brand-onAccent shadow-sm"
                  : "text-brand-grayDark hover:bg-brand-grayLight/60"
              }`}
            >
              <MapPinned className="h-4 w-4" />
              {t.pmv.tabTracker}
            </button>
          </div>
        </div>

        {tab === "dashboard" ? (
          <PmvDashboard />
        ) : tab === "log" ? (
          <PmvLogSection />
        ) : (
          <EquipmentTracker />
        )}
      </div>
    </div>
  );
}

function PmvLogSection() {
  const { locale } = useLanguage();
  const [activeKey, setActiveKey] = useState<string>(
    PMV_LOG_DEFINITIONS[0]?.key ?? ""
  );
  const activeDefinition =
    PMV_LOG_DEFINITIONS.find((d) => d.key === activeKey) ??
    PMV_LOG_DEFINITIONS[0];

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {PMV_LOG_DEFINITIONS.map((def) => (
          <button
            key={def.key}
            type="button"
            onClick={() => setActiveKey(def.key)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              def.key === activeDefinition?.key
                ? "bg-brand-orange text-brand-onAccent shadow-sm"
                : "border border-brand-border bg-brand-surface/60 text-brand-grayDark hover:bg-brand-grayLight/60"
            }`}
          >
            {locale === "ar" ? def.titleAr : def.titleEn}
          </button>
        ))}
      </div>

      {activeDefinition && <PmvLogTable definition={activeDefinition} />}
    </div>
  );
}

function PmvDashboard() {
  const { t, locale } = useLanguage();
  const {
    summary: s,
    byType,
    operatorStatus,
    upcomingInspections,
    expiringDocuments,
  } = usePmvDashboard();

  const duePct = s.totalPmv > 0 ? Math.round((s.dueForInspection / s.totalPmv) * 100) : 0;
  const operatorsPct =
    s.totalOperators > 0 ? Math.round((s.authorizedOperators / s.totalOperators) * 100) : 0;
  const docsPct =
    s.totalDocuments > 0 ? Math.round((s.expiringDocuments / s.totalDocuments) * 100) : 0;

  // At least 1 so a chart with no data yet doesn't divide by zero.
  const maxTypeTotal = Math.max(1, ...byType.map((row) => row.total));

  const operatorStatusRows = [
    { key: "Active", value: operatorStatus.active, label: t.pmv.statusActive },
    { key: "Inactive", value: operatorStatus.inactive, label: t.pmv.statusInactive },
    { key: "Suspended", value: operatorStatus.suspended, label: t.pmv.statusSuspended },
    { key: "On Leave", value: operatorStatus.onLeave, label: t.pmv.statusOnLeave },
  ];

  const typeLabel = (key: PmvTypeBreakdown["key"]) =>
    ({
      vehicles: t.pmv.typeVehicles,
      excavators: t.pmv.typeExcavators,
      loaders: t.pmv.typeLoaders,
      forklifts: t.pmv.typeForklifts,
      dumpTrucks: t.pmv.typeDumpTrucks,
      generators: t.pmv.typeGenerators,
      otherEquipment: t.pmv.typeOtherEquipment,
    }[key]);

  return (
    <div>
      {/* Summary cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Boxes className="h-8 w-8" />}
          tone="orange"
          label={t.pmv.totalPmv}
          value={s.totalPmv}
          sublabel={`${s.vehiclesCount} ${t.pmv.vehiclesUnit} · ${s.machineryCount} ${t.pmv.machineryUnit} · ${s.equipmentCount} ${t.pmv.equipmentUnit}`}
        />
        <StatCard
          icon={<CalendarClock className="h-8 w-8" />}
          tone="amber"
          label={t.pmv.dueForInspection}
          value={s.dueForInspection}
          sublabel={`${duePct}% ${t.pmv.ofTotalPmv}`}
        />
        <StatCard
          icon={<UserCheck className="h-8 w-8" />}
          tone="green"
          label={t.pmv.authorizedOperators}
          value={s.authorizedOperators}
          sublabel={`${operatorsPct}% ${t.pmv.ofTotalOperators}`}
        />
        <StatCard
          icon={<FileWarning className="h-8 w-8" />}
          tone="red"
          label={t.pmv.expiringDocuments}
          value={s.expiringDocuments}
          sublabel={`${docsPct}% ${t.pmv.ofTotalDocuments}`}
        />
      </div>

      {/* PMV by Type + Operators Overview */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-bold text-brand-black">{t.pmv.byTypeTitle}</h2>
          <p className="mt-1 text-sm text-brand-gray">{t.pmv.byTypeSubtitle}</p>
          <div className="mt-8 flex items-end justify-between gap-2 overflow-x-auto pb-2">
            {byType.map((row) => {
              const TypeIcon = TYPE_ICONS[row.key];
              const pct = row.total > 0 ? Math.round((row.available / row.total) * 100) : 0;
              const barColor = TYPE_BAR_COLORS[row.key];
              const barHeight = Math.max(14, Math.round((row.total / maxTypeTotal) * MAX_BAR_HEIGHT_PX));
              const stackHeight = MAX_BAR_HEIGHT_PX + IMAGE_BOX_HEIGHT_PX;
              return (
                <div key={row.key} className="flex min-w-[130px] flex-1 flex-col items-center">
                  <span className="text-lg font-extrabold text-brand-black">{row.total}</span>
                  <div
                    className="relative mt-1 w-full"
                    style={{ height: `${stackHeight}px` }}
                  >
                    <div
                      className="absolute bottom-0 left-1/2 w-10 -translate-x-1/2 rounded-t-md"
                      style={{ height: `${barHeight}px`, backgroundColor: barColor }}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={EQUIPMENT_IMAGES[row.key]}
                      alt={typeLabel(row.key)}
                      className="absolute left-1/2 -translate-x-1/2 object-contain drop-shadow-xl"
                      style={{
                        bottom: `${Math.max(0, barHeight - 6)}px`,
                        height: `${IMAGE_BOX_HEIGHT_PX}px`,
                        width: `${IMAGE_BOX_WIDTH_PX}px`,
                      }}
                    />
                  </div>
                  <div
                    className="mt-2 flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: barColor }}
                  >
                    <TypeIcon className="h-4 w-4 text-white" />
                  </div>
                  <span className="mt-2 text-center text-xs font-bold text-brand-black">
                    {typeLabel(row.key)}
                  </span>
                  <span className="mt-1 text-center text-[11px] font-medium text-brand-gray">
                    {t.pmv.available} {row.available}/{row.total}
                  </span>
                  <span className="text-center text-[11px] text-brand-gray">({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card flex flex-col">
          <h2 className="text-lg font-bold text-brand-black">{t.pmv.operatorsOverviewTitle}</h2>
          <p className="mt-1 text-sm text-brand-gray">
            {t.pmv.totalOperatorsLabel}: {s.totalOperators.toLocaleString()}
          </p>

          <div className="relative mx-auto mt-2 h-48 w-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={operatorStatusRows}
                  dataKey="value"
                  nameKey="label"
                  innerRadius="65%"
                  outerRadius="100%"
                  paddingAngle={2}
                  stroke="none"
                >
                  {operatorStatusRows.map((row) => (
                    <Cell key={row.key} fill={getChartColor(row.key)} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--brand-surface, #ffffff)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 12,
                    fontSize: 12,
                    boxShadow: "0 6px 20px rgba(20,38,32,0.10)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-brand-black">
                {s.authorizedOperators}
              </span>
              <span className="text-xs font-medium text-brand-gray">{t.pmv.statusActive}</span>
            </div>
          </div>

          <h3 className="mt-4 text-sm font-bold tracking-wide text-brand-grayDark">
            {t.pmv.operatorsStatusTitle}
          </h3>
          <ul className="mt-3 space-y-2">
            {operatorStatusRows.map((row) => (
              <li key={row.key} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-brand-grayDark">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: getChartColor(row.key) }}
                  />
                  {row.label}
                </span>
                <span className="font-semibold text-brand-black">
                  {row.value.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-xl border border-brand-orange/25 bg-brand-orange/10 p-4 text-sm font-medium text-brand-grayDark">
            {t.pmv.ctaBanner}
          </div>
        </div>
      </div>

      {/* Upcoming Inspections + Expiring Documents */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card overflow-x-auto !p-0 lg:col-span-2">
          <div className="p-6 pb-0">
            <h2 className="text-lg font-bold text-brand-black">
              {t.pmv.upcomingInspectionsTitle}
            </h2>
            <p className="mt-1 text-sm text-brand-gray">{t.pmv.dueForInspectionSubtitle}</p>
          </div>
          <table className="mt-4 w-full text-start text-sm">
            <thead>
              <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold tracking-wide text-brand-gray">
                <th className="px-4 py-3 text-start sm:px-6">{t.pmv.colPmvId}</th>
                <th className="px-4 py-3 text-start sm:px-6">{t.pmv.colType}</th>
                <th className="px-4 py-3 text-start sm:px-6">{t.pmv.colDescription}</th>
                <th className="px-4 py-3 text-start sm:px-6">{t.pmv.colDueDate}</th>
                <th className="px-4 py-3 text-start sm:px-6">{t.pmv.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {upcomingInspections.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-brand-gray">
                    {t.common.noDataYet}
                  </td>
                </tr>
              ) : (
                upcomingInspections.map((row) => (
                  <tr
                    key={row.pmvId}
                    className="border-b border-brand-border transition last:border-0 hover:bg-brand-grayLight/30"
                  >
                    <td className="px-4 py-3 font-semibold text-brand-black sm:px-6">
                      {row.pmvId}
                    </td>
                    <td className="px-4 py-3 text-brand-grayDark sm:px-6">{row.type}</td>
                    <td className="px-4 py-3 text-brand-grayDark sm:px-6">{row.description}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-brand-grayDark sm:px-6">
                      {row.dueDate
                        ? new Date(row.dueDate).toLocaleDateString(
                            locale === "ar" ? "ar-EG" : "en-US",
                            { year: "numeric", month: "short", day: "numeric" }
                          )
                        : "—"}
                    </td>
                    <td className="px-4 py-3 sm:px-6">
                      <Badge value={row.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="card overflow-x-auto !p-0">
          <div className="p-6 pb-0">
            <h2 className="text-lg font-bold text-brand-black">
              {t.pmv.expiringDocumentsTitle}
            </h2>
          </div>
          <table className="mt-4 w-full text-start text-sm">
            <thead>
              <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold tracking-wide text-brand-gray">
                <th className="px-4 py-3 text-start sm:px-6">{t.pmv.colDocumentType}</th>
                <th className="px-4 py-3 text-end sm:px-6">{t.pmv.colCount}</th>
              </tr>
            </thead>
            <tbody>
              {expiringDocuments.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-brand-gray">
                    {t.common.noDataYet}
                  </td>
                </tr>
              ) : (
                expiringDocuments.map((row) => (
                  <tr
                    key={row.documentType}
                    className="border-b border-brand-border transition last:border-0 hover:bg-brand-grayLight/30"
                  >
                    <td className="px-4 py-3 text-brand-grayDark sm:px-6">{row.documentType}</td>
                    <td className="px-4 py-3 text-end font-semibold text-brand-black sm:px-6">
                      {row.count}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
