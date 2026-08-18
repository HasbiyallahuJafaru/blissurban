/**
 * Fallback content, used only while NEXT_PUBLIC_SANITY_PROJECT_ID is unset.
 * It exists so the site is browsable before the client has a Sanity project.
 *
 * Everything here is demo material. Rates, dishes and phone numbers are
 * plausible for Barnawa but none of them came from the hotel. The site shows
 * a "demo content" ribbon whenever this file is in use.
 */
import type { MenuItem, Room, SiteSettings } from "./types";

export const seedSettings: SiteSettings = {
  phone: "+234 000 000 0000",
  whatsapp: "2340000000000",
  address: "Barnawa, Kaduna, Nigeria",
  hours: "Front desk 24 hours · Kitchen 07:00 to 00:00",
  heroEyebrow: "Barnawa, Kaduna",
  heroHeadline: "The power never",
  heroHeadlineItalic: "goes off.",
  heroBody:
    "Twenty-four hour power, a gated compound, and a kitchen that stays open late. Book a room, order dinner, or hold a table in the lounge. Every request reaches the front desk within seconds.",
  amenities: [
    {
      icon: "power",
      title: "24-Hour Power",
      body: "Grid and generator, switched automatically. You will not notice the change.",
    },
    {
      icon: "gate",
      title: "Secure Parking",
      body: "Gated compound, watched through the night.",
    },
    {
      icon: "signal",
      title: "Fibre Wi-Fi",
      body: "In every room, and strong enough to hold a video call.",
    },
    {
      icon: "pot",
      title: "Kitchen Until Midnight",
      body: "Late arrivals still eat properly.",
    },
    {
      icon: "key",
      title: "Airport Pickup",
      body: "Arrange it when you send your booking request.",
    },
    {
      icon: "broom",
      title: "Daily Housekeeping",
      body: "Rooms serviced every morning, laundry on request.",
    },
  ],
  promoEyebrow: "Room service",
  promoHeading: "The kitchen runs until midnight.",
  promoBody:
    "Order from upstairs and it comes to your door. Give your room number at checkout and the kitchen sees it immediately.",
  promoCtaLabel: "See the menu",
  promoCtaHref: "/restaurant",
};

export const seedRooms: Room[] = [
  {
    _id: "room-standard",
    name: "Standard Room",
    slug: "standard-room",
    price: 38000,
    capacity: 1,
    size: "22 m²",
    bed: "Queen",
    amenities: ["24hr power", "En-suite bathroom", "Fibre Wi-Fi", "DSTV", "Air conditioning", "Work desk"],
    description:
      "A quiet single room at the back of the building, away from the road. Enough desk to work at and hot water that stays hot.",
    image: null,
    available: true,
  },
  {
    _id: "room-executive",
    name: "Executive Room",
    slug: "executive-room",
    price: 55000,
    capacity: 2,
    size: "28 m²",
    bed: "King",
    amenities: ["24hr power", "En-suite bathroom", "Fibre Wi-Fi", "DSTV", "Air conditioning", "Work desk", "Mini fridge"],
    description:
      "More room to spread out, a proper armchair, and a wider desk. The usual choice for a stay of three nights or more.",
    image: null,
    featured: true,
    available: true,
  },
  {
    _id: "room-deluxe",
    name: "Deluxe Suite",
    slug: "deluxe-suite",
    price: 85000,
    capacity: 2,
    size: "40 m²",
    bed: "King + sofa bed",
    amenities: ["24hr power", "Separate sitting room", "Fibre Wi-Fi", "DSTV", "Air conditioning", "Work desk", "Mini fridge", "Bathtub"],
    description:
      "A separate sitting room with its own door, so you can take a call without sitting on the bed to do it.",
    image: null,
    available: true,
  },
  {
    _id: "room-business",
    name: "Business Suite",
    slug: "business-suite",
    price: 120000,
    capacity: 3,
    size: "55 m²",
    bed: "King + twin",
    amenities: ["24hr power", "Meeting table for six", "Fibre Wi-Fi", "DSTV", "Air conditioning", "Kitchenette", "Bathtub", "Airport pickup included"],
    description:
      "The largest suite, with a meeting table for six and a kitchenette. Booked most often by teams staying a week.",
    image: null,
    available: true,
  },
];

