// Upload SharePoint observation photos to Supabase Storage and link them to
// observations via observations.sharepoint_id.
//
//   node scripts/upload-observation-photos.mjs --dry-run   # counts only, no writes
//   node scripts/upload-observation-photos.mjs             # upload + link
//
// Reads every image under sp-photos/ (recursively). File names look like
//   <SharePointItemID>_Reserved_ImageAttachment_..._[<FieldName>]...
// where FieldName is ObservationPhoto or Close_x002d_outPhoto. Identical files
// (same bytes, e.g. Windows " (1)" copies or one photo attached to two items)
// are uploaded once, as sharepoint/<sha256>.jpg, and linked to every record
// that uses them. Each image also gets a small square thumbnail at
// sharepoint-thumbs/<sha256>.jpg (same hash, so the app derives the thumbnail
// path from storage_path). Safe to re-run: existing objects and links are skipped.
//
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.

import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const PHOTO_DIR = join(ROOT, "sp-photos");
const BUCKET = "observation-photos";
const PREFIX = "sharepoint";
const THUMB_PREFIX = "sharepoint-thumbs";
const MAX_WIDTH = 1600;
const JPEG_QUALITY = 82;
const THUMB_SIZE = 160; // shown at ~44px in the list; 160 keeps it sharp on high-DPI screens
const THUMB_QUALITY = 72;
const CONCURRENCY = 6;
const DRY_RUN = process.argv.includes("--dry-run");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tif", ".tiff", ".heic", ".heif"]);
const FIELD_TO_TYPE = { ObservationPhoto: "observation", Close_x002d_outPhoto: "close_out" };
const NAME_PATTERN = /^(\d+)_Reserved_ImageAttachment_.*?\[(ObservationPhoto|Close_x002d_outPhoto)\]/;
// Extra attachments whose names don't carry a field name, classified by hand.
const MANUAL_PHOTOS = {
  "20077_WhatsApp Image 2026-09-06 at 10.43.33 AM.jpeg": { spId: 20077, photoType: "observation" },
};

function loadEnv() {
  const env = {};
  for (const line of readFileSync(join(ROOT, ".env.local"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase()) ? [path] : [];
  });
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

const thumbPathFor = (path) => path.replace(`${PREFIX}/`, `${THUMB_PREFIX}/`);

async function listStoredPaths(supabase, prefix) {
  const paths = new Set();
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 1000, offset });
    if (error) throw error;
    data.filter((o) => o.id).forEach((o) => paths.add(`${prefix}/${o.name}`)); // skip folder entries
    if (data.length < 1000) return paths;
  }
}

async function uploadJpeg(supabase, path, body) {
  const { error } = await supabase.storage.from(BUCKET).upload(path, body, { contentType: "image/jpeg", upsert: false });
  if (error && !/exists/i.test(error.message)) throw error;
}

