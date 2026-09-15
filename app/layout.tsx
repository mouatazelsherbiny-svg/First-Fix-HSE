import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeSettingsProvider } from "@/context/ThemeSettingsContext";
import { AuthProvider } from "@/context/AuthContext";
import { ObservationsProvider } from "@/context/ObservationsContext";
import { HsePassportProvider } from "@/context/HsePassportContext";
import { WeeklyKpiProvider } from "@/context/WeeklyKpiContext";
import { IncidentsProvider } from "@/context/IncidentsContext";
import { EditRequestsProvider } from "@/context/EditRequestsContext";
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
  themeColor: "#F36F24",
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
                <HsePassportProvider>
                  <WeeklyKpiProvider>
                    <IncidentsProvider>
                      <EditRequestsProvider>
                        <PermitProvider>
                          <ChecklistSubmissionProvider>{children}</ChecklistSubmissionProvider>
                        </PermitProvider>
                      </EditRequestsProvider>
                    </IncidentsProvider>
                  </WeeklyKpiProvider>
                </HsePassportProvider>
              </ObservationsProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeSettingsProvider>
      </body>
    </html>
  );
}
