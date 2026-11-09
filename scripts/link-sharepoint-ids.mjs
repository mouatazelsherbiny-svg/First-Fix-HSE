// Fill observations.sharepoint_id from the SharePoint export, so the photo
// upload script can link the newer SharePoint photos to their observations.
//
//   node scripts/link-sharepoint-ids.mjs --dry-run   # report only, no writes
//   node scripts/link-sharepoint-ids.mjs             # write sharepoint_id
//
// How it matches:
//   * Each photo file in sp-photos/ is named <SharePointID>_..._[<guid>]...
//   * The export (Claude outputs/observations-sharepoint.csv) lists the same
//     photo names (without the ID) on each observation row, so the guid tells
//     us which SharePoint ID a row has.
//   * The row is then found in the app by its Created time (to the minute),
//     confirmed by the start of the Observation Details (and the project when
//     two rows share a minute).
// Only observations with no sharepoint_id yet are touched. Safe to re-run.
//
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const PHOTO_DIR = join(ROOT, "sp-photos");
const CSV_PATH = join(ROOT, "Claude outputs", "observations-sharepoint.csv");
const DRY_RUN = process.argv.includes("--dry-run");
const CONCURRENCY = 8;

function loadEnv() {
  const env = {};
  for (const line of readFileSync(join(ROOT, ".env.local"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function walkNames(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walkNames(join(dir, e.name)) : [e.name]));
}

/** Minimal CSV parser (quoted fields, doubled quotes, newlines inside quotes). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** "11/2/2026 5:47 AM" → "2026-11-02T05:47" (the app stored these times as UTC). */
function minuteKey(s) {
  const m = String(s).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let h = Number(m[4]) % 12;
  if (m[6].toUpperCase() === "PM") h += 12;
  const p = (n) => String(n).padStart(2, "0");
  return `${m[3]}-${p(m[1])}-${p(m[2])}T${p(h)}:${m[5]}`;
}
const dbMinute = (iso) => new Date(iso).toISOString().slice(0, 16);
const norm = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
const detailsKey = (s) => norm(s).slice(0, 60);

async function fetchAll(supabase) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("observations")
      .select("id, created_at, project_name, observation_details, sharepoint_id")
      .order("id")
      .range(from, from + 999);
    if (error) throw error;
    out.push(...data);
    if (data.length < 1000) return out;
  }
}

async function main() {
  // 1. guid → SharePoint ID, from the photo file names.
  const guidToSp = new Map();
  for (const name of walkNames(PHOTO_DIR)) {
    const m = name.match(/^(\d+)_.*?\[([0-9a-f]{32})\]/);
    if (m) guidToSp.set(m[2], Number(m[1]));
  }

  // 2. SharePoint ID for each export row that has photos.
  const [header, ...rows] = parseCsv(readFileSync(CSV_PATH, "utf8").replace(/^﻿/, ""));
  const col = (name) => header.indexOf(name);
  const iObs = col("Observation Photo"), iClose = col("Close-out Photo"), iCreated = col("Created");
  const iProject = col("Project Name"), iDetails = col("Observation Details");
  const wanted = []; // { sp, minute, project, details }
  for (const r of rows) {
    if (r.length < header.length) continue;
    const guids = `${r[iObs]} ${r[iClose]}`.match(/[0-9a-f]{32}/g) ?? [];
    const sps = new Set(guids.map((g) => guidToSp.get(g)).filter(Boolean));
    if (sps.size !== 1) continue;
    wanted.push({ sp: [...sps][0], minute: minuteKey(r[iCreated]), project: norm(r[iProject]), details: detailsKey(r[iDetails]) });
  }

  // 3. Find each one in the app.
  const env = loadEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const observations = await fetchAll(supabase);
  const usedSp = new Set(observations.filter((o) => o.sharepoint_id != null).map((o) => o.sharepoint_id));
  const byMinute = new Map();
  for (const o of observations) {
    const k = dbMinute(o.created_at);
    if (!byMinute.has(k)) byMinute.set(k, []);
    byMinute.get(k).push(o);
  }

  const updates = [];
  const taken = new Set();
  let already = 0, notFound = 0, ambiguous = 0;
  for (const w of wanted) {
    if (usedSp.has(w.sp)) {
      already++;
      continue;
    }
    let cands = (byMinute.get(w.minute) ?? []).filter((o) => o.sharepoint_id == null && !taken.has(o.id));
    if (cands.length > 1) cands = cands.filter((o) => detailsKey(o.observation_details) === w.details);
    if (cands.length > 1) cands = cands.filter((o) => norm(o.project_name).includes(w.project.slice(0, 4)));
    if (cands.length === 1 && (detailsKey(cands[0].observation_details) === w.details || !w.details)) {
      updates.push({ id: cands[0].id, sp: w.sp });
      taken.add(cands[0].id);
    } else if (cands.length === 0) notFound++;
    else ambiguous++;
  }

  console.log(`Photo files read:                 ${guidToSp.size}`);
  console.log(`Export rows with photos:          ${wanted.length}`);
  console.log(`  already linked (skipped):       ${already}`);
  console.log(`  matched, will set sharepoint_id: ${updates.length}`);
  console.log(`  not found in the app:           ${notFound}`);
  console.log(`  unclear (skipped):              ${ambiguous}`);
  if (DRY_RUN) {
    console.log("\nDry run — nothing written.");
    return;
  }

  let done = 0, failed = 0;
  const queue = [...updates];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) {
        const u = queue.shift();
        const { error } = await supabase.from("observations").update({ sharepoint_id: u.sp }).eq("id", u.id).is("sharepoint_id", null);
        if (error) {
          failed++;
          console.log(`  failed ${u.id} → ${u.sp}: ${error.message}`);
        } else done++;
      }
    })
  );
  console.log(`\nWrote sharepoint_id on ${done} observations (${failed} failed).`);
  console.log("Next: node scripts/upload-observation-photos.mjs");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
