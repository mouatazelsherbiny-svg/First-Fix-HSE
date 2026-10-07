"use client";

/**
 * Live PMV Dashboard data — replaces the old lib/pmvData.ts placeholder
 * numbers with real aggregates computed from the PMV Log tables
 * (pmv_asset_register, pmv_scheduled_maintenance, pmv_operators_owned,
 * pmv_operators_rented). Starts at all-zero until the first fetch
 * resolves, then reflects whatever has actually been entered in the PMV
 * Log tab — no fake numbers.
 *
 * The shapes returned match types/pmv.ts exactly, so app/pmv/page.tsx's
 * existing render logic (percentages, chart, tables) needs no changes
 * beyond swapping its data source to this hook.
 */

import { useEffect, useState } from "react";
import { useProjectFilter } from "@/context/ProjectFilterContext";
import { fetchAllRows } from "@/lib/supabaseClient";
import { PMV_CATEGORY_TO_BUCKET, assetStatusOf, assetTypeOf } from "@/lib/pmvLogs";
import type {
  ExpiringDocumentRow,
  InspectionStatus,
  OperatorStatusCounts,
  PmvSummary,
  PmvTypeBreakdown,
  UpcomingInspection,
  VehicleStatusCounts,
} from "@/types/pmv";

/** FF (company-owned) / Rental filter for the whole PMV dashboard. */
export type PmvOwnershipFilter = "all" | "Owned" | "Rented";

type CategoryBucket = PmvTypeBreakdown["key"];

// Category -> photo-bucket mapping now lives in lib/pmvLogs.ts (shared
// with the Equipment Tracker's cards, which need the exact same mapping).
const CATEGORY_TO_BUCKET: Record<string, CategoryBucket> = PMV_CATEGORY_TO_BUCKET;

const ROAD_CATEGORIES = new Set(["Vehicle", "Pickup", "Mini Van", "Bus", "Truck"]);
const MACHINERY_CATEGORIES = new Set([
  "Excavator",
  "Forklift",
  "Crane",
  "Concrete Mixer",
  "Scissor Lift",
  "Scaffolding",
  "Compressor",
  "Pump",
]);
// Everything else (Generator, Lighting, Welding Machine, Other) counts as
// general "equipment" for the Total PMV sublabel split.

const ALL_BUCKETS: CategoryBucket[] = [
  "vehicles",
  "excavators",
  "loaders",
  "forklifts",
  "dumpTrucks",
  "generators",
  "otherEquipment",
];

const DAY_MS = 24 * 60 * 60 * 1000;
// A document counts as "expiring" once it's within 30 days of its expiry
// date, or already past it.
const EXPIRY_WINDOW_DAYS = 30;
// Inspections listed once they're due within a month (or overdue).
const INSPECTION_WINDOW_DAYS = 30;

function daysUntil(dateStr: unknown): number | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return (d.getTime() - Date.now()) / DAY_MS;
}

function isExpiringOrExpired(dateStr: unknown): boolean {
  const days = daysUntil(dateStr);
  return days !== null && days <= EXPIRY_WINDOW_DAYS;
}

export interface PmvDashboardData {
  summary: PmvSummary;
  byType: PmvTypeBreakdown[];
  operatorStatus: OperatorStatusCounts;
  vehicleStatus: VehicleStatusCounts;
  upcomingInspections: UpcomingInspection[];
  expiringDocuments: ExpiringDocumentRow[];
  isLoading: boolean;
}

const EMPTY_SUMMARY: PmvSummary = {
  totalPmv: 0,
  vehiclesCount: 0,
  machineryCount: 0,
  equipmentCount: 0,
  dueForInspection: 0,
  authorizedOperators: 0,
  totalOperators: 0,
  expiringDocuments: 0,
  totalDocuments: 0,
};

const EMPTY_BY_TYPE: PmvTypeBreakdown[] = ALL_BUCKETS.map((key) => ({
  key,
  total: 0,
  available: 0,
}));

