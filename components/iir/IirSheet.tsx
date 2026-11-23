"use client";

/**
 * The IIR form drawn like the Word form FF-HSE-FOR-001 (white sheet, black
 * grid, orange section bars), section by section with the same fields,
 * check boxes and drop-down lists. mode="edit" makes every field editable
 * (on a phone the cells stack); mode="print" is the read-only A4 layout the
 * PDF is printed from.
 */

import { createContext, useContext, useRef } from "react";
import { Camera, Plus, Trash2 } from "lucide-react";
import SignaturePad from "@/components/SignaturePad";
import { compressImage } from "@/lib/compressImage";
import { PROJECTS } from "@/lib/mockData";
import {
  ACTION_CAUSE,
  emptyPhoto,
  ENV_SEVERITY,
  fmtDate,
  HIERARCHY,
  IIR_FORM_NO,
  IMPACT_ENERGY,
  IMPACT_TYPE,
  INCIDENT_CATEGORIES,
  LIFE_SAVING_RULES,
  OBJECT_CAUSE,
  PROCESS_CAUSE,
  RELEASED_TO,
  RISK_PROBABILITY,
  SEVERITY_LEVEL,
  tlpTone,
  TOTAL_LOSS_POTENTIAL,
  totalLossPotential,
  VALUE_CATEGORY,
  YES_NO,
  type IirAction,
  type IirData,
  type IirPhoto,
  type IirReport,
} from "@/lib/iir";

type Mode = "edit" | "print";
type BoolKey = { [K in keyof IirData]: IirData[K] extends boolean ? K : never }[keyof IirData];
type StrKey = { [K in keyof IirData]: IirData[K] extends string ? K : never }[keyof IirData];

const ORANGE = "#E36C0A";

interface Ctx {
  mode: Mode;
  r: IirReport;
  setData: (patch: Partial<IirData>) => void;
}
const SheetCtx = createContext<Ctx | null>(null);
const useSheet = () => useContext(SheetCtx)!;

/** Ticking something in a section clears that section's "Not Applicable". */
const NA_OF: Partial<Record<BoolKey, BoolKey>> = {
  lwc: "inj_na",
  rwc: "inj_na",
  mtc: "inj_na",
  fac: "inj_na",
  nm_fatality: "nm_na",
  nm_env: "nm_na",
  nm_property: "nm_na",
  nm_utility: "nm_na",
  own_firstFix: "pd_na",
  own_client: "pd_na",
  own_public: "pd_na",
  own_utility: "pd_na",
};

const CSS = `
.iir{font-family:Calibri,Carlito,"Segoe UI",Arial,sans-serif;color:#000;background:#fff;font-size:12.5px;line-height:1.35}
.iir *{box-sizing:border-box}
.iir-tbl{border-top:1px solid #000;border-left:1px solid #000}
.iir-row{display:flex;flex-wrap:wrap}
.iir-cell{flex:1 1 100%;min-width:0;border-right:1px solid #000;border-bottom:1px solid #000;padding:4px 6px}
@media (min-width:640px){.iir-cell{flex:0 0 var(--w)}}
.iir.print .iir-cell{flex:0 0 var(--w)}
.iir-bar{background:${ORANGE};color:#fff;font-weight:700;padding:3px 6px 3px 18px;display:flex;align-items:center;gap:8px}
.iir-bar .na{margin-inline-start:auto;font-weight:600}
.iir b{font-weight:700}
.iir-in{border:0;border-bottom:1px dotted #9ca3af;background:#eef4ff;color:#000;font:inherit;padding:1px 4px;border-radius:2px;min-width:0;width:100%;outline:none}
.iir-in:focus{background:#fff4ea;border-bottom-color:${ORANGE}}
textarea.iir-in{resize:vertical;display:block;line-height:1.4}
select.iir-in{padding:1px 2px}
.iir-f{display:flex;align-items:baseline;gap:5px;min-width:0}
.iir-f>b{white-space:nowrap}
.iir-f .v{white-space:pre-wrap;word-break:break-word}
.iir-cb{display:inline-flex;align-items:center;gap:4px;margin-inline-end:16px;cursor:pointer;user-select:none;white-space:nowrap}
.iir.print .iir-cb{cursor:default}
.iir-cb .g{font-size:15px;line-height:1}
.iir-page{background:#fff}
.iir-head{display:flex;align-items:center;gap:12px;padding:4px 0 10px}
.iir-head img{height:26px}
.iir-head .t{flex:1;text-align:center;font-weight:700;font-size:13px}
.iir-foot{font-size:9px;color:#333;padding-top:6px}
.iir.print .iir-pb{break-before:page;page-break-before:always}
.iir.print .iir-avoid{break-inside:avoid;page-break-inside:avoid}
.iir-cover h1{font:700 26px Arial,sans-serif;text-align:center;margin:30px 0 18px}
.iir-cover h2{font:700 19px Arial,sans-serif;text-align:center;margin:6px 0}
.iir-ml{display:none}
@media (max-width:639px){.iir.edit .iir-hdr{display:none}.iir.edit .iir-ml{display:block;font-weight:700;font-size:11px;color:#555}.iir.edit .iir-act{border-top:3px solid ${ORANGE}}}
.iir-ph{display:flex;align-items:center;justify-content:center;background:#e8eef8;border:1px dashed #9db3d6;color:#4b6b9a;font-weight:600;flex-direction:column;gap:6px;cursor:pointer}
.iir.print .iir-ml{display:none}
@media (max-width:639px){.iir.edit .iir-hdr{display:none}.iir.edit .iir-ml{display:block;font-weight:700;font-size:11px;color:#555}.iir.edit .iir-act{border-top:3px solid ${ORANGE}}}
.iir-ph{border:0;background:#fff}
`;

