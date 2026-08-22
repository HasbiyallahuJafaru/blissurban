/**
 * Turns src/sanity/lib/seed.ts into an NDJSON file the Sanity CLI can import,
 * so a fresh dataset starts with the hotel's real tariff sheet already in it
 * rather than 200-odd items waiting to be typed by hand:
 *
 *   node scripts/seed-to-ndjson.mjs > seed.ndjson
 *   npx sanity dataset import seed.ndjson production --replace
 *
 * Document ids are the same ones the seed file already uses, so importing
 * twice updates rather than duplicates.
 *
 * Photographs are deliberately not uploaded. Every one of them is an Unsplash
 * stand-in of somebody else's building, so they travel as `standInPhoto` ids
 * that an editor can clear from Studio, and the real photo replaces them by
 * being uploaded over the top.
 */
import * as esbuild from "esbuild";

/** The home page holds its own stand-in, outside the seed file. */
const HERO_STAND_IN = "photo-1566665797739-1674de7a421a";

// seed.ts is TypeScript, so bundle it in memory and import the result.
const bundled = await esbuild.build({
  entryPoints: ["src/sanity/lib/seed.ts"],
  bundle: true,
  format: "esm",
  platform: "node",
  write: false,
  logLevel: "silent",
});
const source = Buffer.from(bundled.outputFiles[0].contents).toString("base64");
const { seedSettings, seedRooms, seedMenu } = await import(
  `data:text/javascript;base64,${source}`
);

/** Sanity needs a stable _key on every object inside an array. */
const keyed = (items, prefix) =>
  items.map((item, i) => ({ ...item, _key: `${prefix}-${i}` }));

/** Drop undefined/null so the import does not write empty fields. */
const clean = (doc) =>
  Object.fromEntries(Object.entries(doc).filter(([, v]) => v !== undefined && v !== null));

const docs = [];

docs.push(
  clean({
    _id: "siteSettings",
    _type: "siteSettings",
    phone: seedSettings.phone,
    phoneAlt: seedSettings.phoneAlt,
    email: seedSettings.email,
    whatsapp: seedSettings.whatsapp,
    address: seedSettings.address,
    hours: seedSettings.hours,
    heroEyebrow: seedSettings.heroEyebrow,
    heroHeadline: seedSettings.heroHeadline,
    heroHeadlineItalic: seedSettings.heroHeadlineItalic,
    heroBody: seedSettings.heroBody,
    heroStandIn: HERO_STAND_IN,
    amenities: keyed(
      (seedSettings.amenities ?? []).map((a) => ({
        _type: "object",
        icon: a.icon,
        title: a.title,
        body: a.body,
      })),
      "amenity",
    ),
    policies: seedSettings.policies,
    promoEyebrow: seedSettings.promoEyebrow,
    promoHeading: seedSettings.promoHeading,
    promoBody: seedSettings.promoBody,
    promoCtaLabel: seedSettings.promoCtaLabel,
    promoCtaHref: seedSettings.promoCtaHref,
  }),
);

for (const room of seedRooms) {
  docs.push(
    clean({
      _id: room._id,
      _type: "room",
      name: room.name,
      slug: { _type: "slug", current: room.slug },
      kind: room.kind ?? "room",
      price: room.price,
      discountedPrice: room.discountedPrice,
      capacity: room.capacity,
      size: room.size,
      bed: room.bed,
      description: room.description,
      amenities: room.amenities,
      standInPhoto: room.photo,
      standInGallery: room.gallery,
      featured: room.featured,
      available: room.available,
    }),
  );
}

/** One document type per priced list; the type is the section. */
const SECTION_TYPE = {
  restaurant: "restaurantItem",
  lounge: "loungeItem",
  laundry: "laundryItem",
  transport: "transportItem",
};

seedMenu.forEach((item, i) => {
  docs.push(
    clean({
      _id: item._id,
      _type: SECTION_TYPE[item.section],
      name: item.name,
      price: item.price,
      onRequest: item.onRequest,
      category: item.category,
      description: item.description,
      tags: item.tags,
      // Preserve the tariff sheet's running order inside each category.
      displayOrder: i,
      available: item.available,
    }),
  );
});

process.stdout.write(docs.map((d) => JSON.stringify(d)).join("\n") + "\n");
process.stderr.write(
  `${docs.length} documents: 1 siteSettings, ${seedRooms.length} rooms, ${seedMenu.length} menu items\n`,
);
