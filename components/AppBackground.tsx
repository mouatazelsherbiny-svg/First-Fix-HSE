/** App-wide background layer — the "First Fix" brand image, blurred and
 *  dimmed, sitting behind every protected page (mounted once in
 *  ProtectedRoute). Paired with the translucent, backdrop-blurred surfaces
 *  (see .card / .input-field / .btn-secondary in globals.css and the
 *  Sidebar/Topbar panels) for the glassmorphism look: content genuinely
 *  floats over the image rather than just sitting on a flat dark canvas.
 *  Fixed positioning keeps it stationary while the page scrolls. */
export default function AppBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl"
        style={{ backgroundImage: "url(/brand/first-fix-bg.jpg)" }}
      />
      {/* Dark scrim so text and glass surfaces stay readable regardless of
          what's underneath — tuned to the app's own canvas color/darkness. */}
      <div className="absolute inset-0 bg-[#1F2226]/82" />
    </div>
  );
}
