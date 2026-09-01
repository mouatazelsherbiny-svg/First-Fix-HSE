"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getRandomSafetyTip } from "@/lib/safetyTips";

export default function SafetyTipCard() {
  const { t } = useLanguage();
  // Picked on the client only (after mount) so the server-rendered markup
  // and the first client render match — a random pick during render would
  // otherwise cause a hydration mismatch.
  const [tip, setTip] = useState<string | null>(null);

  useEffect(() => {
    setTip(getRandomSafetyTip());
  }, []);

  return (
    <div className="card">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-orangeLight text-brand-orange">
        <Lightbulb className="h-5 w-5" />
      </div>
      <h2 className="text-sm font-bold text-brand-black">{t.dashboard.safetyTipTitle}</h2>
      <div className="mt-2 min-h-[72px]">
        <AnimatePresence mode="wait">
          {tip && (
            <motion.p
              key={tip}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-sm leading-relaxed text-brand-grayDark"
            >
              {tip}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
