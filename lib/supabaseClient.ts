import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fails loudly at build/dev time instead of silently hitting undefined
  // endpoints — much easier to diagnose than a mysterious network error
  // deep inside a context provider.
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Set them in .env.local (local dev) and in your Vercel project's Environment Variables (production)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/** Convenience accessor for the signed-in user's auth id, used to stamp
 *  created_by on inserts. Returns null when signed out. */
export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/**
 * PostgREST (Supabase's API layer) caps a single `select` response at 1000
 * rows by default, silently — a plain `.select("*")` on a table with more
 * rows than that returns only a partial page with no error. `observations`
 * (18k+ rows) and `toolbox_talk_records` (4.5k+ rows) both blow past this,
 * which meant dashboard aggregates and "top project" rankings were quietly
 * computed over a fraction of the data. This walks the table with `.range()`
 * until a page comes back short, so callers always get every row.
 */
export async function fetchAllRows<T>(
  table: string,
  configure: (query: ReturnType<typeof supabase.from>) => any,
  pageSize = 1000
): Promise<T[]> {
  const rows: T[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await configure(supabase.from(table)).range(
      from,
      from + pageSize - 1
    );
    if (error) throw error;
    const page = (data as T[] | null) ?? [];
    rows.push(...page);
    if (page.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}
