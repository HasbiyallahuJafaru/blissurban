import { rate, type MenuItem, type Room, type SiteSettings } from "@/sanity/lib/types";

/**
 * The one place the site's own address is written down.
 *
 * `||` not `??`: an env var set to an empty string is present but useless, and
 * a relative base would put "/rooms" into the sitemap and every canonical.
 *
 * The fallback is the real domain rather than a placeholder on purpose. This
 * value ends up in every canonical, in og:url and in the sitemap, so if the
 * environment variable ever goes missing in production the pages still point
 * at somewhere that exists. A canonical aimed at a domain that cannot resolve
 * is not a cosmetic bug: Google follows it, finds nothing, and drops the real
 * URL from the index.
 *
 * The trailing slash is stripped so `https://example.com/` in the environment
 * cannot produce `https://example.com//rooms`.
 */
export const SITE = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://blissurbanhotels.com"
).replace(/\/+$/, "");

export const HOTEL_NAME = "Bliss Urban Hotels & Suites";

/**
 * Taken from the hotel's own tariff sheet. There are deliberately no `geo`
 * coordinates here: nobody has surveyed the building, and a guessed lat/long
 * sends a driver to the wrong street more convincingly than no lat/long at all.
 */
const ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "No 3 Kashim Ibrahim Street, Narayi High Cost",
  addressLocality: "Barnawa, Kaduna",
  addressRegion: "Kaduna",
  addressCountry: "NG",
} as const;

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

/**
 * The hotel itself, keyed on a stable @id so every other block on the site can
 * point at this one node rather than restating the address.
 */
export function hotelSchema(settings: SiteSettings, rooms: Room[] = []) {
  const rates = rooms.filter((r) => r.kind !== "hall").map(rate).filter((n) => n > 0);

  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "@id": `${SITE}/#hotel`,
    name: HOTEL_NAME,
    url: SITE,
    address: ADDRESS,
    telephone: settings.phoneAlt ? [settings.phone, settings.phoneAlt] : settings.phone,
    email: settings.email,
    // Quoted from what the site actually charges, so the range never drifts
    // from the rate cards a guest can see on /rooms.
    ...(rates.length
      ? { priceRange: `${naira(Math.min(...rates))}–${naira(Math.max(...rates))}` }
      : {}),
    ...(settings.amenities?.length
      ? {
          amenityFeature: settings.amenities.map((a) => ({
            "@type": "LocationFeatureSpecification",
            name: a.title,
            value: true,
          })),
        }
      : {}),
  };
}

/** Each room category as a bookable offer, so rates can surface in results. */
export function roomsSchema(rooms: Room[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Rooms at ${HOTEL_NAME}`,
    itemListElement: rooms.map((room, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": room.kind === "hall" ? "EventVenue" : "HotelRoom",
        name: room.name,
        ...(room.description ? { description: room.description } : {}),
        ...(room.bed ? { bed: room.bed } : {}),
        ...(room.capacity ? { occupancy: { "@type": "QuantitativeValue", maxValue: room.capacity } } : {}),
        containedInPlace: { "@id": `${SITE}/#hotel` },
        offers: {
          "@type": "Offer",
          price: rate(room),
          priceCurrency: "NGN",
          availability: "https://schema.org/InStock",
          url: `${SITE}/rooms`,
        },
      },
    })),
  };
}

/**
 * A priced list as a schema.org Menu. Items priced on request carry no price
 * rather than a zero, which would read as free.
 */
export function menuSchema(name: string, items: MenuItem[], url: string) {
  const byCategory = new Map<string, MenuItem[]>();
  for (const item of items) {
    const list = byCategory.get(item.category) ?? [];
    list.push(item);
    byCategory.set(item.category, list);
  }

  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name,
    url,
    provider: { "@id": `${SITE}/#hotel` },
    hasMenuSection: [...byCategory].map(([category, list]) => ({
      "@type": "MenuSection",
      name: category,
      hasMenuItem: list.map((item) => ({
        "@type": "MenuItem",
        name: item.name,
        ...(item.description ? { description: item.description } : {}),
        ...(item.onRequest
          ? {}
          : { offers: { "@type": "Offer", price: item.price, priceCurrency: "NGN" } }),
      })),
    })),
  };
}

/** Two levels is all this site is deep, but it names the page in results. */
export function breadcrumbSchema(title: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: title, item: `${SITE}${path}` },
    ],
  };
}
