"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Avatar from "@/components/Avatar";
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
  const Wrapper = expandable ? "button" : "div";

  return (
    <Wrapper
      type={expandable ? "button" : undefined}
      onClick={expandable ? onToggle : undefined}
      aria-expanded={expandable ? expanded : undefined}
      className={`card flex w-56 flex-col items-center gap-3 text-center transition ${
        expandable ? "cursor-pointer hover:shadow-md hover:ring-1 hover:ring-brand-orange/40" : ""
      }`}
    >
      <Avatar name={person.name} size={72} className="text-2xl" />
      <div>
        <p className="font-bold text-brand-black">{person.name}</p>
        <p className="mt-0.5 text-sm font-medium text-brand-orange">{person.title}</p>
        {person.phone && (
          <p className="mt-1 text-xs text-brand-gray">
            {t.hseTeam.phoneLabel}: {person.phone}
          </p>
        )}
      </div>
      {expandable && (
        <span className="flex items-center gap-1 text-xs font-semibold text-brand-gray">
          {expanded ? t.hseTeam.collapse : t.hseTeam.clickToExpand}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </span>
      )}
    </Wrapper>
  );
}

function HseTeamTree() {
  const { t } = useLanguage();
  const [directorOpen, setDirectorOpen] = useState(false);
  const [regionalOpen, setRegionalOpen] = useState(false);

  // Group the regional team's cards under their region sub-headings, in
  // first-appearance order, while the two ungrouped roles (Training
  // Manager, Compliance Manager) render as plain cards above the groups.
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

      <div className="flex flex-col items-center gap-8">
        <PersonCard
          person={HSE_DIRECTOR}
          expandable
          expanded={directorOpen}
          onToggle={() => setDirectorOpen((v) => !v)}
        />

        {directorOpen && (
          <>
            <div className="h-6 w-px bg-brand-border" aria-hidden />
            <div className="flex flex-wrap justify-center gap-6">
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
            </div>
          </>
        )}

        {directorOpen && regionalOpen && (
          <>
            <div className="h-6 w-px bg-brand-border" aria-hidden />
            <div className="flex w-full flex-col items-center gap-6">
              {ungrouped.length > 0 && (
                <div className="flex flex-wrap justify-center gap-6">
                  {ungrouped.map((person) => (
                    <PersonCard key={person.id} person={person} />
                  ))}
                </div>
              )}

              {groupNames.map((group) => (
                <div key={group} className="w-full">
                  <h2 className="mb-3 text-center text-xs font-bold uppercase tracking-wide text-brand-gray">
                    {group}
                  </h2>
                  <div className="flex flex-wrap justify-center gap-6">
                    {REGIONAL_TEAM.filter((p) => p.group === group).map((person) => (
                      <PersonCard key={person.id} person={person} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
