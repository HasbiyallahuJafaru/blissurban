import { client } from "./client";
import { sanityReady } from "../env";
import { seedMenu, seedRooms, seedSettings } from "./seed";
import { rate, type MenuItem, type Room, type Section, type SiteSettings } from "./types";

export const isDemo = !sanityReady;

const ROOM = `{_id, name, "slug": slug.current, price, discountedPrice, kind, capacity,
  size, bed, amenities, description, image, images, featured, available}`;

const ITEM = `{_id, name, price, onRequest, description, category, section, tags, image, available}`;

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

export const getRooms = () =>
  get<Room[]>(
    `*[_type == "room" && available == true] | order(price asc) ${ROOM}`,
    "rooms",
    seedRooms,
  );

export const getMenu = (section: Section) =>
  get<MenuItem[]>(
    `*[_type == "menuItem" && section == "${section}" && available == true]
      | order(displayOrder asc, name asc) ${ITEM}`,
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
