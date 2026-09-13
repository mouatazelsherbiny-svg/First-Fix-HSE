/**
 * Flat, colored illustrations for each PMV equipment type — used on the
 * "PMV by Type" chart in app/pmv/page.tsx so every category shows an actual
 * picture of the machine instead of a plain line icon. Each icon is a
 * self-contained SVG on a fixed 48x32 viewBox (side-view silhouette) so they
 * drop into the same-sized slot regardless of which one renders.
 *
 * Colors are the everyday real-world colors for each machine type (white
 * pickup, yellow/orange earthmoving equipment, red dump bed, yellow/black
 * scissor lift, etc.) rather than brand colors, so they read correctly at a
 * glance the way the equipment does in real life.
 */
import type { PmvTypeBreakdown } from "@/types/pmv";

type IconProps = { className?: string };

export function VehicleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true">
      <rect x="2" y="16" width="44" height="6" rx="1" fill="#CBD5E1" />
      <path
        d="M4 16 L4 10 Q4 8 6 8 H19 L24 4 H31 Q33 4 33 6 V16 Z"
        fill="#F8FAFC"
        stroke="#94A3B8"
        strokeWidth="1"
      />
      <rect x="33" y="9" width="12" height="7" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
      <path d="M21 6 H29 V15 H21 Z" fill="#93C5FD" />
      <circle cx="13" cy="24" r="5" fill="#1E293B" />
      <circle cx="13" cy="24" r="2" fill="#94A3B8" />
      <circle cx="36" cy="24" r="5" fill="#1E293B" />
      <circle cx="36" cy="24" r="2" fill="#94A3B8" />
    </svg>
  );
}

export function ExcavatorIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true">
      <rect x="2" y="24" width="28" height="4" rx="2" fill="#1F2937" />
      <circle cx="8" cy="26" r="3" fill="#111827" />
      <circle cx="24" cy="26" r="3" fill="#111827" />
      <rect x="6" y="14" width="20" height="10" rx="2" fill="#F59E0B" />
      <circle cx="15" cy="14" r="6" fill="#FBBF24" />
      <path d="M19 12 L34 6 L38 9 L27 16 Z" fill="#D97706" />
      <path d="M34 6 L45 4 L45 11 L36 10 Z" fill="#92400E" />
    </svg>
  );
}

export function LoaderIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true">
      <rect x="10" y="13" width="20" height="9" rx="2" fill="#FBBF24" />
      <rect x="14" y="6" width="12" height="8" fill="#FDE68A" stroke="#D97706" strokeWidth="1" />
      <path d="M30 17 L40 13 L40 19 L34 21 Z" fill="#D97706" />
      <path d="M40 11 L46 15 L40 19 Z" fill="#92400E" />
      <circle cx="16" cy="25" r="6" fill="#1F2937" />
      <circle cx="16" cy="25" r="2.5" fill="#9CA3AF" />
      <circle cx="32" cy="25" r="6" fill="#1F2937" />
      <circle cx="32" cy="25" r="2.5" fill="#9CA3AF" />
    </svg>
  );
}

export function ForkliftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true">
      <rect x="9" y="14" width="16" height="9" rx="1" fill="#F97316" />
      <rect x="11" y="6" width="10" height="8" fill="#FDBA74" stroke="#C2410C" strokeWidth="1" />
      <rect x="27" y="3" width="2" height="21" fill="#4B5563" />
      <rect x="31" y="3" width="2" height="21" fill="#4B5563" />
      <rect x="29" y="19" width="15" height="2" fill="#6B7280" />
      <rect x="29" y="14" width="12" height="5" fill="#D1D5DB" />
      <circle cx="14" cy="25" r="5" fill="#1F2937" />
      <circle cx="14" cy="25" r="2" fill="#9CA3AF" />
      <circle cx="26" cy="25" r="5" fill="#1F2937" />
      <circle cx="26" cy="25" r="2" fill="#9CA3AF" />
    </svg>
  );
}

export function DumpTruckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true">
      <rect x="2" y="14" width="44" height="4" fill="#CBD5E1" />
      <path
        d="M2 14 Q2 10 6 10 H15 L19 6 H25 Q27 6 27 8 V14 Z"
        fill="#F8FAFC"
        stroke="#94A3B8"
        strokeWidth="1"
      />
      <path d="M19 8 H24 V13 H19 Z" fill="#93C5FD" />
      <path d="M27 8 L44 8 L44 15 L27 15 Z" fill="#EF4444" />
      <path d="M27 8 L31 4 L44 4 L44 8 Z" fill="#DC2626" />
      <circle cx="11" cy="24" r="5" fill="#1F2937" />
      <circle cx="11" cy="24" r="2" fill="#9CA3AF" />
      <circle cx="35" cy="24" r="5" fill="#1F2937" />
      <circle cx="35" cy="24" r="2" fill="#9CA3AF" />
    </svg>
  );
}

export function GeneratorIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true">
      <rect x="4" y="23" width="40" height="4" fill="#4B5563" />
      <rect x="6" y="10" width="36" height="13" rx="2" fill="#84A98C" />
      <rect x="10" y="14" width="4" height="5" fill="#3F5344" />
      <rect x="16" y="14" width="4" height="5" fill="#3F5344" />
      <rect x="22" y="14" width="4" height="5" fill="#3F5344" />
      <rect x="34" y="3" width="3" height="8" fill="#6B7280" />
      <circle cx="35.5" cy="3" r="2" fill="#9CA3AF" />
    </svg>
  );
}

export function ScissorLiftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true">
      <rect x="8" y="2" width="32" height="4" rx="1" fill="#FACC15" />
      <path d="M12 8 L24 20 M24 8 L12 20" stroke="#1F2937" strokeWidth="2" />
      <path d="M24 8 L36 20 M36 8 L24 20" stroke="#1F2937" strokeWidth="2" />
      <rect x="6" y="20" width="36" height="4" rx="1" fill="#4B5563" />
      <circle cx="12" cy="27" r="3" fill="#1F2937" />
      <circle cx="36" cy="27" r="3" fill="#1F2937" />
    </svg>
  );
}

export const EQUIPMENT_ICONS: Record<PmvTypeBreakdown["key"], (props: IconProps) => JSX.Element> = {
  vehicles: VehicleIcon,
  excavators: ExcavatorIcon,
  loaders: LoaderIcon,
  forklifts: ForkliftIcon,
  dumpTrucks: DumpTruckIcon,
  generators: GeneratorIcon,
  otherEquipment: ScissorLiftIcon,
};
