/**
 * Uploads the hotel's own photographs into Sanity and attaches them to the
 * rooms and to the home page hero.
 *
 *   node scripts/upload-room-photos.mjs [--dry-run]
 *
 * They go into Sanity rather than into /public on purpose. The asset CDN then
 * resizes and re-encodes on delivery, so one high-quality upload is served as
 * a small WebP at whatever width the page actually asks for, and the hotel can
 * swap any picture from Studio afterwards without a deploy.
 *
 * Re-running is safe: Sanity keys assets by content hash, so the same file
 * uploaded twice is stored once.
 */
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const PROJECT = "9225tb8w";
const DATASET = "production";
const DRY = process.argv.includes("--dry-run");

/**
 * Which photograph belongs to which room, as the hotel assigned them.
 *
 * Every room carries its own picture and no picture is used twice. The Hall
 * has not been photographed and keeps its drawn foil panel rather than
 * borrowing a bedroom's: showing one room's photograph on another is the kind
 * of thing a guest discovers at check-in.
 */
const ROOMS = [
  { id: "room-bliss-standard", cover: "bliss-standard", gallery: [] },
  { id: "room-bliss-superior", cover: "bliss-superior", gallery: [] },
  { id: "room-bliss-executive-luxury", cover: "bliss-superior-2", gallery: [] },
  { id: "room-bliss-luxury", cover: "bliss-luxury", gallery: ["bliss-hero"] },
  { id: "room-bliss-presidential-suite", cover: "bliss-classic-presidential-lounge", gallery: [] },
  { id: "room-bliss-classic-presidential-suite", cover: "bliss-classic-presidential", gallery: [] },
];

/** The home page masthead. */
const HERO = "bliss-hero";

const ALT = {
  "bliss-standard": "The Bliss Standard room at Bliss Urban Hotels & Suites, Barnawa",
  "bliss-superior": "The Bliss Superior room, with seating and a work desk",
  "bliss-superior-2": "The Bliss Executive Luxury room, with seating and a work desk",
  "bliss-luxury": "The Bliss Luxury room, with armchairs and a wide headboard",
  "bliss-hero": "Inside Bliss Urban Hotels & Suites, Barnawa",
  "bliss-classic-presidential": "The Bliss Classic Presidential Suite bedroom",
  "bliss-classic-presidential-lounge": "The sitting room of the Bliss Presidential Suite",
};

function token() {
  const p = join(homedir(), ".config", "sanity", "config.json");
  if (!existsSync(p)) throw new Error("Not logged in. Run: npx sanity login");
  const t = JSON.parse(readFileSync(p, "utf8")).authToken;
  if (!t) throw new Error("No auth token found. Run: npx sanity login");
  return t;
}

const TOKEN = token();

async function upload(name) {
  const file = `.roompics/${name}.jpg`;
  if (!existsSync(file)) throw new Error(`missing ${file}`);
  const body = readFileSync(file);
  if (DRY) {
    console.log(`  would upload ${name}.jpg (${Math.round(body.length / 1024)} KB)`);
    return `image-DRYRUN-${name}`;
  }
  const res = await fetch(
    `https://${PROJECT}.api.sanity.io/v2021-06-07/assets/images/${DATASET}?filename=${name}.jpg`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "image/jpeg" },
      body,
    },
  );
  if (!res.ok) throw new Error(`upload ${name}: ${res.status} ${await res.text()}`);
  const { document } = await res.json();
  const { width, height } = document.metadata.dimensions;
  console.log(`  ${name}.jpg -> ${document._id} (${width}x${height})`);
  return document._id;
}

const imageField = (assetId, alt) => ({
  _type: "image",
  asset: { _type: "reference", _ref: assetId },
  alt,
});

async function mutate(mutations) {
  if (DRY) {
    console.log(`  would apply ${mutations.length} mutations`);
    return;
  }
  const res = await fetch(
    `https://${PROJECT}.api.sanity.io/v2021-06-07/data/mutate/${DATASET}?returnIds=true`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ mutations }),
    },
  );
  const out = await res.json();
  if (!res.ok || out.error) throw new Error(`mutate: ${JSON.stringify(out).slice(0, 400)}`);
  console.log(`  patched ${out.results?.length ?? 0} documents`);
}

// --- 1. upload every photograph once ------------------------------------------

console.log("\n  Uploading photographs...");
const names = [...new Set([HERO, ...ROOMS.flatMap((r) => [r.cover, ...r.gallery])])];
const assets = {};
for (const n of names) assets[n] = await upload(n);

// --- 2. attach them ------------------------------------------------------------

console.log("\n  Attaching to rooms and the home page...");
const mutations = ROOMS.map((room) => ({
  patch: {
    id: room.id,
    set: {
      image: imageField(assets[room.cover], ALT[room.cover]),
      ...(room.gallery.length
        ? {
            images: room.gallery.map((g, i) => ({
              ...imageField(assets[g], ALT[g]),
              _key: `${room.id}-${i}`,
            })),
          }
        : {}),
    },
    // The borrowed Unsplash stand-ins are no longer wanted on a room that has
    // a real photograph of itself.
    unset: ["standInPhoto", "standInGallery"],
  },
}));

mutations.push({
  patch: {
    id: "siteSettings",
    set: { heroImage: imageField(assets[HERO], ALT[HERO]) },
    unset: ["heroStandIn"],
  },
});

await mutate(mutations);

console.log("\n  Done. Rooms without a photograph keep their drawn panel:");
console.log("    Bliss Executive Luxury, Bliss Presidential Suite, The Hall");
