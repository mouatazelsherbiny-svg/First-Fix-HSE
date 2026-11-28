// Import HSE Passport training records from the "All Employee Training
// Records" Excel (already converted to "Claude outputs/training_import.json").
//
//   node scripts/import-training.mjs --dry-run   # counts only, no writes
//   node scripts/import-training.mjs             # import
//
// 1. Adds every person in the file who is not in the employees table yet
//    (matched by employee_code; existing employees are never changed).
// 2. Adds the training records, one row per employee + course + date.
//    A record that is already in the database is skipped (unique index
//    hse_training_records_emp_course_date_key), so it is safe to re-run.
//
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const DATA_PATH = join(ROOT, "Claude outputs", "training_import.json");
const DRY_RUN = process.argv.includes("--dry-run");
const BATCH = 1000;

function loadEnv() {
  const env = {};
  for (const line of readFileSync(join(ROOT, ".env.local"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));
console.log(`File: ${data.employees.length} people, ${data.training.length} training records`);

async function withRetry(label, fn) {
  for (let attempt = 1; ; attempt++) {
    const { data: d, error } = await fn();
    if (!error) return d;
    if (attempt >= 4) throw new Error(`${label}: ${error.message}`);
    console.log(`  ${label} failed (${error.message}) — retrying…`);
    await new Promise((r) => setTimeout(r, 2000 * attempt));
  }
}

async function loadEmployeeIds() {
  const map = new Map();
  for (let from = 0; ; from += BATCH) {
    const rows = await withRetry("read employees", () =>
      supabase.from("employees").select("id, employee_code").order("employee_code").range(from, from + BATCH - 1)
    );
    for (const r of rows) map.set(String(r.employee_code), r.id);
    if (rows.length < BATCH) break;
  }
  return map;
}

let ids = await loadEmployeeIds();
console.log(`Database: ${ids.size} employees before import`);

const missing = data.employees.filter((e) => !ids.has(e.code));
console.log(`New employees to add: ${missing.length}`);

if (DRY_RUN) {
  console.log("Dry run — nothing written.");
  process.exit(0);
}

for (let i = 0; i < missing.length; i += BATCH) {
  const chunk = missing.slice(i, i + BATCH).map((e) => ({
    employee_code: e.code,
    name: e.name,
    project: e.project || null,
    department: e.department || null,
  }));
  await withRetry("add employees", () =>
    supabase.from("employees").upsert(chunk, { onConflict: "employee_code", ignoreDuplicates: true })
  );
  process.stdout.write(`\r  employees ${Math.min(i + BATCH, missing.length)}/${missing.length}`);
}
if (missing.length) console.log("");

ids = await loadEmployeeIds();
console.log(`Database: ${ids.size} employees after import`);

const rows = [];
let noEmployee = 0;
for (const [code, course, date, hours] of data.training) {
  const employee_id = ids.get(code);
  if (!employee_id) { noEmployee++; continue; }
  rows.push({ employee_id, course_name: course, date, status: "Valid", hours, attachments: [] });
}
if (noEmployee) console.log(`Skipped ${noEmployee} records with no matching employee`);

for (let i = 0; i < rows.length; i += BATCH) {
  await withRetry("add training", () =>
    supabase
      .from("hse_training_records")
      .upsert(rows.slice(i, i + BATCH), { onConflict: "employee_id,course_name,date", ignoreDuplicates: true })
  );
  process.stdout.write(`\r  training ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
}
console.log("");

const { count } = await supabase.from("hse_training_records").select("id", { count: "exact", head: true });
console.log(`Done. hse_training_records now has ${count} rows.`);
