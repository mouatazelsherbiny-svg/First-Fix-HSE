"use client";

/**
 * The phone app's link: https://<site>/m
 * - Opened in a browser: a small page to install the app (Android: Install
 *   button; iPhone: "Share → Add to Home Screen"), or open it right away.
 * - Opened from the installed app: goes straight to Daily Report.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { ArrowRight, ClipboardList, Download, Share, ShieldCheck, SquarePlus } from "lucide-react";
import { BrandMark } from "@/components/Sidebar";
import { markMobileApp, MOBILE_HOME } from "@/lib/mobileApp";
import { isStandalone, useInstall } from "@/lib/useInstall";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

export default function MobileHome() {
  const router = useRouter();
  const install = useInstall();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    markMobileApp();
    if (isStandalone()) router.replace(MOBILE_HOME);
    else setReady(true);
  }, [router]);

  if (!ready) return <div className="min-h-screen bg-[#0a0a0c]" />;

  return (
    <div
      className={`${montserrat.className} flex min-h-screen flex-col items-center justify-center px-6 py-10 text-center text-white`}
      style={{
        background:
          "radial-gradient(700px 420px at 50% -10%, rgba(243,111,36,0.22), transparent 65%), radial-gradient(600px 400px at 110% 110%, rgba(243,111,36,0.10), transparent 60%), #0a0a0c",
      }}
    >
      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_0_40px_rgba(243,111,36,0.35)]">
        <BrandMark size={72} />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold">First Fix HSE</h1>
      <p className="mt-1 text-sm font-bold uppercase tracking-[0.22em] text-[#ff8a3d]">Field App</p>
      <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
        Daily reports and permits to work, from your phone. Sign in with your First Fix HSE account.
      </p>

      <div className="mt-6 grid w-full max-w-xs grid-cols-2 gap-3 text-sm font-semibold">
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-4">
          <ClipboardList className="h-6 w-6 text-[#ff8a3d]" />
          Daily Report
        </div>
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-4">
          <ShieldCheck className="h-6 w-6 text-[#ff8a3d]" />
          Permit to Work
        </div>
      </div>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        {install.canShow && (
          <button
            type="button"
            onClick={install.run}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f36f24] px-5 py-3.5 text-base font-bold text-white shadow-[0_0_20px_rgba(243,111,36,0.55)]"
          >
            <Download className="h-5 w-5" />
            Install the app
          </button>
        )}
        {install.ios && (
          <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-4 text-start text-sm">
            <p className="font-bold">Install on iPhone</p>
            <ol className="mt-2 space-y-1.5 text-white/80">
              <li>
                1. Tap <Share className="inline h-4 w-4 align-text-bottom text-[#60a5fa]" /> <b>Share</b> (in Safari)
              </li>
              <li>
                2. Choose <SquarePlus className="inline h-4 w-4 align-text-bottom" /> <b>Add to Home Screen</b>
              </li>
              <li>3. Open “FF Field” from your home screen</li>
            </ol>
          </div>
        )}
        {!install.canShow && !install.ios && (
          <p className="text-xs text-white/50">
            To install: open your browser menu (⋮) and choose <b>Install app</b> or <b>Add to Home screen</b>.
          </p>
        )}
        <Link
          href={MOBILE_HOME}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/90"
        >
          Open without installing
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
