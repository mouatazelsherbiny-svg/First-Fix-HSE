"use client";

import { motion } from "framer-motion";

/**
 * Simple line-art construction-site illustration with a few subtle,
 * continuous motions (crane jib sway, drifting clouds, pulsing beacon,
 * idle worker bob) — decorative only, kept slow/low-amplitude so it reads
 * as "alive" without being distracting.
 */
export default function ConstructionIllustration() {
  return (
    <svg
      viewBox="0 0 240 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-full"
      role="img"
      aria-label="Construction site illustration"
    >
      {/* Clouds */}
      <motion.g
        stroke="#6B6E70"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
        animate={{ x: [0, 10, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M30 45h18a9 9 0 100-14 12 12 0 00-23 3 8 8 0 005 11z" />
      </motion.g>
      <motion.g
        stroke="#6B6E70"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
        animate={{ x: [0, -8, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M150 30h14a7 7 0 100-11 9.5 9.5 0 00-18 2 6 6 0 004 9z" />
      </motion.g>

      {/* Ground */}
      <line x1="10" y1="270" x2="230" y2="270" stroke="#3A3B3C" strokeWidth="2" strokeLinecap="round" />

      {/* Building under construction */}
      <g stroke="#6B6E70" strokeWidth="1.75" strokeLinecap="round">
        <rect x="35" y="120" width="90" height="150" />
        <line x1="35" y1="150" x2="125" y2="150" />
        <line x1="35" y1="180" x2="125" y2="180" />
        <line x1="35" y1="210" x2="125" y2="210" />
        <line x1="35" y1="240" x2="125" y2="240" />
        <line x1="35" y1="120" x2="125" y2="150" opacity="0.5" />
        <line x1="125" y1="120" x2="35" y2="150" opacity="0.5" />
        <line x1="35" y1="180" x2="80" y2="210" opacity="0.5" />
        <line x1="80" y1="180" x2="35" y2="210" opacity="0.5" />
      </g>

      {/* Crane */}
      <line x1="178" y1="270" x2="178" y2="55" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="168" y1="270" x2="188" y2="270" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />

      <motion.g
        style={{ transformOrigin: "178px 55px" }}
        animate={{ rotate: [-3, 3, -3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <line x1="138" y1="55" x2="230" y2="55" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="178" y1="55" x2="178" y2="42" stroke="#1A1A1A" strokeWidth="2" />
        <line x1="150" y1="55" x2="178" y2="42" stroke="#1A1A1A" strokeWidth="1.5" />
        <line x1="205" y1="55" x2="178" y2="42" stroke="#1A1A1A" strokeWidth="1.5" />
        {/* Hook + load */}
        <line x1="215" y1="55" x2="215" y2="95" stroke="#6B6E70" strokeWidth="1.5" />
        <rect
          x="205"
          y="95"
          width="20"
          height="14"
          rx="2"
          stroke="#F26522"
          strokeWidth="2"
        />
      </motion.g>

      {/* Beacon light on the mast tip */}
      <motion.circle
        cx="178"
        cy="52"
        r="3.5"
        fill="#F26522"
        animate={{ opacity: [0.35, 1, 0.35] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Worker with hard hat */}
      <motion.g
        stroke="#1A1A1A"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx="150" cy="238" r="7" stroke="#F26522" />
        <path d="M143 236a7 7 0 0114 0" fill="#F26522" stroke="#F26522" />
        <line x1="150" y1="245" x2="150" y2="262" />
        <line x1="150" y1="250" x2="141" y2="258" />
        <line x1="150" y1="250" x2="159" y2="256" />
        <line x1="150" y1="262" x2="144" y2="270" />
        <line x1="150" y1="262" x2="157" y2="270" />
      </motion.g>
    </svg>
  );
}
