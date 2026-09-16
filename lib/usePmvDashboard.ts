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
import { fetchAllRows } from "@/lib/supabaseClient";
import { PMV_CATEGORY_TO_BUCKET } from "@/lib/pmvLogs";
import type {
  ExpiringDocumentRow,
  InspectionStatus,
  OperatorStatusCounts,
  PmvSummary,
  PmvTypeBreakdown,
  UpcomingInspection,
} from "@/types/pmv";

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
  upcomingInspections: [],
  expiringDocuments: [],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

export function usePmvDashboard(): PmvDashboardData {
  const [data, setData] = useState<LiveData>(EMPTY_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [assets, maintenance, ownedOps, rentedOps] = await Promise.all([
          fetchAllRows<Row>("pmv_asset_register", (q) => q.select("*")),
          fetchAllRows<Row>("pmv_scheduled_maintenance", (q) => q.select("*")),
          fetchAllRows<Row>("pmv_operators_owned", (q) => q.select("*")),
          fetchAllRows<Row>("pmv_operators_rented", (q) => q.select("*")),
        ]);
        if (!active) return;

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
          const category = String(row.equipment_category ?? "");
          const bucket = CATEGORY_TO_BUCKET[category] ?? "otherEquipment";
          byTypeTotals[bucket].total += 1;
          if (row.deployment_status === "Available for Use") {
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

        // --- Due for inspection ---
        const dueForInspection = maintenance.filter(
          (m) =>
            m.current_maintenance_status === "Due" ||
            m.current_maintenance_status === "Overdue"
        ).length;

        // --- Operators ---
        // pmv_operators_owned tracks Present/On Leave directly.
        // pmv_operators_rented has no status column in the source workbook,
        // so a rented operator counts as active unless they've been
        // released (equipment_release_date set) — there's no "Suspended"
        // concept anywhere in the schema, so that bucket is always 0.
        const activeOwned = ownedOps.filter((o) => o.current_status === "Present").length;
        const onLeaveOwned = ownedOps.filter((o) => o.current_status === "On Leave").length;
        const activeRented = rentedOps.filter((o) => !o.equipment_release_date).length;
        const releasedRented = rentedOps.filter((o) => !!o.equipment_release_date).length;

        const operatorStatus: OperatorStatusCounts = {
          active: activeOwned + activeRented,
          onLeave: onLeaveOwned,
          inactive: releasedRented,
          suspended: 0,
        };
        const totalOperators = ownedOps.length + rentedOps.length;
        const authorizedOperators = operatorStatus.active;

        // --- Expiring documents (within 30 days, or already expired) ---
        const docCounters: Record<string, number> = {
          "Third Party Inspection": 0,
          Insurance: 0,
          "Rental Agreement": 0,
          "TUV Certification": 0,
        };
        let totalDocuments = 0;

        assets.forEach((row) => {
          if (row.third_party_inspection_expiry) {
            totalDocuments += 1;
            if (isExpiringOrExpired(row.third_party_inspection_expiry)) {
              docCounters["Third Party Inspection"] += 1;
            }
          }
          if (row.insurance_expiry) {
            totalDocuments += 1;
            if (isExpiringOrExpired(row.insurance_expiry)) {
              docCounters["Insurance"] += 1;
            }
          }
          if (row.rental_agreement_expiry_date) {
            totalDocuments += 1;
            if (isExpiringOrExpired(row.rental_agreement_expiry_date)) {
              docCounters["Rental Agreement"] += 1;
            }
          }
        });
        [...ownedOps, ...rentedOps].forEach((row) => {
          if (row.tuv_certification_expiry) {
            totalDocuments += 1;
            if (isExpiringOrExpired(row.tuv_certification_expiry)) {
              docCounters["TUV Certification"] += 1;
            }
          }
        });

        const expiringDocumentsCount = Object.values(docCounters).reduce(
          (a, b) => a + b,
          0
        );
        const expiringDocuments: ExpiringDocumentRow[] = Object.entries(docCounters)
          .filter(([, count]) => count > 0)
          .map(([documentType, count]) => ({ documentType, count }));

        // --- Upcoming inspections (Due/Overdue maintenance, nearest first) ---
        const upcomingInspections: UpcomingInspection[] = maintenance
          .filter(
            (m) =>
              m.current_maintenance_status === "Due" ||
              m.current_maintenance_status === "Overdue"
          )
          .map((m) => {
            const days = daysUntil(m.next_maintenance_date);
            let status: InspectionStatus = "On Time";
            if (m.current_maintenance_status === "Overdue" || (days !== null && days < 0)) {
              status = "Overdue";
            } else if (days !== null && days <= 14) {
              status = "Due Soon";
            }
            return {
              pmvId: String(m.asset_id ?? m.plate_no ?? "—"),
              type: String(m.asset_category ?? "—"),
              description: String(m.asset_description ?? "—"),
              dueDate: m.next_maintenance_date ?? "",
              status,
            };
          })
          .sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"))
          .slice(0, 10);

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
  }, []);

  return { ...data, isLoading };
}
