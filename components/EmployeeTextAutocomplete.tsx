"use client";

import { useEffect, useRef, useState } from "react";
import { searchEmployees } from "@/lib/employeeDirectory";
import { EmployeeRecord } from "@/lib/mockData";

interface EmployeeTextAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

/** A plain text input backed by a live search of the employees directory
 *  (by name or employee code). Picking a suggestion fills the field with
 *  "Name (EmployeeCode)"; typing freely and never picking one is still
 *  allowed — e.g. a subcontractor's own foreman who isn't in the company
 *  roster. Used for free-text "who" fields (Receiver, Supervisor/Foreman)
 *  that store a name, not a foreign key. */
export default function EmployeeTextAutocomplete({
  value,
  onChange,
  placeholder,
  required,
  className = "",
}: EmployeeTextAutocompleteProps) {
  const [matches, setMatches] = useState<EmployeeRecord[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = value.trim();
    if (!q || !isOpen) {
      setMatches([]);
      return;
    }
    let active = true;
    const timer = setTimeout(() => {
      searchEmployees(q).then((results) => {
        if (active) setMatches(results);
      });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [value, isOpen]);

  // Close the suggestions dropdown on any click outside this component.
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className={`input-field ${className}`}
        autoComplete="off"
      />

      {isOpen && value.trim() && matches.length > 0 && (
        <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-brand-border bg-brand-surface/95 shadow-lg backdrop-blur-xl">
          {matches.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => {
                onChange(`${e.name} (${e.employeeId})`);
                setIsOpen(false);
              }}
              className="flex w-full flex-col border-b border-brand-border px-4 py-2.5 text-start transition last:border-0 hover:bg-brand-grayLight/50"
            >
              <span className="text-sm font-semibold text-brand-black">{e.name}</span>
              <span className="text-xs text-brand-gray">
                {e.employeeId} · {e.project} · {e.department}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
