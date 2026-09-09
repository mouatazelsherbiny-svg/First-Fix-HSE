"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/context/LanguageContext";
import {
  HSE_DIRECTOR,
  DIRECTOR_REPORTS,
  REGIONAL_TEAM,
  REGIONAL_HSEM_ID,
  type OrgPerson,
} from "@/lib/orgChart";

export default function HseTeamPage() {
  return (
    <ProtectedRoute>
      <HseTeamTree />
    </ProtectedRoute>
  );
}

/** Left-to-right display order for the regional groups at the bottom of the
 *  tree. Any group not listed here falls back to the end, in data order. */
const REGION_ORDER = ["Shura Island", "Amaala Projects", "Riyadh", "Jeddah / Makkah", "Madinah"];

function sortGroups(names: string[]): string[] {
  return [...names].sort((a, b) => {
    const ia = REGION_ORDER.indexOf(a);
    const ib = REGION_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

/** Vertical connector stub: a short line dropping from a parent node down
 *  to the horizontal bar of its children row. */
function Stub() {
  return <div className="h-6 w-0.5 shrink-0 bg-brand-border" />;
}

/** Wraps a row of child nodes with the classic org-chart connector: a
 *  single trunk line down from the parent, a horizontal bar spanning the
 *  row, and a stub dropping from that bar into each child. */
function Branch({ children }: { children: ReactNode[] }) {
  return (
    <div className="flex flex-col items-center">
      <Stub />
      <div className="flex flex-nowrap justify-center gap-x-6 gap-y-6 border-t-2 border-brand-border pt-0">
        {children.map((child, i) => (
          <div key={i} className="flex flex-col items-center pt-0">
            <Stub />
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

function PersonCard({
  person,
  expandable,
  expanded,
  onToggle,
  onHoverOpen,
}: {
  person: OrgPerson;
  expandable?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  onHoverOpen?: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div
      role={expandable ? "button" : undefined}
      tabIndex={expandable ? 0 : undefined}
      onClick={expandable ? onToggle : undefined}
      onMouseEnter={expandable ? onHoverOpen : undefined}
      onFocus={expandable ? onHoverOpen : undefined}
      onKeyDown={
        expandable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onToggle?.();
            }
          : undefined
      }
      className={`flex w-64 items-stretch overflow-hidden rounded-lg border border-brand-border bg-brand-surface shadow-sm transition ${
        expandable ? "cursor-pointer hover:shadow-md hover:ring-1 hover:ring-brand-orange/50" : ""
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={person.photoUrl}
        alt={person.name}
        className="h-auto w-20 shrink-0 object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col divide-y divide-brand-border">
        <div className="bg-brand-grayLight/60 px-2.5 py-1.5">
          <p className="truncate text-xs font-bold text-brand-grayDark">{person.title}</p>
        </div>
        <div className="px-2.5 py-1.5">
          <p className="truncate text-sm font-bold text-brand-black">{person.name}</p>
        </div>
        {person.phone && (
          <div className="flex items-center justify-between px-2.5 py-1.5">
            <p className="truncate text-xs text-brand-gray">{person.phone}</p>
            {expandable && (
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-brand-gray transition-transform duration-200 ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RegionGroup({ name, people }: { name: string; people: OrgPerson[] }) {
  // Regions with an explicit `col` on their people (currently just Riyadh)
  // render as two side-by-side columns, in the same left/right reading
  // order as the source org chart; everyone else stacks in one column.
  const hasColumns = people.some((p) => p.col === 2);
  const col1 = people.filter((p) => p.col !== 2);
  const col2 = people.filter((p) => p.col === 2);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`rounded bg-brand-orange px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wide text-brand-onAccent ${
          hasColumns ? "w-full" : "w-full max-w-[16.5rem]"
        }`}
      >
        {name}
      </div>
      {hasColumns ? (
        <div className="flex items-start gap-4">
          <div className="flex flex-col gap-4">
            {col1.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
          <div className="flex flex-col gap-4">
            {col2.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {people.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      )}
    </div>
  );
}

function HseTeamTree() {
  const { t } = useLanguage();
  const [directorOpen, setDirectorOpen] = useState(false);
  const [regionalOpen, setRegionalOpen] = useState(false);

  const ungrouped = REGIONAL_TEAM.filter((p) => !p.group);
  const groupNamesRaw: string[] = [];
  REGIONAL_TEAM.forEach((p) => {
    if (p.group && !groupNamesRaw.includes(p.group)) groupNamesRaw.push(p.group);
  });
  const groupNames = sortGroups(groupNamesRaw);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-black">{t.hseTeam.title}</h1>
        <p className="mt-1 text-sm text-brand-gray">{t.hseTeam.subtitle}</p>
      </div>

      <div className="overflow-x-auto pb-4">
        <div
          className="flex min-w-fit flex-col items-center gap-0"
          onMouseLeave={() => {
            setDirectorOpen(false);
            setRegionalOpen(false);
          }}
        >
          <PersonCard
            person={HSE_DIRECTOR}
            expandable
            expanded={directorOpen}
            onToggle={() => setDirectorOpen((v) => !v)}
            onHoverOpen={() => setDirectorOpen(true)}
          />

          {directorOpen && (
            <Branch>
              {DIRECTOR_REPORTS.map((person) =>
                person.id === REGIONAL_HSEM_ID ? (
                  <PersonCard
                    key={person.id}
                    person={person}
                    expandable
                    expanded={regionalOpen}
                    onToggle={() => setRegionalOpen((v) => !v)}
                    onHoverOpen={() => setRegionalOpen(true)}
                  />
                ) : (
                  <PersonCard key={person.id} person={person} />
                )
              )}
            </Branch>
          )}

          {directorOpen && regionalOpen && (
            <Branch>
              {[
                ...ungrouped.map((person) => <PersonCard key={person.id} person={person} />),
                ...groupNames.map((group) => (
                  <RegionGroup
                    key={group}
                    name={group}
                    people={REGIONAL_TEAM.filter((p) => p.group === group)}
                  />
                )),
              ]}
            </Branch>
          )}
        </div>
      </div>
    </div>
  );
}
