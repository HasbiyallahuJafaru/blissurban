export type SanityImage = { asset?: { _ref?: string }; alt?: string } | null;

export type Room = {
  _id: string;
  name: string;
  slug: string;
  /** The rack rate, as printed on the hotel's tariff sheet. */
  price: number;
  /** What the hotel actually charges. Shown as the headline price when set. */
  discountedPrice?: number;
  capacity: number;
  size?: string;
  bed?: string;
  amenities: string[];
  description: string;
  image: SanityImage;
  images?: SanityImage[];
  /** Unsplash ids, used only until real photography exists. */
  photo?: string;
  gallery?: string[];
  featured?: boolean;
  /** The hall is priced per day and seats a crowd, so it is not in the grid. */
  kind?: "room" | "hall";
  available: boolean;
};

/** What a guest actually pays, and what the site quotes everywhere. */
export const rate = (room: Room) => room.discountedPrice ?? room.price;

/** True when the rack rate is worth showing struck through beside the rate. */
export const isReduced = (room: Room) =>
  typeof room.discountedPrice === "number" && room.discountedPrice < room.price;

/**
 * A priced list. The first three are ordered through the cart; `transport` is
 * a published fare table booked through its own form, because a ride needs a
 * date and a time that a cart line cannot carry.
 */
export type Section = "restaurant" | "lounge" | "laundry" | "transport";

export const ORDERABLE: Section[] = ["restaurant", "lounge", "laundry"];

export type MenuItem = {
  _id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  section: Section;
  tags?: string[];
  image: SanityImage;
  /** Priced by the kitchen on the day. `price` is 0 and never shown. */
  onRequest?: boolean;
  available: boolean;
};

export type Amenity = { title: string; body: string; icon: string };

export type SiteSettings = {
  phone: string;
  phoneAlt?: string;
  email: string;
  whatsapp: string;
  address: string;
  hours: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroHeadlineItalic: string;
  heroBody: string;
  heroImage: SanityImage;
  amenities: Amenity[];
  /** House rules from the tariff sheet, shown on the Rooms page. */
  policies: string[];
  promoEyebrow: string;
  promoHeading: string;
  promoBody: string;
  promoCtaLabel: string;
  promoCtaHref: string;
};
