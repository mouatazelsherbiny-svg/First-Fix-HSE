"use client";

import { ReactNode, RefObject, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface LandingHeroProps {
  /** Sign-in / sign-up form, rendered in the lower-right corner of the
      hero image — used by /login and /signup. Omitted on the plain
      landing page ("/"). */
  children?: ReactNode;
  /** "home" = the banner artwork (public/home-hero.jpg, 16:9, with the
      logo, title and slogans printed on it) on "/"; "login" = the same
      banner with the sign-in card centred in its empty middle area.
      /signup keeps the default photo. */
  variant?: "default" | "home" | "login";
}

// Operation Grouping button on /login (opens /qiddiya-workforce): hidden for now.
// Set to true to show it again; the page itself stays published.
const SHOW_OPERATION_GROUPING = true;

export default function LandingHero({ children, variant = "default" }: LandingHeroProps) {
  const { t } = useLanguage();
  const isBanner = variant === "home" || variant === "login";
  const heroRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const isLogin = variant === "login";
  const banner = useBannerLayout(heroRef, navRef, isLogin);

  return (
    <div
      ref={heroRef}
      style={isLogin && banner ? { minHeight: banner.total } : undefined}
      className={`relative isolate flex w-full flex-col overflow-hidden ${
        // The home banner's text runs nearly edge to edge vertically, so on
        // viewports wider than 16:9 grow to the image's own height (instead of
        // cropping its top/bottom); never shorter than the screen, as before.
        // /login computes its own height (see useBannerLayout).
        variant === "home" ? "min-h-[max(100vh,56.25vw)]" : "min-h-screen"
      }`}
    >
      {/* Fills the whole screen: a plain (non-fixed) absolutely
          positioned cover-fit image behind everything. The nav and card
          are real HTML laid on top of it, so cropping this photo never
          breaks anything. This particular photo is dark, so the nav bar
          and card below are styled light/translucent to stay legible
          over it. */}
      {isLogin ? (
        // /login shows the whole banner, never cropped: fitted inside the
        // screen below the nav bar, with a blurred copy of it filling any
        // leftover space around it.
        <>
          <div className="absolute inset-0 -z-20 bg-black" />
          <Image
            src="/home-hero-4k.jpg"
            alt=""
            aria-hidden
            fill
            unoptimized
            sizes="100vw"
            className="-z-20 scale-110 object-cover opacity-40 blur-2xl"
          />
          {banner && (
            <div
              className="absolute -z-10"
              style={{ left: banner.offX, top: banner.offY, width: BANNER_W * banner.sx, height: BANNER_H * banner.sy }}
            >
              <Image
                src="/home-hero-4k.jpg"
                alt={t.landing.heroTagline}
                fill
                priority
                unoptimized
                quality={100}
                placeholder="empty"
                sizes="100vw"
                className="object-fill"
              />
            </div>
          )}
        </>
      ) : isBanner ? (
        // Served byte-for-byte (unoptimized) so it is never re-compressed;
        // quality/sizes only matter if the optimizer is ever re-enabled.
        <Image
          src="/home-hero-4k.jpg"
          alt={t.landing.heroTagline}
          fill
          priority
          unoptimized
          quality={100}
          placeholder="empty"
          sizes="100vw"
          className="-z-10 object-cover object-center"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/brand/landing-hero-v3.jpg"
          alt={t.landing.heroTagline}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      )}

      {/* Real, visible nav row, on its own translucent bar rather than
          floating directly on the busy photo — keeps it readable no
          matter what part of the artwork sits behind it. About HSE
          Department has real content now (app/about/page.tsx); the old
          "Contact" placeholder (t.landing.navContact) was repurposed into
          a second link to that same page, labeled "About", rather than
          building a separate Contact page — Home/HSE KPI's are still
          placeholders for pages that aren't built yet, so they carry no
          command. */}
      <div ref={navRef} className="bg-black/35 backdrop-blur-sm">
        <nav
          aria-label="Primary"
          className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 px-3 py-3 text-center text-sm font-medium text-white/90"
        >
          <span>{t.landing.navHome}</span>
          <span className="text-white/40">–</span>
          <Link href="/about" className="hover:text-brand-orange">
            {t.landing.navAbout}
          </Link>
          <span className="text-white/40">–</span>
          <span>{t.landing.navKpis}</span>
          <span className="text-white/40">–</span>
          <Link href="/about" className="hover:text-brand-orange">
            {t.landing.navContact}
          </Link>
          {/* Temporary: public Generators Report and Qiddiya Workforce map, opened from /login (remove when no longer needed). */}
          {isLogin && (
            <>
              <span className="text-white/40">–</span>
              <a
                href="/generators-report"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-3 py-0.5 font-semibold text-white transition hover:brightness-110"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 20V14M10 20V9M16 20V12M22 20V4" />
                </svg>
                Generators Report
              </a>
              {SHOW_OPERATION_GROUPING && (
                <>
                <span className="text-white/40">–</span>
                <a
                  href="/qiddiya-workforce"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-3 py-0.5 font-semibold text-white transition hover:brightness-110"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
                    <circle cx="12" cy="9.5" r="2.5" />
                  </svg>
                  Operation Grouping
                </a>
                </>
              )}
            </>
          )}
          {/* /login has these inside its card already. */}
          {!isLogin && (
            <>
              <span className="text-white/40">–</span>
              <Link href="/login" className="font-semibold text-white hover:text-brand-orange">
                {t.landing.ctaLogin}
              </Link>
              <span className="text-white/40">–</span>
              <Link href="/signup" className="font-semibold text-white hover:text-brand-orange">
                {t.landing.ctaSignup}
              </Link>
            </>
          )}
        </nav>
      </div>

      {children && variant === "login" && <CenteredCard layout={banner}>{children}</CenteredCard>}

      {/* See-through card, pinned to the lower-right corner (under the
          right-hand vest in this photo), sized to stay clear of the top
          nav bar and comfortably fit without needing to scroll. */}
      {children && variant === "default" && (
        <div className="absolute bottom-5 right-4 w-[calc(100%-2rem)] max-w-sm sm:bottom-10 sm:right-10 sm:w-full">
          {children}
        </div>
      )}
    </div>
  );
}

// Layout of the banner (public/home-hero-4k.jpg, 3840x2160), in units of the original 1600x900 artwork.
const BANNER_W = 1600;
const BANNER_H = 900;
// Empty middle area: below the "HSE DEPARTMENT" title, above the slogan
// frame, between the meeting-table group (left) and the circle of workers
// (right).
const GAP_LEFT = 615;
const GAP_RIGHT = 1035;
const GAP_TOP = 300;
const GAP_BOTTOM = 698;
const CARD_MAX_W = 380;
const MARGIN = 8; // between the card and the artwork around the gap
const MOBILE_EDGE = 16;
const MOBILE_TOP = 96; // below the (wrapped) nav bar and language toggle

interface BannerLayout {
  /** Scale of the banner and its top-left corner inside the hero, in px. */
  s: number;
  offX: number;
  offY: number;
  width: number;
  height: number;
  /** Horizontal and vertical scale (they differ when the banner is stretched to fit). */
  sx: number;
  sy: number;
  /** Height the hero needs so the whole banner shows (>= the screen). */
  total: number;
}

/**
 * Geometry for the banner on /login. Desktop: the whole image, fitted
 * (contain) into the screen below the nav bar and centred, so nothing is ever
 * cropped. Mobile (< 640px): too narrow for that, so it covers the screen
 * below the nav bar with the empty middle area centred, as before.
 * Returns null until measured, and for other variants.
 */
function useBannerLayout(
  heroRef: RefObject<HTMLDivElement>,
  navRef: RefObject<HTMLDivElement>,
  enabled: boolean
): BannerLayout | null {
  const [layout, setLayout] = useState<BannerLayout | null>(null);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!enabled || !hero) return;

    const update = () => {
      const w = hero.clientWidth;
      const h = window.innerHeight;
      const top = navRef.current?.offsetHeight ?? 0;
      const avail = h - top;
      let s: number, offX: number, offY: number;
      let sx: number, sy: number;
      if (w >= 640) {
        // Exactly the screen below the nav bar: the whole banner, nothing
        // cropped and no scrolling. Width and height are scaled separately,
        // so on screens that aren't 16:9 it is stretched slightly to fit.
        sx = w / BANNER_W;
        sy = avail / BANNER_H;
        s = Math.min(sx, sy);
        offX = 0;
        offY = top;
      } else {
        s = Math.max(w / BANNER_W, avail / BANNER_H);
        const gapCentre = (GAP_LEFT + GAP_RIGHT) / 2;
        offX = Math.min(0, Math.max(w - BANNER_W * s, w / 2 - gapCentre * s));
        offY = top + (avail - BANNER_H * s) / 2;
        sx = s;
        sy = s;
      }
      setLayout({ s, sx, sy, offX, offY, width: w, height: h, total: h });
    };

    update();
    const ro = new ResizeObserver(update);
    if (navRef.current) ro.observe(navRef.current);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [heroRef, navRef, enabled]);

  return enabled ? layout : null;
}