/* ---------------- small building blocks ---------------- */

function Cell({ w, children, className = "", style }: { w: number; children?: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`iir-cell ${className}`} style={{ ["--w" as string]: `${w}%`, ...style }}>
      {children}
    </div>
  );
}

function Bar({ no, title, na }: { no?: string; title: React.ReactNode; na?: BoolKey }) {
  return (
    <Cell w={100} className="iir-bar">
      <span>
        {no && <>{no}.&nbsp;&nbsp;</>}
        {title}
      </span>
      {na && (
        <span className="na">
          <Chk k={na} label="Check if Not Applicable" light />
        </span>
      )}
    </Cell>
  );
}

function Chk({ k, label, light }: { k: BoolKey; label: React.ReactNode; light?: boolean }) {
  const { mode, r, setData } = useSheet();
  const on = r.data[k];
  const toggle = () => {
    if (mode !== "edit") return;
    const patch: Partial<IirData> = { [k]: !on } as Partial<IirData>;
    const na = NA_OF[k];
    if (!on && na) (patch as Record<string, boolean>)[na] = false;
    setData(patch);
  };
  return (
    <span
      className="iir-cb"
      role={mode === "edit" ? "checkbox" : undefined}
      aria-checked={mode === "edit" ? on : undefined}
      tabIndex={mode === "edit" ? 0 : undefined}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          toggle();
        }
      }}
      style={light ? { color: "#fff" } : undefined}
    >
      <span className="g">{on ? "☒" : "☐"}</span>
      {label}
    </span>
  );
}

function Txt({
  k,
  label,
  type = "text",
  rows,
  list,
  red,
}: {
  k: StrKey;
  label?: React.ReactNode;
  type?: "text" | "date" | "time";
  rows?: number;
  list?: string;
  red?: boolean;
}) {
  const { mode, r, setData } = useSheet();
  const v = r.data[k];
  const shown = type === "date" ? fmtDate(v) : v;
  const lab = label ? <b style={red ? { color: "#C00000" } : undefined}>{label}</b> : null;
  if (mode === "print") {
    return rows ? (
      <div>
        {lab}
        <div className="v" style={{ whiteSpace: "pre-wrap", minHeight: rows * 17 }}>
          {shown}
        </div>
      </div>
    ) : (
      <div className="iir-f">
        {lab}
        <span className="v">{shown}</span>
      </div>
    );
  }
  if (rows) {
    return (
      <div>
        {lab}
        <textarea className="iir-in" rows={rows} value={v} onChange={(e) => setData({ [k]: e.target.value } as Partial<IirData>)} />
      </div>
    );
  }
  return (
    <label className="iir-f">
      {lab}
      <input className="iir-in" type={type} list={list} value={v} onChange={(e) => setData({ [k]: e.target.value } as Partial<IirData>)} />
    </label>
  );
}

