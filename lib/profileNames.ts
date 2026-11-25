"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/** Who created a record: profiles id → name (falls back to the e-mail). Loaded once per page visit. */
let cache: Promise<Map<string, string>> | null = null;

function load() {
  if (!cache) {
    const p = (async () => {
      const { data } = await supabase.from("profiles").select("id, full_name, email");
      return new Map((data ?? []).map((r: { id: string; full_name: string | null; email: string | null }) => [r.id, (r.full_name || "").trim() || r.email || "—"]));
    })();
    cache = p;
    p.catch(() => (cache = null));
  }
  return cache;
}

export function useProfileNames() {
  const [names, setNames] = useState<Map<string, string>>(new Map());
  useEffect(() => {
    let active = true;
    load()
      .then((m) => active && setNames(m))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return names;
}
