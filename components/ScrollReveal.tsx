"use client";

import { useEffect, useRef } from "react";

/**
 * Wraps the app's main content (mounted once in ProtectedRoute, so it
 * stays alive across route changes) and makes every `.card` block fade
 * up into view the first time it appears — whether that's because the
 * user just navigated to a new page (its cards are freshly inserted DOM
 * nodes) or because they scrolled a lower section into the viewport.
 *
 * Pure addition, no page changes needed: a MutationObserver watches for
 * any newly-inserted `.card` anywhere in the subtree and hands it to an
 * IntersectionObserver, which fades it in once and then lets it be.
 * Cards are never hidden by default CSS — only JS marks them, so a
 * script error or slow hydration can never leave content invisible.
 */
export default function ScrollReveal({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    );

    const observeNewCards = () => {
      container.querySelectorAll<HTMLElement>(".card:not(.reveal-item)").forEach((el) => {
        el.classList.add("reveal-item");
        io.observe(el);
      });
    };

    observeNewCards();
    const mo = new MutationObserver(observeNewCards);
    mo.observe(container, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
