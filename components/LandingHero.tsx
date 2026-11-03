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

export default function LandingHero({ children, variant = "default" }: LandingHeroProps) {
  const { t } = useLanguage();
  const isBanner = variant === "home" || variant === "login";
  const heroRef = useRef<HTMLDivElement>(null);
  const banner = useBannerLayout(heroRef, variant === "login");

  return (
    <div
      ref={heroRef}
      className={`relative isolate flex w-full flex-col ${
        // The home banner's text runs nearly edge to edge vertically, so on
        // viewports wider than 16:9 grow to the image's own height (instead of
        // cropping its top/bottom); never shorter than the screen, as before.
        // /login computes its own height (see useBannerLayout).
        variant === "home" ? "min-h-[max(100vh,56.25vw)]" : "min-h-screen"
      }`}
      style={banner?.minHeight ? { minHeight: banner.minHeight } : undefined}
    >
      {/* Fills the whole screen: a plain (non-fixed) absolutely
          positioned cover-fit image behind everything. The nav and card
          are real HTML laid on top of it, so cropping this photo never
          breaks anything. This particular photo is dark, so the nav bar
          and card below are styled light/translucent to stay legible
          over it. */}
      {isBanner ? (
        // Served byte-for-byte (unoptimized) so it is never re-compressed;
        // quality/sizes only matter if the optimizer is ever re-enabled.
        <Image
          src="/home-hero.jpg"
          alt={t.landing.heroTagline}
          fill
          priority
          unoptimized
          quality={100}
          placeholder="empty"
          sizes="100vw"
          className="-z-10 object-cover object-center"
          style={banner ? { objectPosition: banner.objectPosition } : undefined}
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
      <div className="bg-black/35 backdrop-blur-sm">
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
          <span className="text-white/40">–</span>
          <Link href="/login" className="font-semibold text-white hover:text-brand-orange">
            {t.landing.ctaLogin}
          </Link>
          <span className="text-white/40">–</span>
          <Link href="/signup" className="font-semibold text-white hover:text-brand-orange">
            {t.landing.ctaSignup}
          </Link>
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

// Layout of public/home-hero.jpg, in the image's own pixels (1600x900).
const BANNER_W = 1600;
const BANNER_H = 900;
// Empty middle area: below the "HSE DEPARTMENT" title, above the slogan
// frame, between the meeting-table group (left) and the circle of workers
// (right).
const GAP_LEFT = 615;
const GAP_RIGHT = 1035;
const GAP_TOP = 300;
const GAP_BOTTOM = 698;
// On screens wider than 16:9 the image is cropped vertically: first the strip
// above the logo (behind the nav bar anyway), then from the bottom — below the
// tagline, then the tagline itself — but never into the slogans (which end,
// frame line included, at y≈838). Past that the hero grows taller instead.
const SAFE_TOP = 30;
const SAFE_BOTTOM = 838;

const CARD_MAX_W = 380;
const MARGIN = 8; // between the card and the artwork around the gap
const MOBILE_EDGE = 16;
const MOBILE_TOP = 96; // below the (wrapped) nav bar and language toggle

interface BannerLayout {
  /** Cover-fit scale and the image's offset inside the hero, in px. */
  s: number;
  offX: number;
  offY: number;
  width: number;
  height: number;
  objectPosition: string;
  minHeight?: number;
}

/**
 * Cover-fit geometry for the banner on /login: positioned so its empty middle
 * area sits at the centre of the screen (screens narrower than 16:9 crop the
 * sides) and so the title and slogans stay on screen (wider than 16:9 crop
 * top/bottom). Returns null until measured, and for other variants.
 */
function useBannerLayout(heroRef: RefObject<HTMLDivElement>, enabled: boolean): BannerLayout | null {
  const [layout, setLayout] = useState<BannerLayout | null>(null);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!enabled || !hero) return;

    const update = () => {
      const w = hero.clientWidth;
      // At least the screen, and tall enough to show SAFE_TOP..SAFE_BOTTOM
      // when the image is scaled to the full width.
      // (A few px of tolerance: cropping a sliver of the frame line beats a 1px scroll.)
      const needed = ((SAFE_BOTTOM - SAFE_TOP) * w) / BANNER_W;
      const h = needed > window.innerHeight + 3 ? Math.ceil(needed) : window.innerHeight;
      const s = Math.max(w / BANNER_W, h / BANNER_H);

      // Horizontal: put the gap's centre at the screen centre when the sides are cropped.
      const spareX = w - BANNER_W * s; // <= 0
      const gapCentre = (GAP_LEFT + GAP_RIGHT) / 2;
      const offX = spareX < -0.5 ? Math.min(0, Math.max(spareX, w / 2 - gapCentre * s)) : spareX / 2;
      // Vertical: crop the top strip first, the rest from the bottom.
      const spareY = h - BANNER_H * s; // <= 0
      const offY = spareY < -0.5 ? -Math.min(-spareY / s, SAFE_TOP) * s : spareY / 2;

      const px = spareX < -0.5 ? (offX / spareX) * 100 : 50;
      const py = spareY < -0.5 ? (offY / spareY) * 100 : 50;
      setLayout({
        s,
        offX,
        offY,
        width: w,
        height: h,
        objectPosition: `${px.toFixed(3)}% ${py.toFixed(3)}%`,
        minHeight: h > window.innerHeight ? h : undefined,
      });
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [heroRef, enabled]);

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
    const { s, offX, offY, width: w, height: h } = layout;
    const X = (x: number) => offX + x * s;
    const Y = (y: number) => offY + y * s;
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
