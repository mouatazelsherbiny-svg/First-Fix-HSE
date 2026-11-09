"use client";

/**
 * Excel-style column filters for the dark tables: each header gets a small
 * funnel; it opens a list of that column's values (with a search box) to tick.
 * Rows must match every column that has a selection.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowDown, ArrowUp, Check, Filter, Search, X } from "lucide-react";

export interface FilterColumn<T> {
  key: string;
  /** The text a row shows in this column (what the filter lists and matches). */
  get: (row: T) => string | null | undefined;
  /** Date columns: the row's time (ms). Adds "Newest first / Oldest first" to the
   *  column's menu and lists its values in date order. */
  sortBy?: (row: T) => number | null | undefined;
}

export type SortDir = "desc" | "asc";

const EMPTY = "(Blank)";
const norm = (v: string | null | undefined) => (v ?? "").toString().trim() || EMPTY;

/** Filter state for a table: returns the rows that pass, plus what each header needs.
 *  Each row's column values are worked out once per data change, and a column's
 *  value list is only built when its filter is opened, so big tables stay fast. */
export function useColumnFilters<T>(rows: T[], columns: FilterColumn<T>[]) {
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [sort, setSort] = useState<{ key: string; dir: SortDir } | null>(null);

  // values[i][c] = text of row i in column c.
  const values = useMemo(() => rows.map((r) => columns.map((c) => norm(c.get(r)))), [rows, columns]);
  const colIndex = useMemo(() => new Map(columns.map((c, i) => [c.key, i])), [columns]);
  const activeSets = useMemo(
    () =>
      columns
        .map((c, i) => (selected[c.key]?.length ? ([i, new Set(selected[c.key])] as const) : null))
        .filter((x): x is readonly [number, Set<string>] => x !== null),
    [columns, selected]
  );

  // Each row's time for the date columns (only for columns that have sortBy).
  const times = useMemo(
    () => columns.map((c) => (c.sortBy ? rows.map((r) => Number(c.sortBy!(r)) || 0) : null)),
    [rows, columns]
  );

  const filtered = useMemo(() => {
    let idx = rows.map((_, i) => i);
    if (activeSets.length) idx = idx.filter((i) => activeSets.every(([c, set]) => set.has(values[i][c])));
    const ci = sort ? colIndex.get(sort.key) : undefined;
    const tm = ci === undefined ? null : times[ci];
    if (sort && tm) idx.sort((a, b) => (sort.dir === "desc" ? tm[b] - tm[a] : tm[a] - tm[b]));
    return !activeSets.length && !(sort && tm) ? rows : idx.map((i) => rows[i]);
  }, [rows, values, activeSets, sort, colIndex, times]);

  /** Values for one column, counted over the rows that pass the *other* columns' filters. */
  const optionsFor = (key: string) => {
    const ci = colIndex.get(key);
    if (ci === undefined) return [];
    const others = activeSets.filter(([c]) => c !== ci);
    const counts = new Map<string, number>();
    const when = new Map<string, number>();
    const tm = times[ci];
    for (let i = 0; i < values.length; i++) {
      if (others.length && !others.every(([c, set]) => set.has(values[i][c]))) continue;
      const v = values[i][ci];
      counts.set(v, (counts.get(v) ?? 0) + 1);
      if (tm && !when.has(v)) when.set(v, tm[i]);
    }
    // Date columns list newest first (or oldest first when that sort is on).
    const asc = sort?.key === key && sort.dir === "asc";
    return Array.from(counts, ([value, count]) => ({ value, count })).sort((a, b) =>
      a.value === EMPTY ? 1 : b.value === EMPTY ? -1
        : tm ? (asc ? 1 : -1) * ((when.get(a.value) ?? 0) - (when.get(b.value) ?? 0))
        : a.value.localeCompare(b.value, undefined, { numeric: true })
    );
  };

  const header = (key: string) => ({
    getOptions: () => optionsFor(key),
    selected: selected[key] ?? [],
    onChange: (vals: string[]) => setSelected((prev) => ({ ...prev, [key]: vals })),
    ...(times[colIndex.get(key) ?? -1]
      ? {
          sort: sort?.key === key ? sort.dir : null,
          onSort: (dir: SortDir | null) => setSort(dir ? { key, dir } : null),
        }
      : {}),
  });

  const activeCount = activeSets.length + (sort ? 1 : 0);
  const clearAll = () => {
    setSelected({});
    setSort(null);
  };

  return { filtered, header, activeCount, clearAll };
}

