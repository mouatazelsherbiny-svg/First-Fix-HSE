import type { Metadata, Viewport } from "next";
import MobileAppMark from "@/components/MobileAppMark";

// The phone app has its own install manifest (name, icon, opens at /m), so
// "Install" / "Add to Home Screen" from here installs the phone app, not the
// full system.
export const metadata: Metadata = {
  title: "HSE-Reporting",
  manifest: "/mobile.webmanifest",
  icons: { icon: "/icons/hse-reporting-192.png?v=2", apple: "/icons/hse-reporting-180.png?v=2" },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "HSE-Reporting" },
};

// Fills the whole screen of any phone / tablet (notch and home bar included —
// the layout keeps clear of them with safe-area padding), in either rotation.
export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MobileAppMark />
      {children}
    </>
  );
}