const EMPTY_OPERATOR_STATUS: OperatorStatusCounts = {
  active: 0,
  inactive: 0,
  suspended: 0,
  onLeave: 0,
};

type LiveData = Omit<PmvDashboardData, "isLoading">;

const EMPTY_DATA: LiveData = {
  summary: EMPTY_SUMMARY,
  byType: EMPTY_BY_TYPE,
  operatorStatus: EMPTY_OPERATOR_STATUS,
  vehicleStatus: { active: 0, inactive: 0, suspended: 0 },
  upcomingInspections: [],
  expiringDocuments: [],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

export function usePmvDashboard(ownership: PmvOwnershipFilter = "all"): PmvDashboardData {
  const [data, setData] = useState<LiveData>(EMPTY_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const { project } = useProjectFilter();

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        // App-wide project filter (see context/ProjectFilterContext.tsx).
        const scope = (rows: Row[]) =>
          project ? rows.filter((r) => String(r.project_name ?? "").trim() === project) : rows;
        const [allAssets, allMaintenance, allOwnedOps, allRentedOps] = (await Promise.all([
          fetchAllRows<Row>("pmv_asset_register", (q) => q.select("*")),
          fetchAllRows<Row>("pmv_scheduled_maintenance", (q) => q.select("*")),
          fetchAllRows<Row>("pmv_operators_owned", (q) => q.select("*")),
          fetchAllRows<Row>("pmv_operators_rented", (q) => q.select("*")),
        ])).map(scope);
        if (!active) return;

        // FF / Rental filter: assets and maintenance carry an `ownership`
        // column; operators live in separate owned / rented tables.
        const byOwnership = (rows: Row[]) =>
          ownership === "all" ? rows : rows.filter((r) => String(r.ownership ?? "") === ownership);
        const assets = byOwnership(allAssets);
        const maintenance = byOwnership(allMaintenance);
        const ownedOps = ownership === "Rented" ? [] : allOwnedOps;
        const rentedOps = ownership === "Owned" ? [] : allRentedOps;

        // --- PMV by Type + vehicles/machinery/equipment split ---
        const byTypeTotals: Record<CategoryBucket, { total: number; available: number }> =
          Object.fromEntries(
            ALL_BUCKETS.map((k) => [k, { total: 0, available: 0 }])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ) as any;

        let vehiclesCount = 0;
        let machineryCount = 0;
        let equipmentCount = 0;

        assets.forEach((row) => {
          const category = assetTypeOf(row);
          const bucket = CATEGORY_TO_BUCKET[category] ?? "otherEquipment";
          byTypeTotals[bucket].total += 1;
          if (assetStatusOf(row) === "Active") {
            byTypeTotals[bucket].available += 1;
          }

          if (ROAD_CATEGORIES.has(category)) vehiclesCount += 1;
          else if (MACHINERY_CATEGORIES.has(category)) machineryCount += 1;
          else equipmentCount += 1;
        });

        const byType: PmvTypeBreakdown[] = ALL_BUCKETS.map((key) => ({
          key,
          total: byTypeTotals[key].total,
          available: byTypeTotals[key].available,
        }));

        const totalPmv = assets.length;

        // --- Inspections due within a month (or overdue) ---
        // Red = overdue or due within 2 weeks, orange = due within the month.
        const dueRows: UpcomingInspection[] = maintenance
          .filter((m) => m.current_maintenance_status !== "Completed")
          .map((m) => ({ m, days: daysUntil(m.next_maintenance_date) }))
          .filter(
            ({ m, days }) =>
              m.current_maintenance_status === "Overdue" || (days !== null && days <= INSPECTION_WINDOW_DAYS)
          )
          .map(({ m, days }) => {
            let status: InspectionStatus = "Due this month";
            if (m.current_maintenance_status === "Overdue" || (days !== null && days < 0)) status = "Overdue";
            else if (days !== null && days <= 14) status = "Due in 2 weeks";
            return {
              pmvId: String(m.asset_id ?? m.plate_no ?? "—"),
              type: String(m.asset_category ?? "—"),
              description: String(m.asset_description ?? "—"),
              dueDate: m.next_maintenance_date ?? "",
              status,
            };
          })
          .sort((x, y) => (x.dueDate || "0000").localeCompare(y.dueDate || "0000"));
        const dueForInspection = dueRows.length;

        // --- Operators ---
        // Owned: Present = active, On Leave = inactive, Suspended = suspended.
        // Rented (no status column): active until released from equipment.
        const activeOwned = ownedOps.filter((o) => o.current_status === "Present").length;
        const suspendedOwned = ownedOps.filter((o) => o.current_status === "Suspended").length;
        const inactiveOwned = ownedOps.length - activeOwned - suspendedOwned;
        const activeRented = rentedOps.filter((o) => !o.equipment_release_date).length;
        const releasedRented = rentedOps.length - activeRented;

        const operatorStatus: OperatorStatusCounts = {
          active: activeOwned + activeRented,
          inactive: inactiveOwned + releasedRented,
          suspended: suspendedOwned,
          onLeave: 0,
        };
        const totalOperators = ownedOps.length + rentedOps.length;
        const authorizedOperators = operatorStatus.active;

        // --- Vehicles / equipment ---
        // Active = working; Suspended = broken down / under repair;
        // Inactive = idle, returned, demobilized or disposed.
        const vehicleStatus: VehicleStatusCounts = { active: 0, inactive: 0, suspended: 0 };
        assets.forEach((row) => {
          const st = assetStatusOf(row);
          if (st === "Suspended") vehicleStatus.suspended += 1;
          else if (st === "Active") vehicleStatus.active += 1;
          else vehicleStatus.inactive += 1;
        });

        // --- Expiring documents (within 30 days, or already expired) ---
        const opsLog = ownership === "Rented" ? "operatorsRented" : "operatorsOwned";
        const operators = [...ownedOps, ...rentedOps];
        const docSpecs: { documentType: string; rows: Row[]; field: string; logKey: string }[] = [
          { documentType: "3rd Party Operator", rows: operators, field: "third_party_certification_expiry", logKey: opsLog },
          { documentType: "3rd Party Vehicle", rows: assets, field: "third_party_inspection_expiry", logKey: "assetRegister" },
          { documentType: "TUV Operator", rows: operators, field: "tuv_certification_expiry", logKey: opsLog },
          { documentType: "TUV Vehicle", rows: assets, field: "tuv_certification_expiry", logKey: "assetRegister" },
          { documentType: "Insurance", rows: assets, field: "insurance_expiry", logKey: "assetRegister" },
        ];
        let totalDocuments = 0;
        const expiringDocuments: ExpiringDocumentRow[] = docSpecs.map((d) => {
          const withDate = d.rows.filter((r) => !!r[d.field]);
          totalDocuments += withDate.length;
          return {
            documentType: d.documentType,
            count: withDate.filter((r) => isExpiringOrExpired(r[d.field])).length,
            logKey: d.logKey,
          };
        });
        const expiringDocumentsCount = expiringDocuments.reduce((a, r) => a + r.count, 0);
        const upcomingInspections = dueRows.slice(0, 10);

        setData({
          summary: {
            totalPmv,
            vehiclesCount,
            machineryCount,
            equipmentCount,
            dueForInspection,
            authorizedOperators,
            totalOperators,
            expiringDocuments: expiringDocumentsCount,
            totalDocuments,
          },
          byType,
          operatorStatus,
          vehicleStatus,
          upcomingInspections,
          expiringDocuments,
        });
      } catch {
        // Leave the all-zero defaults in place — a failed fetch should
        // never show fake numbers.
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [project, ownership]);

  return { ...data, isLoading };
}