/** Header cell content: the label and its filter button. */
export function ColumnFilter({
  label,
  getOptions,
  selected,
  onChange,
  align = "start",
  sort,
  onSort,
}: {
  label: React.ReactNode;
  /** Built only while the list is open. */
  getOptions: () => { value: string; count: number }[];
  selected: string[];
  onChange: (values: string[]) => void;
  align?: "start" | "center";
  /** Date columns only: the current order and how to change it. */
  sort?: SortDir | null;
  onSort?: (dir: SortDir | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const btn = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const active = selected.length > 0 || !!sort;

  useLayoutEffect(() => {
    if (!open || !btn.current) return;
    const place = () => {
      const r = btn.current!.getBoundingClientRect();
      const width = 260;
      setPos({ top: r.bottom + 6, left: Math.max(8, Math.min(window.innerWidth - width - 8, r.left - 8)) });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (pop.current?.contains(e.target as Node) || btn.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const options = useMemo(() => (open ? getOptions() : []), [open, selected, sort]);
  const shown = options.filter((o) => o.value.toLowerCase().includes(q.trim().toLowerCase()));
  const toggle = (v: string) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);

  return (
    <span className={`inline-flex items-center gap-1.5 ${align === "center" ? "justify-center" : ""}`}>
      {label}
      <button
        ref={btn}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-label={`Filter ${typeof label === "string" ? label : ""}`}
        className={`inline-flex h-6 w-6 items-center justify-center rounded-md transition ${
          active ? "bg-[#f36f24] text-white shadow-[0_0_10px_rgba(243,111,36,0.6)]" : "text-white/45 hover:bg-white/10 hover:text-white"
        }`}
      >
        <Filter className="h-3.5 w-3.5" />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={pop}
            className="fixed z-[90] w-[260px] rounded-xl border border-white/15 p-2.5 text-sm font-normal text-white shadow-[0_18px_40px_-10px_rgba(0,0,0,0.9)]"
            style={{ top: pos.top, left: pos.left, background: "#161618" }}
            onClick={(e) => e.stopPropagation()}
          >
            {onSort && (
              <div className="mb-2.5 grid grid-cols-2 gap-1.5 border-b border-white/10 pb-2.5">
                {(
                  [
                    ["desc", "Newest first", ArrowDown],
                    ["asc", "Oldest first", ArrowUp],
                  ] as const
                ).map(([dir, text, Icon]) => {
                  const on = sort === dir;
                  return (
                    <button
                      key={dir}
                      type="button"
                      onClick={() => onSort(on ? null : dir)}
                      aria-pressed={on}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold transition ${
                        on ? "border-[#f36f24] bg-[#f36f24] text-white" : "border-white/15 text-white/80 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {text}
                    </button>
                  );
                })}
              </div>
            )}
            <label className="relative mb-2 block">
              <Search className="pointer-events-none absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/45" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search…"
                className="w-full rounded-full border border-white/15 bg-black/40 py-1.5 pe-3 ps-8 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#f36f24]"
              />
            </label>
            <div className="mb-1.5 flex items-center justify-between px-1 text-xs">
              <button type="button" onClick={() => onChange(Array.from(new Set([...selected, ...shown.map((o) => o.value)])))} className="font-semibold text-[#ff8a3d] hover:underline">
                Select all
              </button>
              <button type="button" onClick={() => onChange([])} className="inline-flex items-center gap-1 text-white/60 hover:text-white">
                <X className="h-3 w-3" />
                Clear
              </button>
            </div>
            <ul className="max-h-64 overflow-y-auto pe-1">
              {shown.length === 0 ? (
                <li className="px-2 py-3 text-center text-xs text-white/45">No matches</li>
              ) : (
                shown.map((o) => {
                  const on = selected.includes(o.value);
                  return (
                    <li key={o.value}>
                      <button
                        type="button"
                        onClick={() => toggle(o.value)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-start hover:bg-white/[0.06]"
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            on ? "border-[#f36f24] bg-[#f36f24]" : "border-white/30"
                          }`}
                        >
                          {on && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                        </span>
                        <span className="min-w-0 flex-1 truncate" title={o.value}>
                          {o.value}
                        </span>
                        <span className="shrink-0 text-xs tabular-nums text-white/45">{o.count.toLocaleString("en-US")}</span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>,
          document.body
        )}
    </span>
  );
}
