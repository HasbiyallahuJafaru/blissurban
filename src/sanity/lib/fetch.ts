import { client } from "./client";
import { sanityReady } from "../env";
import { seedMenu, seedRooms, seedSettings } from "./seed";
import { rate, type MenuItem, type Room, type Section, type SiteSettings } from "./types";

export const isDemo = !sanityReady;

const ROOM = `{_id, name, "slug": slug.current, price, discountedPrice, kind, capacity,
  size, bed, amenities, description, image, images, featured, available,
  "photo": standInPhoto, "gallery": standInGallery}`;

/** One document type per priced list; the type is the section. */
export const SECTION_TYPE: Record<Section, string> = {
  restaurant: "restaurantItem",
  lounge: "loungeItem",
  laundry: "laundryItem",
  transport: "transportItem",
};

const ITEM = `{_id, name, price, onRequest, description, category, tags, image, available}`;

/** Tags let the Sanity webhook drop exactly the pages that changed. */
async function get<T>(query: string, tag: string, fallback: T): Promise<T> {
  if (!client) return fallback;
  try {
    const data = await client.fetch<T>(query, {}, { next: { tags: [tag], revalidate: 60 } });
    return data ?? fallback;
  } catch (err) {
    console.error(`Sanity fetch failed for "${tag}", serving fallback:`, err);
    return fallback;
  }
}

export const getSettings = () =>
  get<SiteSettings>(`*[_type == "siteSettings"][0]`, "settings", seedSettings);

/**
 * The newest publish across everything the site renders, for the sitemap.
 * Null with no CMS connected: no date at all beats a date invented at build
 * time, which tells a crawler the whole site changed on every deploy.
 */
export const getLastModified = () =>
  get<string | null>(
    `*[_type in ["siteSettings", "room", "menuItem"]] | order(_updatedAt desc)[0]._updatedAt`,
    "lastmod",
    null,
  );

export const getRooms = () =>
  get<Room[]>(
    `*[_type == "room" && available == true] | order(price asc) ${ROOM}`,
    "rooms",
    seedRooms,
  );

export const getMenu = (section: Section) =>
  get<MenuItem[]>(
    // `section` is not stored any more, so it is added back here and the rest
    // of the app carries on reading items exactly as before.
    `*[_type == "${SECTION_TYPE[section]}" && available == true]
      | order(displayOrder asc, name asc) {...${ITEM}, "section": "${section}"}`,
    "menu",
    seedMenu.filter((i) => i.section === section),
  );

export type PricedItem = {
  name: string;
  price: number;
  section: Section | "room";
  onRequest?: boolean;
  /** Rooms only. A hall is quoted per day, not per night. */
  kind?: "room" | "hall";
};

/**
 * Server-side price lookup. The browser sends ids and quantities only, never
 * prices, and the section comes from here too so routing does not depend on
 * how an id happens to be spelled.
 *
 * Rooms are keyed on what the guest actually pays, so a discounted rate quoted
 * on the page is the same figure the front desk reads in Telegram.
 */
export async function priceList(): Promise<Map<string, PricedItem>> {
  const [rooms, ...menus] = await Promise.all([
    getRooms(),
    getMenu("restaurant"),
    getMenu("lounge"),
    getMenu("laundry"),
    getMenu("transport"),
  ]);
  const map = new Map<string, PricedItem>();
  for (const items of menus) {
    for (const i of items) {
      map.set(i._id, { name: i.name, price: i.price, section: i.section, onRequest: i.onRequest });
    }
  }
  for (const r of rooms) {
    map.set(r._id, { name: r.name, price: rate(r), section: "room", kind: r.kind ?? "room" });
  }
  return map;
}
