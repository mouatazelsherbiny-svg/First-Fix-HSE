/** App-wide background layer — the "First Fix" brand image sitting behind
 *  every protected page (mounted once in ProtectedRoute), paired with the
 *  translucent, backdrop-blurred cards/sidebar/topbar (see .card in
 *  globals.css) for the glassmorphism look: the photo itself stays crisp
 *  and vivid, and the "frosted glass" comes from the panels blurring it
 *  as it shows through them — not from pre-blurring the photo itself.
 *  Fixed positioning keeps it stationary while the page scrolls.
 *
 *  History note: earlier versions pre-blurred this image AND sat it under
 *  a near-opaque dark scrim (up to 82% — in the exact same hex as the
 *  page's own flat canvas color), which made it essentially invisible.
 *  Keep the scrim light; the image should read clearly. */
export default function AppBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center"
        style={{ backgroundImage: "url(/brand/first-fix-bg.jpg)" }}
      />
      {/* Light scrim — just enough to keep white text/icons legible;
          the photo underneath should stay clearly visible. */}
      <div className="absolute inset-0 bg-[#14161A]/40" />
    </div>
  );
}
