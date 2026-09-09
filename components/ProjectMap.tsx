"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PROJECT_LOCATIONS } from "@/lib/projectLocations";
import { usePermits } from "@/context/PermitContext";
import { useLanguage } from "@/context/LanguageContext";

// Custom pin instead of Leaflet's default marker image (which needs extra
// asset wiring to work with Next.js bundling). Uses the app's own brand
// accent CSS variables, so it follows whatever color theme the user picked
// in Appearance settings.
function pinIcon(count: number) {
  const html = `
    <div style="
      display:flex; align-items:center; justify-content:center;
      width:34px; height:34px; border-radius:9999px;
      background: rgb(var(--brand-orange-rgb));
      color: rgb(var(--brand-on-accent-rgb));
      font-weight:700; font-size:12px;
      border:2px solid white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
    ">${count}</div>
  `;
  return L.divIcon({
    html,
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
}

export default function ProjectMap() {
  const { permits } = usePermits();
  const { t, locale } = useLanguage();

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    permits.forEach((p) => {
      map.set(p.projectName, (map.get(p.projectName) ?? 0) + 1);
    });
    return map;
  }, [permits]);

  return (
    <MapContainer
      center={[24, 45]}
      zoom={5}
      scrollWheelZoom
      className="h-full w-full rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {PROJECT_LOCATIONS.map((loc) => {
        const count = counts.get(loc.project) ?? 0;
        return (
          <Marker key={loc.project} position={[loc.lat, loc.lng]} icon={pinIcon(count)}>
            <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
              <span className="font-semibold">{loc.project}</span>
              {" — "}
              {count} {t.projectMap.permitsWord}
            </Tooltip>
            <Popup>
              <div style={{ textAlign: locale === "ar" ? "right" : "left", minWidth: 140 }}>
                <p style={{ fontWeight: 700, margin: 0 }}>{loc.project}</p>
                <p style={{ margin: "4px 0 0" }}>
                  {t.projectMap.permitCountLabel}: <strong>{count}</strong>
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
