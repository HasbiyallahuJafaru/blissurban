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

/**
 * Added to a room's rate, as columns on the tariff sheet. The hall carries
 * none. "Single person" applies only when one guest has the room.
 */
const CHARGES = [
  { label: "VAT 7.5%", share: 0.075 },
  { label: "Service charge 5%", share: 0.05 },
  { label: "Single person 2%", share: 0.02, single: true },
];

export const CHARGES_NOTE = "Plus 7.5% VAT and 5% service charge, and 2% when one guest has the room.";

/** The charges owed on `amount` (rate × nights) for this booking. */
export const charges = (kind: Room["kind"], guests: number, amount: number) =>
  kind === "hall"
    ? []
    : CHARGES.filter((c) => !c.single || guests === 1).map((c) => ({
        label: c.label,
        amount: Math.round(amount * c.share),
      }));

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
  /** Masthead photographs for the four priced-list pages. */
  restaurantImage?: SanityImage;
  loungeImage?: SanityImage;
  laundryImage?: SanityImage;
  transportImage?: SanityImage;
  /** Unsplash id, used only until a real hero photo exists. */
  heroStandIn?: string;
  amenities: Amenity[];
  /** House rules from the tariff sheet, shown on the Rooms page. */
  policies: string[];
  promoEyebrow: string;
  promoHeading: string;
  promoBody: string;
  promoCtaLabel: string;
  promoCtaHref: string;
};
