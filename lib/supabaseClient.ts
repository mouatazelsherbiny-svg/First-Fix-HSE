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
  // Ask for the row count first, then fetch every page at the same time
  // instead of one after another (18k observations = 19 pages: one wait
  // instead of 19). The count is for the whole table, so it can only
  // over-estimate — extra pages simply come back empty.
  const { count, error: countError } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  if (countError || count == null) return fetchSequential<T>(table, configure, pageSize);

  const pages = Math.max(1, Math.ceil(count / pageSize));
  const results: T[][] = new Array(pages);
  const CONCURRENCY = 6;
  let next = 0;
  async function worker() {
    while (next < pages) {
      const i = next++;
      const from = i * pageSize;
      const { data, error } = await configure(supabase.from(table)).range(from, from + pageSize - 1);
      if (error) throw error;
      results[i] = (data as T[] | null) ?? [];
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, pages) }, worker));
  const rows = results.flat();
  // Rows added between the count and the fetch: pick up anything past the end.
  if (results[pages - 1]?.length === pageSize) {
    let from = pages * pageSize;
    for (;;) {
      const { data, error } = await configure(supabase.from(table)).range(from, from + pageSize - 1);
      if (error) throw error;
      const page = (data as T[] | null) ?? [];
      rows.push(...page);
      if (page.length < pageSize) break;
      from += pageSize;
    }
  }
  return rows;
}

async function fetchSequential<T>(
  table: string,
  configure: (query: ReturnType<typeof supabase.from>) => any,
  pageSize: number
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
