import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { ObservationsProvider } from "@/context/ObservationsContext";
import { ToolboxTalkProvider } from "@/context/ToolboxTalkContext";
import { HsePassportProvider } from "@/context/HsePassportContext";
import { WeeklyKpiProvider } from "@/context/WeeklyKpiContext";
import { PermitProvider } from "@/context/PermitContext";

export const metadata: Metadata = {
  title: "First Fix HSE",
  description: "First Fix HSE — Health, Safety & Environment management",
  icons: {
    icon: "/logo-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className="bg-app-base">
      <body className="bg-app-base font-sans antialiased">
        <LanguageProvider>
          <AuthProvider>
            <ObservationsProvider>
              <ToolboxTalkProvider>
                <HsePassportProvider>
                  <WeeklyKpiProvider>
                    <PermitProvider>{children}</PermitProvider>
                  </WeeklyKpiProvider>
                </HsePassportProvider>
              </ToolboxTalkProvider>
            </ObservationsProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