/**
 * The sign-in card, centred in the banner's empty middle area (desktop) or
 * centred full-width with side margins (mobile). If the gap is ever shorter
 * than the card it is scaled down to fit — purely visual, the form inside is
 * untouched.
 */
function CenteredCard({ layout, children }: { layout: BannerLayout | null; children: ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = useState(0);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const ro = new ResizeObserver(() => setCardH(card.offsetHeight));
    ro.observe(card); // login / forgot-password / error message change its height
    setCardH(card.offsetHeight);
    return () => ro.disconnect();
  }, []);

  let box: { left: number; top: number; width: number; height: number; scale: number } | null = null;
  if (layout) {
    const { sx, sy, offX, offY, width: w, height: h } = layout;
    const X = (x: number) => offX + x * sx;
    const Y = (y: number) => offY + y * sy;
    if (w < 640) {
      // Mobile: centred, full width with side margins, vertically centred
      // below the nav bar; covering parts of the artwork is fine here.
      box = { left: MOBILE_EDGE, top: MOBILE_TOP, width: w - 2 * MOBILE_EDGE, height: h - MOBILE_TOP - MOBILE_EDGE, scale: 1 };
    } else {
      const width = Math.min(CARD_MAX_W, X(GAP_RIGHT) - X(GAP_LEFT) - 2 * MARGIN);
      // Centred on screen, nudged only as far as needed to stay inside the gap.
      const left = Math.min(Math.max(w / 2 - width / 2, X(GAP_LEFT) + MARGIN), X(GAP_RIGHT) - MARGIN - width);
      const top = Y(GAP_TOP) + MARGIN;
      const height = Y(GAP_BOTTOM) - MARGIN - top;
      box = { left, top, width, height, scale: cardH ? Math.min(1, height / cardH) : 1 };
    }
  }

  return (
    <div
      className="absolute flex items-center justify-center"
      style={box ? { left: box.left, top: box.top, width: box.width, height: box.height } : { visibility: "hidden" }}
    >
      <div
        ref={cardRef}
        className="w-full shrink-0"
        style={{ transform: box && box.scale < 1 ? `scale(${box.scale})` : undefined }}
      >
        {children}
      </div>
    </div>
  );
}
