"use client";

import { ReactNode, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface LandingHeroProps {
  /** Sign-in / sign-up form, rendered in the lower-right corner of the
      hero image — used by /login and /signup. Omitted on the plain
      landing page ("/"). */
  children?: ReactNode;
  /** "home" = the banner artwork (public/home-hero.jpg, 16:9, with the
      logo, title and slogans printed on it), used by "/" and /login.
      /signup keeps the default photo. */
  variant?: "default" | "home";
}

export default function LandingHero({ children, variant = "default" }: LandingHeroProps) {
  const { t } = useLanguage();
  const isHome = variant === "home";
  // Extra height requested by BannerCard on screens too small for the card.
  const [cardMinHeight, setCardMinHeight] = useState<number | undefined>();

  return (
    <div
      className={`relative isolate flex w-full flex-col ${
        // The home banner's text runs nearly edge to edge vertically, so on
        // viewports wider than 16:9 grow to the image's own height (instead of
        // cropping its top/bottom); never shorter than the screen, as before.
        isHome ? "min-h-[max(100vh,56.25vw)]" : "min-h-screen"
      }`}
      style={cardMinHeight ? { minHeight: cardMinHeight } : undefined}
    >
      {/* Fills the whole screen: a plain (non-fixed) absolutely
          positioned cover-fit image behind everything. The nav and card
          are real HTML laid on top of it, so cropping this photo never
          breaks anything. This particular photo is dark, so the nav bar
          and card below are styled light/translucent to stay legible
          over it. */}
      {isHome ? (
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

      {children && isHome && <BannerCard onMinHeight={setCardMinHeight}>{children}</BannerCard>}

      {/* See-through card, pinned to the lower-right corner (under the
          right-hand vest in this photo), sized to stay clear of the top
          nav bar and comfortably fit without needing to scroll. */}
      {children && !isHome && (
        <div className="absolute bottom-5 right-4 w-[calc(100%-2rem)] max-w-sm sm:bottom-10 sm:right-10 sm:w-full">
          {children}
        </div>
      )}
    </div>
  );
}

// Layout of public/home-hero.jpg, in the image's own pixels (1600x900):
// where its printed text is, so the sign-in card can stay clear of it.
const BANNER_W = 1600;
const BANNER_H = 900;
const TITLE_LEFT = 505; // "HSE DEPARTMENT" spans x 505–1200 …
const TITLE_RIGHT = 1200;
const TITLE_BOTTOM = 300; // … and ends at y≈297
const SLOGANS_TOP = 705; // slogan frame starts at y≈700
const RIGHT_GROUP_X = 1215; // centre of the right-hand group of workers
const CARD_MAX_W = 384;
const CARD_MIN_W = 300;
const EDGE = 16;
const GAP = 12;
const MIN_SCALE = 0.8; // below this the hero grows taller instead of shrinking the card further

type Rect = { left: number; top: number; width: number; height: number };

/**
 * Places the sign-in card where it covers none of the banner's logo, title or
 * slogans: the column left or right of the title, or the band between title
 * and slogans — whichever fits the card best at the current screen size.
 * Positions follow the image's cover-fit scaling. If even the best spot is
 * too small the card is scaled down (purely visual — the form is untouched),
 * and below MIN_SCALE the hero is made taller so the card stays readable.
 */
function BannerCard({ children, onMinHeight }: { children: ReactNode; onMinHeight: (px: number | undefined) => void }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<(Rect & { scale: number }) | null>(null);

  useLayoutEffect(() => {
    const hero = boxRef.current?.parentElement;
    const card = cardRef.current;
    if (!hero || !card) return;
    const nav = hero.querySelector("nav")?.parentElement;

    const place = (w: number, h: number, cardH: number) => {
      // object-cover + object-center, same as the <Image> above.
      const s = Math.max(w / BANNER_W, h / BANNER_H);
      const offX = (w - BANNER_W * s) / 2;
      const offY = (h - BANNER_H * s) / 2;
      const X = (x: number) => offX + x * s;
      const Y = (y: number) => offY + y * s;
      // Below the nav bar and the fixed language toggle (top-right, ~60px).
      const top = Math.max((nav?.offsetHeight ?? 44) + GAP, 64);
      const bottom = Y(SLOGANS_TOP) - GAP;

      const spots: Rect[] = [
        // Left of the title, over the meeting-table group.
        { left: EDGE, top, width: X(TITLE_LEFT) - GAP - EDGE, height: bottom - top },
        // Right of the title.
        { left: X(TITLE_RIGHT) + GAP, top, width: w - EDGE - (X(TITLE_RIGHT) + GAP), height: bottom - top },
        // Band between the title and the slogans, over the right-hand group
        // (centred on narrow screens).
        (() => {
          const bandTop = Math.max(top, Y(TITLE_BOTTOM) + GAP);
          const width = Math.min(CARD_MAX_W, w - 2 * EDGE);
          const left = w < 640 ? (w - width) / 2 : Math.min(Math.max(EDGE, X(RIGHT_GROUP_X) - width / 2), w - width - EDGE);
          return { left, top: bandTop, width, height: bottom - bandTop };
        })(),
      ];

      let best: (Rect & { scale: number }) | null = null;
      for (const spot of spots) {
        if (spot.width <= 0 || spot.height <= 0) continue;
        const width = Math.min(CARD_MAX_W, Math.max(CARD_MIN_W, spot.width));
        const scale = Math.min(1, spot.width / width, spot.height / cardH);
        if (!best || scale > best.scale + 0.01) best = { ...spot, width, scale };
      }
      return best;
    };

    const update = () => {
      const w = hero.clientWidth;
      // The hero's own minimum height (CSS: max(100vh, 56.25vw)), ignoring any
      // extra height this component asked for earlier.
      const baseH = Math.max(window.innerHeight, w * 0.5625);
      const cardH = card.offsetHeight;
      let h = baseH;
      let best = place(w, h, cardH);
      // Too cramped: grow the hero (and with it the cover-fit image) until the
      // card fits at MIN_SCALE.
      for (let i = 0; i < 40 && best && best.scale < MIN_SCALE; i++) {
        h += 20;
        best = place(w, h, cardH);
      }
      onMinHeight(h > baseH ? Math.ceil(h) : undefined);
      if (best) {
        // Centre the (possibly narrower) card inside the chosen spot.
        setLayout(best);
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(card); // card height changes (login / forgot-password / errors)
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [onMinHeight]);

  return (
    <div
      ref={boxRef}
      className="absolute flex items-center justify-center"
      style={
        layout
          ? { left: layout.left, top: layout.top, width: Math.max(layout.width, 0), height: layout.height }
          : { left: 0, top: 0, width: CARD_MAX_W, visibility: "hidden" }
      }
    >
      <div
        ref={cardRef}
        className="shrink-0"
        style={{
          width: layout ? Math.min(CARD_MAX_W, Math.max(CARD_MIN_W, layout.width)) : CARD_MAX_W,
          transform: layout && layout.scale < 1 ? `scale(${layout.scale})` : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
