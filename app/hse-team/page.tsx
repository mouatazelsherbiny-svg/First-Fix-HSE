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
}: {
  person: OrgPerson;
  expandable?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div
      role={expandable ? "button" : undefined}
      tabIndex={expandable ? 0 : undefined}
      onClick={expandable ? onToggle : undefined}
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
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-[16.5rem] rounded bg-brand-orange px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wide text-brand-onAccent">
        {name}
      </div>
      <div className="flex flex-col gap-4">
        {people.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </div>
    </div>
  );
}

function HseTeamTree() {
  const { t } = useLanguage();
  const [directorOpen, setDirectorOpen] = useState(false);
  const [regionalOpen, setRegionalOpen] = useState(false);

  const ungrouped = REGIONAL_TEAM.filter((p) => !p.group);
  const groupNames: string[] = [];
  REGIONAL_TEAM.forEach((p) => {
    if (p.group && !groupNames.includes(p.group)) groupNames.push(p.group);
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-black">{t.hseTeam.title}</h1>
        <p className="mt-1 text-sm text-brand-gray">{t.hseTeam.subtitle}</p>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-fit flex-col items-center gap-0">
          <PersonCard
            person={HSE_DIRECTOR}
            expandable
            expanded={directorOpen}
            onToggle={() => setDirectorOpen((v) => !v)}
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
