"use client";

import { useEffect } from "react";
import { markMobileApp } from "@/lib/mobileApp";

/** Remembers (for this tab / app window) that we are in the phone app. */
export default function MobileAppMark() {
  useEffect(() => {
    markMobileApp();
  }, []);
  return null;
}