function Sel({ k, label, options, red }: { k: StrKey; label?: React.ReactNode; options: string[]; red?: boolean }) {
  const { mode, r, setData } = useSheet();
  const v = r.data[k];
  const lab = label ? <b style={red ? { color: "#C00000" } : undefined}>{label}</b> : null;
  if (mode === "print") {
    return (
      <div className="iir-f">
        {lab}
        <span className="v">{v}</span>
      </div>
    );
  }
  return (
    <label className="iir-f">
      {lab}
      <select className="iir-in" value={v} onChange={(e) => setData({ [k]: e.target.value } as Partial<IirData>)}>
        <option value="">Choose an item.</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
        {v && !options.includes(v) && <option value={v}>{v}</option>}
      </select>
    </label>
  );
}

export function IirHeader() {
  return (
    <div className="iir-head">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/templates/iir-logo.png" alt="First Fix" />
      <div className="t">Incident Investigation Report</div>
      <div style={{ width: 90 }} />
    </div>
  );
}

export function IirFooter() {
  return <div className="iir-foot">{IIR_FORM_NO}</div>;
}

/** Picture place: tap to add / change (edit), the picture alone (print). */
function PhotoBox({ src, onChange, height, label }: { src: string; onChange: (v: string) => void; height: number; label: string }) {
  const { mode } = useSheet();
  const input = useRef<HTMLInputElement>(null);
  const pick = async (f: File | undefined) => {
    if (!f) return;
    try {
      onChange(await compressImage(f, 1600, 0.8));
    } catch {
      /* not an image */
    }
  };
  return (
    <div
      className="iir-ph"
      style={{ height, position: "relative" }}
      onClick={() => mode === "edit" && input.current?.click()}
      role={mode === "edit" ? "button" : undefined}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={label} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
      ) : mode === "edit" ? (
        <>
          <Camera size={28} />
          <span>{label}</span>
        </>
      ) : null}
      {mode === "edit" && (
        <>
          <input ref={input} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0] ?? undefined)} />
          {src && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              style={{ position: "absolute", top: 6, right: 6, background: "#fff", border: "1px solid #d1d5db", borderRadius: 8, padding: 5, color: "#b91c1c" }}
              aria-label="Remove picture"
            >
              <Trash2 size={15} />
            </button>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------- the sheet ---------------- */

export default function IirSheet({ mode, report, onChange }: { mode: Mode; report: IirReport; onChange?: (r: IirReport) => void }) {
  const set = (patch: Partial<IirReport>) => onChange?.({ ...report, ...patch });
  const setData = (patch: Partial<IirData>) => {
    const data = { ...report.data, ...patch };
    if ("severityLevel" in patch || "riskProbability" in patch) {
      const tlp = totalLossPotential(data.severityLevel, data.riskProbability);
      if (tlp) data.tlp = tlp;
    }
    set({ data });
  };
  const d = report.data;
  const setAction = (i: number, patch: Partial<IirAction>) => setData({ actions: d.actions.map((a, j) => (j === i ? { ...a, ...patch } : a)) });
  const setPhoto = (i: number, patch: Partial<IirPhoto>) => set({ photos: report.photos.map((p, j) => (j === i ? { ...p, ...patch } : p)) });
  const edit = mode === "edit";
  const tone = tlpTone(d.tlp);

  const ML: Record<string, string> = { action: "Action", responsible: "Responsible person", due: "Due Date", completed: "Completed Date" };
  const aCell = (i: number, key: keyof IirAction, type: "text" | "date" = "text") =>
    edit ? (
      <>
        <span className="iir-ml">{ML[key]}</span>
        <input className="iir-in" type={type} value={d.actions[i][key]} onChange={(e) => setAction(i, { [key]: e.target.value })} />
      </>
    ) : (
      <span>{type === "date" ? fmtDate(d.actions[i][key]) : d.actions[i][key]}</span>
    );
  const pCell = (i: number, key: keyof IirPhoto, label: string, type: "text" | "date" | "time" = "text") => (
    <div className="iir-f">
      <b style={{ fontSize: 11 }}>{label}</b>
      {edit ? (
        <input className="iir-in" type={type} value={report.photos[i][key]} onChange={(e) => setPhoto(i, { [key]: e.target.value })} />
      ) : (
        <span className="v">{type === "date" ? fmtDate(report.photos[i][key]) : report.photos[i][key]}</span>
      )}
    </div>
  );

  return (
    <SheetCtx.Provider value={{ mode, r: report, setData }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <datalist id="iir-projects">
        {PROJECTS.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
      <div className={`iir ${mode}`}>
        {/* ================= COVER ================= */}
        <section className="iir-page iir-cover">
          {edit && <IirHeader />}
          <h2 style={{ fontSize: 15, marginTop: 6 }}>First Fix – HSE Department</h2>
          <h1>Incident Investigation Report</h1>
          <div style={{ maxWidth: 420, margin: "0 auto" }}>
            {edit ? (
              <div style={{ display: "grid", gap: 8 }}>
                <Sel k="coverCategory" label="Incident Category:" options={INCIDENT_CATEGORIES} />
                <Txt k="project" label="Project Name:" list="iir-projects" />
                <Txt k="incidentDate" label="Date:" type="date" />
              </div>
            ) : (
              <>
                <h2>{d.coverCategory || "Incident Category"}</h2>
                <h2>{d.project || "Project Name"}</h2>
                <h2 style={{ marginTop: 22 }}>{fmtDate(d.incidentDate) || "Date"}</h2>
              </>
            )}
          </div>
          <div style={{ maxWidth: 360, margin: "22px auto 0" }}>
            <PhotoBox src={report.coverPhoto} onChange={(v) => set({ coverPhoto: v })} height={edit ? 260 : 400} label="Add cover photo" />
          </div>
        </section>

        {/* ================= FORM ================= */}
        <section className="iir-page iir-pb" style={{ marginTop: edit ? 28 : 0 }}>
          <div className="iir-tbl">
            <div className="iir-row">
              <Cell w={100}>
                <b>Classification:</b>&nbsp; <Chk k="cls_injury" label="Injury/Illness" />
                <Chk k="cls_env" label="Environmental" />
                <Chk k="cls_nearMiss" label="Near Miss" />
                <Chk k="cls_lsr" label="Life Saving Rules" />
                <Chk k="cls_property" label="Property Damage" />
              </Cell>
            </div>
            {/* 1 */}
            <div className="iir-row">
              <Bar no="1" title="PROJECT DETAILS" />
              <Cell w={40}>
                <div style={{ display: "grid", gap: 3 }}>
                  <Txt k="project" label="Project:" list="iir-projects" />
                  <Txt k="pmTeam" label="PM Team:" />
                  <Txt k="location" label="Location:" />
                  <Txt k="otherLocation" label="Other Location (Specify):" />
                </div>
              </Cell>
              <Cell w={60} style={{ padding: 0 }}>
                <div className="iir-row" style={{ height: "100%" }}>
                  <Cell w={50} style={{ borderRight: "1px solid #000" }}>
                    <Txt k="incidentTime" label="Incident Time:" type="time" />
                  </Cell>
                  <Cell w={50} style={{ borderRight: 0 }}>
                    <Txt k="reportTime" label="Report Time:" type="time" />
                  </Cell>
                  <Cell w={50} style={{ borderBottom: 0 }}>
                    <Txt k="incidentDate" label="Incident Date:" type="date" />
                  </Cell>
                  <Cell w={50} style={{ borderRight: 0, borderBottom: 0 }}>
                    <Txt k="reportDate" label="Report Date:" type="date" />
                  </Cell>
                </div>
              </Cell>
              <Cell w={30}>
                <Txt k="spic" label="SPIC:" />
              </Cell>
              <Cell w={35}>
                <Txt k="projectDirector" label="Project Director/Manager:" />
              </Cell>
              <Cell w={35}>
                <Txt k="hsePm" label="HSE Project Manager:" />
              </Cell>
              <Cell w={55}>
                <Chk k="workRelated" label="Work Related" />
                <Chk k="nonWorkRelated" label="Non-Work Related" />
                <br />
                <Chk k="onSite" label="On Site" />
                <Chk k="offSite" label="Off Site" />
                <Chk k="rta" label="Road Traffic Accident" />
              </Cell>
              <Cell w={18} style={{ display: "flex", alignItems: "center" }}>
                <Chk k="firstFix" label="First Fix" />
              </Cell>
              <Cell w={27} style={{ display: "flex", alignItems: "center" }}>
                <Chk k="subContractor" label="Sub-Contractor" />
              </Cell>
            </div>
            {/* 2 */}
            <div className="iir-row">
              <Bar no="2" title="INCIDENT SUMMARY (Task, where, what happened, what was the outcome)" />
              <Cell w={100}>
                <Txt k="summary" rows={6} />
              </Cell>
            </div>
            {/* 3 */}
            <div className="iir-row">
              <Bar
                no="3"
                title={
                  <>
                    EMPLOYEE INFORMATION (Refer additional <u>Employee Information Form</u> – if required)
                  </>
                }
              />
              <Cell w={45}>
                <div style={{ display: "grid", gap: 3 }}>
                  <Txt k="surname" label="Surname:" />
                  <Txt k="firstName" label="First Name:" />
                  <Txt k="dob" label="Date of Birth:" type="date" />
                  <Txt k="company" label="Company:" />
                </div>
              </Cell>
              <Cell w={55}>
                <div style={{ display: "grid", gap: 3 }}>
                  <Txt k="employeeId" label="Employee ID No.:" />
                  <Txt k="hireDate" label="Hire Date:" type="date" />
                  <Txt k="tradeDate" label="Trade Date:" type="date" />
                  <Txt k="position" label="Position:" />
                </div>
              </Cell>
            </div>
            {/* 4 */}
            <div className="iir-row iir-avoid">
              <Bar no="4" title="INJURY/ILLNESS DETAILS (if applicable)" na="inj_na" />
              <Cell w={100}>
                <Chk k="lwc" label="Lost Work-Day Case" />
                <Chk k="rwc" label="Restricted Work-Day Case" />
                <Chk k="mtc" label="Medical Treatment Case" />
                <Chk k="fac" label="First Aid Case" />
              </Cell>
              <Cell w={30}>
                <Txt k="bodyPart" label="Body Part:" />
              </Cell>
              <Cell w={35}>
                <Txt k="injuryDescription" label="Injury Description:" />
              </Cell>
              <Cell w={35}>
                <Txt k="ems" label="EMS/Ambulance Transport:" />
              </Cell>
              <Cell w={100}>
                <Txt k="treatment" label="Treatment:" />
              </Cell>
            </div>
            {/* 5 */}
            <div className="iir-row iir-avoid">
              <Bar no="5" title="NEAR MISS DETAIL" na="nm_na" />
              <Cell w={100}>
                <div>Perceived Potential Risk of:</div>
                <Chk k="nm_fatality" label="Fatality/Injury/Illness" />
                <Chk k="nm_env" label="Environmental" />
                <Chk k="nm_property" label="Property Damage" />
                <Chk k="nm_utility" label="Utility Hit/Service Interruption" />
              </Cell>
            </div>
            {/* 6 */}
            <div className="iir-row iir-avoid">
              <Bar no="6" title="ENVIRONMENTAL DETAIL" na="env_na" />
              <Cell w={48}>
                <Txt k="envCategory" label="Environmental Category:" />
              </Cell>
              <Cell w={52}>
                <Txt k="substance" label="Substance Released:" />
              </Cell>
              <Cell w={48}>
                <Txt k="equipmentSource" label="Equipment/Source:" />
              </Cell>
              <Cell w={52}>
                <Sel k="releasedTo" label="Released to:" options={RELEASED_TO} />
              </Cell>
              <Cell w={48}>
                <Sel k="severity" label="Severity:" options={ENV_SEVERITY} />
              </Cell>
              <Cell w={52}>
                <div style={{ display: "flex", gap: 14 }}>
                  <Txt k="quantity" label="Quantity:" />
                  <Txt k="unit" label="Unit:" />
                </div>
              </Cell>
              <Cell w={48}>
                <Txt k="spillCleanup" label="Spill/Release Clean-up/Disposition:" />
              </Cell>
              <Cell w={52}>
                <Txt k="envProcessCause" label="Process/Condition Cause:" />
              </Cell>
            </div>
            {/* 7 */}
            <div className="iir-row iir-avoid">
              <Bar no="7" title="PROPERTY DAMAGE DETAIL" na="pd_na" />
              <Cell w={100}>
                <b>Property Owner:</b>&nbsp;&nbsp; <Chk k="own_firstFix" label="First Fix" />
                <Chk k="own_client" label="Client" />
                <Chk k="own_public" label="Public" />
                <Chk k="own_utility" label="Utility Provider" />
              </Cell>
              <Cell w={32}>
                <Txt k="equipmentType" label="Equipment Type:" />
              </Cell>
              <Cell w={44}>
                <Txt k="makeModel" label="Make/Model/Type:" />
              </Cell>
              <Cell w={24}>
                <Txt k="vandalism" label="Vandalism:" />
              </Cell>
              <Cell w={32}>
                <Txt k="plantRegNo" label="Plant/Reg. No:" />
              </Cell>
              <Cell w={36}>
                <Sel k="fire" label="Fire:" options={YES_NO} />
              </Cell>
              <Cell w={32}>
                <Sel k="valueCategory" label="Value Category:" options={VALUE_CATEGORY} />
              </Cell>
            </div>
            {/* 8 */}
            <div className="iir-row iir-avoid">
              <Bar no="8" title="UTILITY HIT/SERVICE INTERRUPTION DETAIL" na="ut_na" />
              <Cell w={100}>
                <Txt k="utilityType" label="Type:" />
              </Cell>
            </div>
            {/* 9 */}
            <div className="iir-row iir-avoid">
              <Bar no="9" title="INCIDENT DETAIL" />
              <Cell w={47}>
                <Sel k="processCause" label="Process/Condition Cause:" options={PROCESS_CAUSE} />
              </Cell>
              <Cell w={53}>
                <Txt k="activity" label="Activity in Progress:" />
              </Cell>
              <Cell w={47}>
                <Sel k="actionCause" label="Action Cause:" options={ACTION_CAUSE} />
              </Cell>
              <Cell w={53}>
                <Sel k="objectCause" label="Object Cause:" options={OBJECT_CAUSE} />
              </Cell>
              <Cell w={47}>
                <Sel k="impactEnergy" label="Impact Energy:" options={IMPACT_ENERGY} />
              </Cell>
              <Cell w={53}>
                <Chk k="behaviour" label="Behaviour" />
                <Chk k="condition" label="Condition" />
                <Chk k="environment" label="Environment" />
              </Cell>
            </div>
            {/* 10 */}
            <div className="iir-row iir-avoid">
              <Bar no="10" title="TOTAL LOSS POTENTIAL (Maximum Reasonable Outcome)" />
              <Cell w={52}>
                <div style={{ display: "grid", gap: 3 }}>
                  <Sel k="severityLevel" label="Potential Severity Level:" options={SEVERITY_LEVEL} />
                  <Sel k="impactType" label="Impact Type:" options={IMPACT_TYPE} />
                </div>
              </Cell>
              <Cell w={48}>
                <Sel k="riskProbability" label="Risk Probability:" options={RISK_PROBABILITY} />
              </Cell>
              <Cell w={100}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/templates/iir-risk-matrix.png" alt="Risk matrix" style={{ width: "100%", maxWidth: 420 }} />
                  <div style={{ flex: "1 1 180px", textAlign: "center" }}>
                    <div style={{ fontSize: 11 }}>
                      Total Loss Potential =<br />
                      Severity Level <b>x</b> Risk Probability
                    </div>
                    <div style={{ marginTop: 14, fontWeight: 700 }}>TOTAL LOSS POTENTIAL:</div>
                    <div
                      style={{
                        marginTop: 4,
                        display: "inline-block",
                        minWidth: 140,
                        padding: "2px 8px",
                        borderRadius: 3,
                        fontWeight: 700,
                        background: tone === "high" ? "#FF0000" : tone === "medium" ? "#FFFF00" : tone === "low" ? "#00FF00" : "transparent",
                        color: tone === "high" ? "#fff" : "#000",
                      }}
                    >
                      {edit ? (
                        <select className="iir-in" value={d.tlp} onChange={(e) => setData({ tlp: e.target.value })} style={{ background: "transparent", fontWeight: 700 }}>
                          <option value="">Choose an item.</option>
                          {TOTAL_LOSS_POTENTIAL.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      ) : (
                        d.tlp
                      )}
                    </div>
                  </div>
                </div>
              </Cell>
            </div>
            {/* 11 */}
            <div className="iir-row">
              <Bar
                no="11"
                title={
                  <>
                    CAUSAL ANALYSIS (Refer to <u>Causal Factor Checklist</u>)
                  </>
                }
              />
              <Cell w={30}>
                <b>Causal/Contributory Factors:</b>
                <div style={{ fontSize: 10.5 }}>(Specify casual factor #)</div>
                <Txt k="causalFactors" rows={3} />
              </Cell>
              <Cell w={70}>
                <div style={{ fontSize: 11 }}>Discussion of Causal Analysis (use facts only to support conclusions and determination of causal factors):</div>
                <Txt k="causalDiscussion" rows={3} />
              </Cell>
              <Cell w={100}>
                <Txt k="rootCause" label="Root Cause:" rows={2} />
              </Cell>
              <Cell w={100}>
                <span style={{ color: "#C00000", fontWeight: 700 }}>
                  <Chk k="noLsr" label="No Life Saving Rules Violation" />
                </span>
                <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ color: "#C00000", fontWeight: 700 }}>
                    <Chk k="lsrViolation" label="Life Saving Rule Violation:" />
                  </span>
                  <span style={{ minWidth: 200 }}>
                    <Sel k="lsrRule" options={LIFE_SAVING_RULES} />
                  </span>
                </span>
              </Cell>
            </div>
            {/* 12 */}
            <div className="iir-row">
              <Bar no="12" title="CORRECTIVE ACTIONS" />
            </div>
            <div className="iir-row iir-hdr" style={{ fontWeight: 700, textAlign: "center" }}>
              <Cell w={32}>Action</Cell>
              <Cell w={20}>Hierarchy of Control</Cell>
              <Cell w={18}>Responsible person</Cell>
              <Cell w={15}>Due Date</Cell>
              <Cell w={15}>Completed Date</Cell>
            </div>
            {d.actions.map((a, i) => (
              <div className="iir-row iir-avoid iir-act" key={i}>
                <Cell w={32}>{aCell(i, "action")}</Cell>
                <Cell w={20} style={{ textAlign: "center" }}>
                  <span className="iir-ml" style={{ textAlign: "start" }}>
                    Hierarchy of Control
                  </span>
                  {edit ? (
                    <select className="iir-in" value={a.hierarchy} onChange={(e) => setAction(i, { hierarchy: e.target.value })}>
                      <option value="">Choose an item.</option>
                      {HIERARCHY.map((h) => (
                        <option key={h}>{h}</option>
                      ))}
                    </select>
                  ) : (
                    a.hierarchy
                  )}
                </Cell>
                <Cell w={18}>{aCell(i, "responsible")}</Cell>
                <Cell w={15}>{aCell(i, "due", "date")}</Cell>
                <Cell w={15}>{aCell(i, "completed", "date")}</Cell>
              </div>
            ))}
            {/* 13 */}
            <div className="iir-row iir-avoid">
              <Bar no="13" title="REPORT SIGN OFF" />
              {(
                [
                  ["Completed By – HSE Manager / Lead", "hseName", "hse", "hseDate"],
                  ["Responsible Project Manager / Director", "pmName", "pm", "pmDate"],
                ] as const
              ).map(([title, nameK, sigK, dateK]) => (
                <div className="iir-row" key={sigK} style={{ width: "100%" }}>
                  <Cell w={50}>
                    <b>{title}</b>
                    <div style={{ marginTop: 12 }}>
                      <Txt k={nameK} label="Name:" />
                    </div>
                  </Cell>
                  <Cell w={30}>
                    <b>Signature:</b>
                    {edit ? (
                      <div style={{ marginTop: 2 }}>
                        <SignaturePad label="" value={report.signatures[sigK]} onChange={(v) => set({ signatures: { ...report.signatures, [sigK]: v } })} />
                      </div>
                    ) : report.signatures[sigK] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={report.signatures[sigK]} alt="Signature" style={{ height: 54, maxWidth: "100%", objectFit: "contain", display: "block" }} />
                    ) : (
                      <div style={{ height: 54 }} />
                    )}
                  </Cell>
                  <Cell w={20}>
                    <Txt k={dateK} label="Date:" type="date" />
                  </Cell>
                </div>
              ))}
            </div>
            {/* 14 */}
            <div className="iir-row iir-avoid">
              <Bar no="14" title="ATTACHMENTS (Supporting Documentation as necessary)" />
              <Cell w={100}>
                <Chk k="att_starrt" label="STARRT Card/s" />
                <Chk k="att_witness" label="Witness Statement/s" />
                <Chk k="att_permit" label="Permit/s" />
                <Chk k="att_equipment" label="Equipment Specs" />
                <Chk k="att_training" label="Training / TBT" />
              </Cell>
              <Cell w={100}>
                <Txt k="attOther" label="Other:" />
              </Cell>
            </div>
          </div>
        </section>

        {/* ================= 16. PHOTO INFORMATION SHEET ================= */}
        {report.photos.map((p, i) => (
          <section key={i} className={`iir-page ${i % 2 === 0 ? "iir-pb" : ""}`} style={{ marginTop: edit ? 28 : 0 }}>
            <div className="iir-tbl iir-avoid">
              {i % 2 === 0 && (
                <div className="iir-row">
                  <Bar
                    no="16"
                    title={
                      <>
                        PHOTO INFORMATION SHEET (Refer to <u>Additional Photos</u> - if required)
                      </>
                    }
                  />
                </div>
              )}
              <div className="iir-row">
                <Cell w={35} style={{ padding: 0 }}>
                  {(
                    [
                      ["no", "Photo No:", "text"],
                      ["date", "Photo Date:", "date"],
                      ["time", "Time of Day:", "time"],
                      ["location", "Location:", "text"],
                    ] as const
                  ).map(([k, l, t]) => (
                    <div key={k} style={{ borderBottom: "1px solid #000", padding: "2px 5px" }}>
                      {pCell(i, k, l, t)}
                    </div>
                  ))}
                  <div style={{ borderBottom: "1px solid #000", padding: "2px 5px", textAlign: "center", fontWeight: 700, fontSize: 11 }}>Brief Description:</div>
                  <div style={{ borderBottom: "1px solid #000", padding: "4px 5px", minHeight: 90 }}>
                    {edit ? (
                      <textarea className="iir-in" rows={4} value={p.description} onChange={(e) => setPhoto(i, { description: e.target.value })} />
                    ) : (
                      <div style={{ whiteSpace: "pre-wrap" }}>{p.description}</div>
                    )}
                  </div>
                  <div style={{ borderBottom: "1px solid #000", padding: "2px 5px", minHeight: 60 }}>{pCell(i, "notes", "Notes:")}</div>
                  <div style={{ padding: "2px 5px", minHeight: 60 }}>{pCell(i, "photographer", "Photographer:")}</div>
                </Cell>
                <Cell w={65} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 10 }}>
                  <div style={{ width: "100%" }}>
                    <PhotoBox src={p.image} onChange={(v) => setPhoto(i, { image: v })} height={edit ? 260 : 300} label={`Add photo ${i + 1}`} />
                    {edit && report.photos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => set({ photos: report.photos.filter((_, j) => j !== i) })}
                        style={{ marginTop: 6, color: "#b91c1c", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        <Trash2 size={13} /> Remove this photo block
                      </button>
                    )}
                  </div>
                </Cell>
              </div>
            </div>
          </section>
        ))}
        {edit && (
          <button
            type="button"
            onClick={() => set({ photos: [...report.photos, emptyPhoto()] })}
            style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, border: `1px dashed ${ORANGE}`, color: ORANGE, borderRadius: 8, padding: "6px 12px", fontWeight: 700 }}
          >
            <Plus size={16} /> Add photo
          </button>
        )}

        {/* ================= WITNESS STATEMENT ================= */}
        <section className="iir-page iir-pb" style={{ marginTop: edit ? 28 : 0 }}>
          <div style={{ textAlign: "center", fontWeight: 700, margin: "4px 0 8px" }}>Witness Statement</div>
          <div className="iir-tbl">
            <div className="iir-row">
              <Bar no="16" title="Employee Interview (to be completed by Investigator)" />
              {(
                [
                  ["wProject", "Project Name:", "text"],
                  ["wProjectNumber", "Project Number:", "text"],
                  ["wDate", "Date of Incident:", "date"],
                  ["wTime", "Time of Incident:", "time"],
                  ["wEmployee", "Name of Employee:", "text"],
                  ["wPosition", "Position:", "text"],
                  ["wId", "ID Number:", "text"],
                  [null, "", "text"],
                  ["wSupervisor", "Supervisor Name:", "text"],
                  ["wSupervisorPosition", "Supervisor Position:", "text"],
                  ["wInterviewer", "Name of Interviewer:", "text"],
                  ["wPrepDate", "Date of Preparation:", "date"],
                ] as const
              ).map(([k, l, t], i) => (
                <Cell w={50} key={i} style={{ padding: "2px 5px" }}>
                  {k ? <Txt k={k} label={l} type={t} list={k === "wProject" ? "iir-projects" : undefined} /> : <span>&nbsp;</span>}
                </Cell>
              ))}
              <Bar no="17" title="Employee Involvement/Description of Incident" />
              <Cell w={100} style={{ minHeight: edit ? 0 : 640 }}>
                <Txt k="involvement" rows={edit ? 10 : 30} />
              </Cell>
            </div>
          </div>
        </section>
      </div>
    </SheetCtx.Provider>
  );
}
