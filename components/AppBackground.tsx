/** App-wide background layer — the "First Fix" brand image, blurred and
 *  dimmed, sitting behind every protected page (mounted once in
 *  ProtectedRoute). Paired with the translucent, backdrop-blurred surfaces
 *  (see .card / .input-field / .btn-secondary in globals.css and the
 *  Sidebar/Topbar panels) for the glassmorphism look: content genuinely
 *  floats over the image rather than just sitting on a flat dark canvas.
 *  Fixed positioning keeps it stationary while the page scrolls.
 *
 *  NOTE: the scrim below is intentionally a MODERATE (not heavy) overlay.
 *  An earlier version used ~82% opacity in the exact same hex as the page's
 *  own flat canvas color (--background-app) — which made the photo behind
 *  it essentially invisible (a near-opaque layer of the same color as the
 *  "no background" state). Keep this well under ~55% so the image actually
 *  reads once blurred. */
export default function AppBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center blur-xl"
        style={{ backgroundImage: "url(/brand/first-fix-bg.jpg)" }}
      />
      {/* Dark scrim so text and glass surfaces stay readable — kept light
          enough that the image is clearly visible behind the blur. */}
      <div className="absolute inset-0 bg-[#1F2226]/45" />
    </div>
  );
}
