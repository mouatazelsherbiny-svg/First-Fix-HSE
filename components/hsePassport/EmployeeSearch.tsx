"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { searchEmployees } from "@/lib/employeeDirectory";
import { EmployeeRecord } from "@/lib/mockData";

interface EmployeeSearchProps {
  selected: EmployeeRecord | null;
  onSelect: (employee: EmployeeRecord | null) => void;
}

export default function EmployeeSearch({
  selected,
  onSelect,
}: EmployeeSearchProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<EmployeeRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced, server-side search — the employees table holds the
  // company's full real roster (thousands of rows), so this never loads
  // the whole list into the browser, just the up-to-8 best matches for
  // whatever's been typed so far.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setMatches([]);
      setIsSearching(false);
      return;
    }
    let active = true;
    setIsSearching(true);
    const timer = setTimeout(() => {
      searchEmployees(q).then((results) => {
        if (active) {
          setMatches(results);
          setIsSearching(false);
        }
      });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  if (selected) {
    return (
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-orangeLight text-sm font-bold text-brand-orange">
            {selected.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div>
            <p className="text-sm font-bold text-brand-black">{selected.name}</p>
            <p className="text-xs text-brand-gray">
              {selected.employeeId} · {selected.project} · {selected.department}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onSelect(null);
            setQuery("");
          }}
          className="btn-secondary !px-4 !py-2 text-xs"
        >
          {t.hse.changeEmployee}
        </button>
      </div>
    );
  }

  return (
    <div className="card relative">
      <label className="label-field">{t.hse.searchEmployee}</label>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.hse.searchPlaceholder}
        className="input-field"
        autoComplete="off"
      />

      {query.trim() && (
        <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-brand-border">
          {isSearching ? (
            <p className="px-4 py-3 text-sm text-brand-gray">{t.common.loading}</p>
          ) : matches.length === 0 ? (
            <p className="px-4 py-3 text-sm text-brand-gray">{t.hse.noMatches}</p>
          ) : (
            matches.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => {
                  onSelect(e);
                  setQuery("");
                }}
                className="flex w-full items-center justify-between gap-3 border-b border-brand-border px-4 py-3 text-start transition last:border-0 hover:bg-brand-grayLight/50"
              >
                <span>
                  <span className="block text-sm font-semibold text-brand-black">
                    {e.name}
                  </span>
                  <span className="block text-xs text-brand-gray">
                    {e.employeeId} · {e.project} · {e.department}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
