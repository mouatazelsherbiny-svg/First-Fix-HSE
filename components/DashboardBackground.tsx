"use client";

// Decorative, low-opacity animated background used ONLY on the Dashboard
// page — a subtle nod to the "network/particle" motif from the reference
// design, toned way down: a couple of slow-drifting color washes plus a
// faint pulsing node-and-line graph. Pure CSS (transform/opacity only, no
// JS animation loop) so it stays cheap to render, sits behind all real
// content (cards are opaque), and respects prefers-reduced-motion.
const NODES = [
  { x: 6, y: 14 },
  { x: 22, y: 32 },
  { x: 40, y: 10 },
  { x: 58, y: 24 },
  { x: 76, y: 12 },
  { x: 92, y: 36 },
  { x: 14, y: 60 },
  { x: 34, y: 72 },
  { x: 54, y: 56 },
  { x: 72, y: 70 },
  { x: 90, y: 82 },
  { x: 48, y: 90 },
];

const LINES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [1, 6],
  [6, 7],
  [7, 8],
  [8, 9],
  [9, 10],
  [8, 11],
  [3, 8],
];

export default function DashboardBackground() {
  return (
    <div
      aria-hidden
      className="dashboard-bg pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black,black_65%,transparent)]"
    >
      <div className="dashboard-bg-blob-a absolute -top-32 -start-32 h-[36rem] w-[36rem] rounded-full bg-brand-orange/10 blur-3xl" />
      <div className="dashboard-bg-blob-b absolute top-1/3 -end-40 h-[30rem] w-[30rem] rounded-full bg-brand-gold/10 blur-3xl" />

      <svg
        className="absolute inset-0 h-full w-full opacity-[0.18]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {LINES.map(([a, b], i) => {
          const n1 = NODES[a];
          const n2 = NODES[b];
          return (
            <line
              key={i}
              x1={n1.x}
              y1={n1.y}
              x2={n2.x}
              y2={n2.y}
              stroke="#E8590C"
              strokeWidth="0.15"
              className="dashboard-bg-pulse"
              style={{ animationDelay: `${(i % 6) * 0.6}s` }}
            />
          );
        })}
        {NODES.map((n, i) => (
          <circle
            key={i}
            cx={n.x}
            cy={n.y}
            r="0.55"
            fill={i % 4 === 0 ? "#D4AF37" : "#E8590C"}
            className="dashboard-bg-pulse"
            style={{ animationDelay: `${(i % 5) * 0.7}s` }}
          />
        ))}
      </svg>

      <style>{`
        @keyframes dashboard-drift-a {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(4%, 3%); }
        }
        @keyframes dashboard-drift-b {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-3%, 4%); }
        }
        @keyframes dashboard-node-pulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 1; }
        }
        .dashboard-bg-blob-a { animation: dashboard-drift-a 26s ease-in-out infinite; }
        .dashboard-bg-blob-b { animation: dashboard-drift-b 32s ease-in-out infinite; }
        .dashboard-bg-pulse { animation: dashboard-node-pulse 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .dashboard-bg-blob-a,
          .dashboard-bg-blob-b,
          .dashboard-bg-pulse {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
