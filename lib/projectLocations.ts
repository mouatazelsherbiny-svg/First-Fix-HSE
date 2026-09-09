/**
 * Map coordinates for each project in PROJECTS (lib/mockData.ts), used by
 * the Project Map page (app/project-map/page.tsx).
 *
 * IMPORTANT — PLACEHOLDER DATA: these lat/lng values are rough
 * approximations (city/region level, not the actual site) filled in so the
 * map is fully working end-to-end. Replace them with the real coordinates
 * for each project as soon as they're available — nothing else needs to
 * change, the map reads straight from this file.
 */
export interface ProjectLocation {
  project: string;
  lat: number;
  lng: number;
}

export const PROJECT_LOCATIONS: ProjectLocation[] = [
  { project: "KSP", lat: 24.7255, lng: 46.652 }, // King Salman Park, Riyadh
  { project: "CEER", lat: 22.484688, lng: 39.153438 }, // Real coordinates (Google Plus Code F5M3+V9, Industrial Valley, KAEC)
  { project: "ADF", lat: 24.7136, lng: 46.6753 }, // Riyadh
  { project: "MISK", lat: 24.7255, lng: 46.6357 }, // MISK (ILMI), Riyadh
  { project: "RCRC", lat: 24.6408, lng: 46.7728 }, // Riyadh
  { project: "KSKD", lat: 24.7477, lng: 46.575 }, // Diriyah, Riyadh
  { project: "CARGO", lat: 24.9576, lng: 46.6988 }, // King Khalid Intl. Airport, Riyadh
  { project: "SEVEN", lat: 21.3891, lng: 39.8579 }, // SEVEN, Makkah
  { project: "P05", lat: 25.5, lng: 36.9 }, // Amaala / Red Sea coast
  { project: "P06", lat: 25.52, lng: 36.92 }, // Amaala / Red Sea coast
  { project: "P09", lat: 25.48, lng: 36.88 }, // Amaala / Red Sea coast
  { project: "NURSERY", lat: 25.51, lng: 36.9 }, // Amaala / Red Sea coast
  { project: "WELLNESS", lat: 25.505, lng: 36.91 }, // Amaala / Red Sea coast
  { project: "ROSEWOOD", lat: 25.515, lng: 36.895 }, // Rosewood Amaala
  { project: "Al-Arab Hospital", lat: 21.715338, lng: 39.100141 }, // Real coordinates (Google Plus Code P482+43J, Abhur Al Junoobiyah, Jeddah)
  { project: "Al-Madinah", lat: 24.4672, lng: 39.6111 }, // Madinah
  { project: "Oceanarium", lat: 21.5, lng: 39.15 }, // Jeddah Central Development
  { project: "Al-Qiddya Hotels", lat: 24.6167, lng: 46.1667 }, // Qiddiya, Riyadh region
  { project: "Airfield", lat: 25.1, lng: 46.8 }, // Riyadh region
  { project: "Resort Core Evn Hotels", lat: 24.55, lng: 46.35 }, // Riyadh region
  { project: "Dariyah Square", lat: 24.7477, lng: 46.5754 }, // Diriyah, Riyadh
  { project: "Exhibition Centre", lat: 24.8, lng: 46.75 }, // Riyadh
  { project: "Six Sense", lat: 24.5, lng: 46.3 }, // Riyadh region
];

export function getProjectLocation(project: string): ProjectLocation | undefined {
  return PROJECT_LOCATIONS.find((p) => p.project === project);
}
