import type { Metadata, Viewport } from "next";
import MobileAppMark from "@/components/MobileAppMark";

// The phone app has its own install manifest (name, icon, opens at /m), so
// "Install" / "Add to Home Screen" from here installs the phone app, not the
// full system.
export const metadata: Metadata = {
  title: "First Fix HSE Field",
  manifest: "/mobile.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "FF Field" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
};

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MobileAppMark />
      {children}
    </>
  );
}
