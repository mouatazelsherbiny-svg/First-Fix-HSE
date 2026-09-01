export const SAFETY_TIPS: string[] = [
  "Always wear your hard hat in designated areas — no exceptions, even for a quick task.",
  "Report near-misses immediately, even if no one was hurt. They're warnings, not accidents.",
  "Check your PPE before starting any task — a cracked helmet or worn harness can fail when you need it most.",
  "Never bypass a machine guard or safety interlock, even if it slows you down.",
  "Keep walkways and exits clear of tools, cables, and debris at all times.",
  "Test the air before entering any confined space — never assume it's safe to breathe.",
  "Inspect ladders and scaffolding before every use, not just at the start of the week.",
  "Tie off tools at height — a dropped object can be as dangerous as a fall.",
  "Know the location of the nearest fire extinguisher and emergency exit on your shift.",
  "Never work on energized equipment without confirming lockout/tagout is complete.",
  "Stay hydrated and take scheduled breaks — fatigue is a leading cause of site accidents.",
  "Stand clear of suspended loads — no load is worth standing under.",
  "Use three points of contact when climbing ladders or accessing equipment.",
  "Speak up if you see an unsafe act — a five-second warning can prevent a lifetime injury.",
  "Double-check your permit to work matches the actual task before you begin.",
];

export function getRandomSafetyTip(): string {
  return SAFETY_TIPS[Math.floor(Math.random() * SAFETY_TIPS.length)];
}
