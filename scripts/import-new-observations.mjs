// Import SharePoint observations created after the last imported one, and
// fill observations.sharepoint_id from the downloaded photo file names so the
// photo upload script can link photos to them.
//
//   node scripts/import-new-observations.mjs --dry-run   # counts only, no writes
//   node scripts/import-new-observations.mjs             # import + link IDs
//
// Reads sp-photos/observations.csv (SharePoint list export) and every photo
// under sp-photos/. A photo file is named <SharePointID>_Reserved_..._[<hash>]...,
// and the CSV's photo columns carry the same <hash>, which gives each CSV row
// its SharePoint ID. Safe to re-run: rows already in the database are skipped.
//
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const PHOTO_DIR = join(ROOT, "sp-photos");
const CSV_PATH = join(PHOTO_DIR, "observations.csv");
const DRY_RUN = process.argv.includes("--dry-run");
// Rows from this date on get their sharepoint_id filled if it's missing.
const LINK_FROM = "2026-08-28T00:00:00Z";

const PROJECTS = {
  "OCEANARIUM": "Oceanarium",
  "AL-ARAB-HOSPITAL": "Al-Arab Hospital",
  "AL-Madinah": "Al-Madinah",
  "Al Qiddiya Hotels": "Al-Qiddya Hotels",
};
const TYPES = { "Mobile equipment, Personnel interface": "Mobile equipment personnel Interference MEPI" };

function loadEnv() {
  const env = {};
  for (const line of readFileSync(join(ROOT, ".env.local"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows;
  const keys = head.map((h) => h.replace(/^﻿/, ""));
  return body.filter((r) => r.length > 1).map((r) => Object.fromEntries(keys.map((k, i) => [k, r[i] ?? ""])));
}

// "11/2/2026 5:46 AM" (stored as UTC, like the earlier import) -> ISO string
function toIso(s) {
  const m = s.match(/^(\d+)\/(\d+)\/(\d{4}) (\d+):(\d+) (AM|PM)$/);
  if (!m) return null;
  let h = Number(m[4]) % 12;
  if (m[6] === "PM") h += 12;
  return new Date(Date.UTC(+m[3], +m[1] - 1, +m[2], h, +m[5])).toISOString();
}

const minuteKey = (iso) => iso.slice(0, 16);
const detailsKey = (s) => (s || "").replace(/\s+/g, " ").trim().slice(0, 60).toLowerCase();

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [e.name]
  );
}

async function fetchAll(build) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await build().range(from, from + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// 1. Photo hash -> SharePoint ID, from the downloaded file names.
const hashToId = new Map();
for (const name of walk(PHOTO_DIR)) {
  const m = name.match(/^(\d+)_Reserved_ImageAttachment_.*?\[([0-9a-f]{32})\]/);
  if (m) hashToId.set(m[2], Number(m[1]));
}
const idFor = (row) => {
  for (const col of ["Observation Photo", "Close-out Photo"]) {
    const m = (row[col] || "").match(/\[([0-9a-f]{32})\]/);
    if (m && hashToId.has(m[1])) return hashToId.get(m[1]);
  }
  return null;
};

// 2. CSV rows.
const csv = parseCsv(readFileSync(CSV_PATH, "utf8"))
  .map((r) => ({ ...r, iso: toIso(r["Created"]), spId: idFor(r) }))
  .filter((r) => r.iso);

// 3. What's in the database already.
const { data: last, error: lastErr } = await supabase
  .from("observations")
  .select("created_at")
  .not("source_report_group", "is", null)
  .order("created_at", { ascending: false })
  .limit(1);
if (lastErr) throw lastErr;
const lastImported = last[0].created_at;
const existing = await fetchAll(() =>
  supabase
    .from("observations")
    .select("id, created_at, observation_details, sharepoint_id")
    .gte("created_at", LINK_FROM)
);
const usedIds = new Set(
  (await fetchAll(() => supabase.from("observations").select("sharepoint_id").not("sharepoint_id", "is", null))).map(
    (r) => r.sharepoint_id
  )
);

// 4. New rows to insert (oldest first, so report numbers follow date order).
const lastMinute = minuteKey(new Date(lastImported).toISOString());
const existingKeys = new Set(existing.map((o) => minuteKey(new Date(o.created_at).toISOString()) + "|" + detailsKey(o.observation_details)));
const toInsert = csv
  .filter((r) => minuteKey(r.iso) > lastMinute)
  .filter((r) => !existingKeys.has(minuteKey(r.iso) + "|" + detailsKey(r["Observation Details"])))
  .sort((a, b) => a.iso.localeCompare(b.iso))
  .map((r) => {
    const spId = r.spId && !usedIds.has(r.spId) ? r.spId : null;
    if (spId) usedIds.add(spId);
    const type = TYPES[r["Observation Type"]] ?? r["Observation Type"];
    return {
      project_name: PROJECTS[r["Project Name"]] ?? r["Project Name"],
      observation_type: type,
      observation_type_other: r["Observation Type If Other"] || null,
      observation_details: r["Observation Details"] || "",
      classification: r["Classification"],
      risk_rating: r["Risk Rating"],
      close_out_details: r["Close-out Details"] || "",
      status: r["Status"] || "Open",
      inspected_by: r["Inspected By%23ID"] || "",
      created_at: r.iso,
      updated_at: toIso(r["Modified"]) ?? r.iso,
      source_report_group: r["ReportNumber"] || null,
      source_created_by: r["Created By"] || null,
      source_modified_by: r["Modified By"] || null,
      sharepoint_id: spId,
    };
  });

// 5. Existing rows (from LINK_FROM on) still missing their SharePoint ID.
const csvByKey = new Map();
for (const r of csv) {
  if (!r.spId) continue;
  const k = minuteKey(r.iso) + "|" + detailsKey(r["Observation Details"]);
  csvByKey.set(k, csvByKey.has(k) ? null : r.spId); // null = ambiguous
}
const toLink = [];
let ambiguous = 0;
for (const o of existing) {
  if (o.sharepoint_id) continue;
  const id = csvByKey.get(minuteKey(new Date(o.created_at).toISOString()) + "|" + detailsKey(o.observation_details));
  if (id === null) ambiguous++;
  else if (id && !usedIds.has(id)) { usedIds.add(id); toLink.push({ id: o.id, sharepoint_id: id }); }
}

console.log(`Photo files with a SharePoint ID: ${hashToId.size}`);
console.log(`Last imported observation: ${lastImported}`);
console.log(`New observations to import: ${toInsert.length} (${toInsert.filter((r) => r.sharepoint_id).length} with photos found)`);
if (toInsert.length) console.log(`  from ${toInsert[0].created_at} to ${toInsert.at(-1).created_at}`);
console.log(`Existing observations to link to their SharePoint ID: ${toLink.length}${ambiguous ? ` (${ambiguous} ambiguous, skipped)` : ""}`);

if (DRY_RUN) {
  console.log("Dry run: nothing written.");
  process.exit(0);
}

for (let i = 0; i < toInsert.length; i += 200) {
  const { error } = await supabase.from("observations").insert(toInsert.slice(i, i + 200));
  if (error) throw error;
  console.log(`Imported ${Math.min(i + 200, toInsert.length)}/${toInsert.length}`);
}
for (const [i, l] of toLink.entries()) {
  const { error } = await supabase.from("observations").update({ sharepoint_id: l.sharepoint_id }).eq("id", l.id);
  if (error) throw error;
  if ((i + 1) % 100 === 0) console.log(`Linked ${i + 1}/${toLink.length}`);
}
console.log("Done.");