const food = (
  name: string,
  price: number,
  category: string,
  description?: string,
  tags?: string[],
): MenuItem => ({
  _id: `r-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  name,
  price,
  category,
  description,
  tags,
  section: "restaurant",
  image: null,
  available: true,
});

const drink = (
  name: string,
  price: number,
  category: string,
  description?: string,
  tags?: string[],
): MenuItem => ({
  _id: `l-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  name,
  price,
  category,
  description,
  tags,
  section: "lounge",
  image: null,
  available: true,
});

export const seedMenu: MenuItem[] = [
  food("Masa & Miyan Taushe", 3500, "Breakfast", "Rice cakes with pumpkin and groundnut soup."),
  food("Akara & Pap", 2500, "Breakfast", "Bean fritters with fermented corn pudding."),
  food("Full English", 6500, "Breakfast", "Eggs, sausage, beans, toast and tea."),

  food("Tuwo Shinkafa & Miyan Kuka", 4500, "Soups & Swallow", "Rice pudding with baobab leaf soup and beef.", ["Chef's pick"]),
  food("Miyan Taushe & Semo", 4800, "Soups & Swallow", "Pumpkin and groundnut soup with semolina."),
  food("Egusi & Pounded Yam", 5500, "Soups & Swallow", "Melon seed soup with assorted meat."),
  food("Dan Wake", 3000, "Soups & Swallow", "Bean flour dumplings, oiled and peppered.", ["Vegetarian"]),

  food("Jollof Rice & Chicken", 5500, "Rice & Grills", "Smoky jollof, grilled quarter chicken, plantain."),
  food("Fried Rice & Beef", 5500, "Rice & Grills", "Vegetable fried rice with peppered beef."),
  food("Suya Platter", 7500, "Rice & Grills", "Beef suya off the charcoal, onions and yaji.", ["Spicy", "Chef's pick"]),
  food("Grilled Tilapia", 9500, "Rice & Grills", "Whole fish, pepper sauce, fried yam."),

  food("Chicken Shawarma", 4000, "Continental", "Grilled chicken, garlic sauce, flatbread."),
  food("Beef Burger & Chips", 6000, "Continental", "Quarter-pounder with cheese and hand-cut chips."),
  food("Spaghetti Bolognese", 5000, "Continental", "Slow beef ragu, parmesan."),

  food("Kilishi", 3000, "Sides", "Dried spiced beef, sold by the wrap."),
  food("Fried Plantain", 1500, "Sides"),
  food("Hand-Cut Chips", 2000, "Sides"),

  food("Fruit Platter", 3000, "Desserts", "Whatever the market had that morning."),
  food("Chin Chin", 1500, "Desserts", "Fried, sweet, and sold by the bowl."),

  drink("Kaduna Sunset", 6500, "Cocktails", "Gin, zobo syrup, lime, bitters.", ["House"]),
  drink("Old Fashioned", 7000, "Cocktails", "Bourbon, sugar, orange oil."),
  drink("Chapman", 4000, "Cocktails", "Fanta, Sprite, blackcurrant, cucumber."),

  drink("Chilled Zobo", 2000, "Mocktails & Zobo", "Hibiscus, ginger, pineapple.", ["No alcohol"]),
  drink("Virgin Chapman", 2500, "Mocktails & Zobo", undefined, ["No alcohol"]),
  drink("Kunu Aya", 1500, "Mocktails & Zobo", "Tiger nut, chilled.", ["No alcohol"]),

  drink("Hennessy VS", 95000, "Spirits", "70cl bottle, mixers included."),
  drink("Jameson", 45000, "Spirits", "70cl bottle, mixers included."),
  drink("Jack Daniel's", 55000, "Spirits", "70cl bottle, mixers included."),

  drink("Star", 1800, "Beer & Cider"),
  drink("Heineken", 2200, "Beer & Cider"),
  drink("Smirnoff Ice", 2500, "Beer & Cider"),

  drink("Four Cousins", 18000, "Wine", "South African, sweet red."),
  drink("Moët & Chandon", 120000, "Wine", "Brut Impérial, 75cl."),

  drink("Double Apple Shisha", 8000, "Shisha", "One hour, coals changed twice."),
  drink("Mint Shisha", 8000, "Shisha", "One hour, coals changed twice."),
];

/** Category order per section. Anything not listed sorts to the end. */
export const categoryOrder: Record<string, string[]> = {
  restaurant: ["Breakfast", "Soups & Swallow", "Rice & Grills", "Continental", "Sides", "Desserts"],
  lounge: ["Cocktails", "Mocktails & Zobo", "Beer & Cider", "Spirits", "Wine", "Shisha"],
};
