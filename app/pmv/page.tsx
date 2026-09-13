"use client";

import { useMemo } from "react";
import {
  Boxes,
  CalendarClock,
  Check,
  Construction,
  Container,
  FileWarning,
  Forklift,
  Tractor,
  Truck,
  UserCheck,
  Zap,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardBackground from "@/components/DashboardBackground";
import Badge from "@/components/Badge";
import { EQUIPMENT_ICONS } from "@/components/pmv/EquipmentIcons";
import { useLanguage } from "@/context/LanguageContext";
import { getChartColor } from "@/lib/statusColors";
import {
  EXPIRING_DOCUMENTS,
  OPERATOR_STATUS,
  PMV_BY_TYPE,
  PMV_SUMMARY,
  UPCOMING_INSPECTIONS,
} from "@/lib/pmvData";
import type { PmvTypeBreakdown } from "@/types/pmv";

export default function PmvPage() {
  return (
    <ProtectedRoute>
      <PmvContent />
    </ProtectedRoute>
  );
}

type CardTone = "orange" | "amber" | "green" | "red";

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

const MAX_TYPE_TOTAL = Math.max(...PMV_BY_TYPE.map((row) => row.total));

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
        <p className="truncate text-sm font-semibold uppercase tracking-wide text-brand-gray">
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

function PmvContent() {
  const { t, locale } = useLanguage();
  const s = PMV_SUMMARY;

  const duePct = s.totalPmv > 0 ? Math.round((s.dueForInspection / s.totalPmv) * 100) : 0;
  const operatorsPct =
    s.totalOperators > 0 ? Math.round((s.authorizedOperators / s.totalOperators) * 100) : 0;
  const docsPct =
    s.totalDocuments > 0 ? Math.round((s.expiringDocuments / s.totalDocuments) * 100) : 0;

  const operatorStatusRows = useMemo(
    () => [
      { key: "Active", value: OPERATOR_STATUS.active, label: t.pmv.statusActive },
      { key: "Inactive", value: OPERATOR_STATUS.inactive, label: t.pmv.statusInactive },
      { key: "Suspended", value: OPERATOR_STATUS.suspended, label: t.pmv.statusSuspended },
      { key: "On Leave", value: OPERATOR_STATUS.onLeave, label: t.pmv.statusOnLeave },
    ],
    [t]
  );

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
    <div className="relative isolate">
      <DashboardBackground />
      <div className="relative z-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-black">{t.pmv.title}</h1>
        </div>

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
              {PMV_BY_TYPE.map((row) => {
                const EquipmentIcon = EQUIPMENT_ICONS[row.key];
                const TypeIcon = TYPE_ICONS[row.key];
                const pct = row.total > 0 ? Math.round((row.available / row.total) * 100) : 0;
                const barColor = TYPE_BAR_COLORS[row.key];
                const barHeight = Math.max(14, Math.round((row.total / MAX_TYPE_TOTAL) * 100));
                return (
                  <div key={row.key} className="flex min-w-[92px] flex-1 flex-col items-center">
                    <span className="text-lg font-extrabold text-brand-black">{row.total}</span>
                    <div className="relative mt-1 flex h-[108px] w-full items-end justify-center">
                      <div
                        className="w-9 rounded-t-md"
                        style={{ height: `${barHeight}px`, backgroundColor: barColor }}
                      />
                      <div className="absolute -top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/5">
                        <EquipmentIcon className="h-7 w-7" />
                      </div>
                      <div className="absolute -top-3 right-1/2 flex h-4 w-4 translate-x-6 items-center justify-center rounded-full bg-green-500 ring-2 ring-white">
                        <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                      </div>
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
              {t.pmv.totalOperatorsLabel}: {PMV_SUMMARY.totalOperators.toLocaleString()}
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
                      background: "var(--brand-surface, #1f2937)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-brand-black">
                  {PMV_SUMMARY.authorizedOperators}
                </span>
                <span className="text-xs font-medium text-brand-gray">{t.pmv.statusActive}</span>
              </div>
            </div>

            <h3 className="mt-4 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
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
                <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                  <th className="px-4 py-3 text-start sm:px-6">{t.pmv.colPmvId}</th>
                  <th className="px-4 py-3 text-start sm:px-6">{t.pmv.colType}</th>
                  <th className="px-4 py-3 text-start sm:px-6">{t.pmv.colDescription}</th>
                  <th className="px-4 py-3 text-start sm:px-6">{t.pmv.colDueDate}</th>
                  <th className="px-4 py-3 text-start sm:px-6">{t.pmv.colStatus}</th>
                </tr>
              </thead>
              <tbody>
                {UPCOMING_INSPECTIONS.map((row) => (
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
                      {new Date(row.dueDate).toLocaleDateString(
                        locale === "ar" ? "ar-EG" : "en-US",
                        { year: "numeric", month: "short", day: "numeric" }
                      )}
                    </td>
                    <td className="px-4 py-3 sm:px-6">
                      <Badge value={row.status} />
                    </td>
                  </tr>
                ))}
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
                <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                  <th className="px-4 py-3 text-start sm:px-6">{t.pmv.colDocumentType}</th>
                  <th className="px-4 py-3 text-end sm:px-6">{t.pmv.colCount}</th>
                </tr>
              </thead>
              <tbody>
                {EXPIRING_DOCUMENTS.map((row) => (
                  <tr
                    key={row.documentType}
                    className="border-b border-brand-border transition last:border-0 hover:bg-brand-grayLight/30"
                  >
                    <td className="px-4 py-3 text-brand-grayDark sm:px-6">{row.documentType}</td>
                    <td className="px-4 py-3 text-end font-semibold text-brand-black sm:px-6">
                      {row.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
