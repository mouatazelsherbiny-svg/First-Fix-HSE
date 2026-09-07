import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeSettingsProvider } from "@/context/ThemeSettingsContext";
import { AuthProvider } from "@/context/AuthContext";
import { ObservationsProvider } from "@/context/ObservationsContext";
import { ToolboxTalkProvider } from "@/context/ToolboxTalkContext";
import { HsePassportProvider } from "@/context/HsePassportContext";
import { WeeklyKpiProvider } from "@/context/WeeklyKpiContext";
import { PermitProvider } from "@/context/PermitContext";
import { ChecklistSubmissionProvider } from "@/context/ChecklistSubmissionContext";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "First Fix HSE",
  description: "First Fix HSE — Health, Safety & Environment management",
  icons: {
    icon: "/logo-icon.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "First Fix HSE",
  },
};

export const viewport: Viewport = {
  themeColor: "#E8590C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className="bg-app-base font-sans antialiased">
        <PwaRegister />
        <ThemeSettingsProvider>
          <LanguageProvider>
            <AuthProvider>
              <ObservationsProvider>
                <ToolboxTalkProvider>
                  <HsePassportProvider>
                    <WeeklyKpiProvider>
                      <PermitProvider>
                        <ChecklistSubmissionProvider>{children}</ChecklistSubmissionProvider>
                      </PermitProvider>
                    </WeeklyKpiProvider>
                  </HsePassportProvider>
                </ToolboxTalkProvider>
              </ObservationsProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeSettingsProvider>
      </body>
    </html>
  );
}