async function runPool(items, worker) {
  let next = 0;
  let done = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < items.length) {
        const item = items[next++];
        await worker(item);
        if (++done % 100 === 0 || done === items.length) console.log(`  ${done}/${items.length}`);
      }
    })
  );
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  // 1. Local photos: parse names, hash contents.
  const files = walk(PHOTO_DIR);
  const unparsed = [];
  const photos = []; // { file, spId, photoType, path }
  for (const file of files) {
    const name = file.split(/[\\/]/).pop();
    const m = name.match(NAME_PATTERN);
    const parsed = m ? { spId: Number(m[1]), photoType: FIELD_TO_TYPE[m[2]] } : MANUAL_PHOTOS[name];
    if (!parsed) {
      unparsed.push(relative(PHOTO_DIR, file));
      continue;
    }
    const hash = createHash("sha256").update(readFileSync(file)).digest("hex");
    photos.push({ file, ...parsed, path: `${PREFIX}/${hash}.jpg` });
  }

  // 2. Match to observations by sharepoint_id.
  const observations = await fetchAll(() =>
    supabase.from("observations").select("id, sharepoint_id").not("sharepoint_id", "is", null).order("sharepoint_id")
  );
  const obsBySpId = new Map(observations.map((o) => [o.sharepoint_id, o.id]));
  const matched = photos.filter((p) => obsBySpId.has(p.spId));
  const unmatched = photos.filter((p) => !obsBySpId.has(p.spId));

  // 3. Work out what is already done.
  const stored = await listStoredPaths(supabase, PREFIX);
  const storedThumbs = await listStoredPaths(supabase, THUMB_PREFIX);
  const existingLinks = await fetchAll(() =>
    supabase.from("observation_photos").select("observation_id, photo_type, storage_path").order("id")
  );
  const linkKey = (obsId, type, path) => `${obsId}|${type}|${path}`;
  const linked = new Set(existingLinks.map((l) => linkKey(l.observation_id, l.photo_type, l.storage_path)));

  const uniqueByPath = new Map();
  for (const p of matched) if (!uniqueByPath.has(p.path)) uniqueByPath.set(p.path, p.file);
  const toUpload = [...uniqueByPath].filter(([path]) => !stored.has(path));
  const toThumb = [...uniqueByPath].filter(([path]) => !storedThumbs.has(thumbPathFor(path)));

  const links = new Map();
  for (const p of matched) {
    const obsId = obsBySpId.get(p.spId);
    const key = linkKey(obsId, p.photoType, p.path);
    if (!linked.has(key)) links.set(key, { observation_id: obsId, photo_type: p.photoType, storage_path: p.path });
  }
  const toLink = [...links.values()];

  const matchedObs = new Set(matched.map((p) => p.spId));
  console.log(`Image files found:               ${files.length}`);
  console.log(`  name not recognised:           ${unparsed.length}`);
  console.log(`  matched to an observation:     ${matched.length} (${matchedObs.size} observations)`);
  console.log(`  no observation with that SP ID: ${unmatched.length}`);
  console.log(`Unique images among matched:     ${uniqueByPath.size}`);
  console.log(`  already in storage:            ${uniqueByPath.size - toUpload.length}`);
  console.log(`  to upload:                     ${toUpload.length}`);
  console.log(`Thumbnails (${THUMB_SIZE}px) to create:    ${toThumb.length} (already in storage: ${uniqueByPath.size - toThumb.length})`);
  console.log(`Photo links to create:           ${toLink.length} (already linked: ${linked.size})`);

  if (DRY_RUN) {
    printUnmatched(unparsed, unmatched);
    console.log("\nDry run — nothing uploaded or linked.");
    return;
  }

  // 4. Resize + upload unique images.
  const failed = [];
  console.log(`\nUploading ${toUpload.length} images...`);
  await runPool(toUpload, async ([path, file]) => {
    try {
      const body = await sharp(readFileSync(file))
        .rotate()
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
        .toBuffer();
      await uploadJpeg(supabase, path, body);
    } catch (e) {
      failed.push({ path, file: relative(PHOTO_DIR, file), error: String(e.message ?? e) });
    }
  });

  // 4b. Square thumbnails for the list page (the app falls back to the full image without one).
  const failedThumbs = [];
  console.log(`
Creating ${toThumb.length} thumbnails...`);
  await runPool(toThumb, async ([path, file]) => {
    try {
      const body = await sharp(readFileSync(file))
        .rotate()
        .resize({ width: THUMB_SIZE, height: THUMB_SIZE, fit: "cover" })
        .jpeg({ quality: THUMB_QUALITY, mozjpeg: true })
        .toBuffer();
      await uploadJpeg(supabase, thumbPathFor(path), body);
    } catch (e) {
      failedThumbs.push({ file: relative(PHOTO_DIR, file), error: String(e.message ?? e) });
    }
  });

  // 5. Link photos to observations (only for objects that made it into storage).
  const failedPaths = new Set(failed.map((f) => f.path));
  const linkable = toLink.filter((l) => !failedPaths.has(l.storage_path));
  console.log(`\nLinking ${linkable.length} photos...`);
  let linkedNow = 0;
  for (let i = 0; i < linkable.length; i += 500) {
    const batch = linkable.slice(i, i + 500);
    const { error } = await supabase
      .from("observation_photos")
      .upsert(batch, { onConflict: "observation_id,photo_type,storage_path", ignoreDuplicates: true });
    if (error) throw error;
    linkedNow += batch.length;
  }

  console.log("\n===== Summary =====");
  console.log(`Matched photos:   ${matched.length} (${matchedObs.size} observations)`);
  console.log(`Unmatched photos: ${unparsed.length + unmatched.length}`);
  console.log(`Uploaded:         ${toUpload.length - failed.length} new images (${uniqueByPath.size - toUpload.length} already in storage)`);
  console.log(`Linked:           ${linkedNow} new links (${linked.size} already linked)`);
  console.log(`Thumbnails:       ${toThumb.length - failedThumbs.length} new (${uniqueByPath.size - toThumb.length} already in storage)`);
  console.log(`Failed uploads:   ${failed.length}`);
  failed.forEach((f) => console.log(`  ${f.file}: ${f.error}`));
  console.log(`Failed thumbnails: ${failedThumbs.length}`);
  failedThumbs.forEach((f) => console.log(`  ${f.file}: ${f.error}`));
  printUnmatched(unparsed, unmatched);
}

function printUnmatched(unparsed, unmatched) {
  if (!unparsed.length && !unmatched.length) return;
  console.log("\nUnmatched photos:");
  unparsed.forEach((f) => console.log(`  [name not recognised] ${f}`));
  unmatched.forEach((p) => console.log(`  [no observation for SP ${p.spId}] ${relative(PHOTO_DIR, p.file)}`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
