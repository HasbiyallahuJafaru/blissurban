/**
 * Fallback content, used only while NEXT_PUBLIC_SANITY_PROJECT_ID is unset.
 * It exists so the site is browsable before the client has a Sanity project.
 *
 * Real, supplied by the hotel: the address, both phone numbers, the email, and
 * the whole restaurant menu with its prices.
 *
 * Still placeholder: room types and nightly rates, the entire lounge list, and
 * every photograph (Unsplash stand-ins, not this building). The site shows a
 * ribbon saying so while this file is in use.
 */
import type { MenuItem, Room, SiteSettings } from "./types";

export const seedSettings: SiteSettings = {
  phone: "0706 122 3394",
  phoneAlt: "0701 797 2043",
  email: "blissurbanhotel@gmail.com",
  whatsapp: "2347061223394",
  address: "No 3 Kashim Ibrahim Street, Narayi High Cost, Barnawa, Kaduna",
  hours: "Front desk 24 hours · Kitchen 07:00 to 00:00",
  heroEyebrow: "Barnawa, Kaduna",
  heroHeadline: "The power never",
  heroHeadlineItalic: "goes off.",
  heroBody:
    "Twenty-four hour power, a gated compound, and a kitchen that stays open late. Book a room, order dinner, or hold a table in the lounge. Every request reaches the front desk within seconds.",
  heroImage: null,
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
    photo: "photo-1631049307264-da0ec9d70304",
    gallery: ["photo-1631049552057-403cdb8f0658", "photo-1596394516093-501ba68a0ba6", "photo-1584132967334-10e028bd69f7"],
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
    photo: "photo-1590490360182-c33d57733427",
    gallery: ["photo-1618773928121-c32242e63f39", "photo-1578683010236-d716f9a3f461", "photo-1595576508898-0ad5c879a061"],
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
    photo: "photo-1611892440504-42a792e24d32",
    gallery: ["photo-1560448204-e02f11c3d0e2", "photo-1571003123894-1f0594d2b5d9", "photo-1566665797739-1674de7a421a"],
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
    photo: "photo-1566073771259-6a8506099945",
    gallery: ["photo-1522708323590-d24dbb6b0267", "photo-1587985064135-0366536eab42", "photo-1551882547-ff40c63fe5fa"],
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
  // --- The hotel's actual menu, as supplied. Names and prices verbatim. ---
  food("Chicken Pepper Soup", 5000, "Nigerian Special Soup"),
  food("Cat Fish Pepper Soup", 5000, "Nigerian Special Soup"),
  food("Catfish Pepper Soup (Full)", 10000, "Nigerian Special Soup", "Whole fish."),
  food("Pepper Crocker Fish", 4000, "Nigerian Special Soup"),
  food("Goat Meat Pepper Soup", 4000, "Nigerian Special Soup"),
  food("Kayan Chiki Pepper Soup", 5000, "Nigerian Special Soup", "Assorted offal."),
  food("Cow Tail Pepper Soup", 5000, "Nigerian Special Soup"),
  food("Pepper Chicken", 5000, "Nigerian Special Soup"),
  food("Pepper Gizzard", 5000, "Nigerian Special Soup"),

  food("Spaghetti", 2000, "Others"),
  food("Serve with Goat / Beef Meat", 4000, "Others"),
  food("Serve with Cat Fish or Crocker Fish", 4000, "Others"),
  food("Serve with Sardine or Chicken", 5000, "Others"),
  food("Chinese Rice with Chicken", 6000, "Others"),
  food("Basmatic Rice Serve with Goat or Beef", 3000, "Others"),
  food("Basmatic Rice Serve with Chicken", 3000, "Others"),
  food("Rice & Vegetable Sauce", 5000, "Others"),
  food("Rice with Cat Fish Pepper Soup", 3000, "Others"),

  // --- Lounge list not yet supplied by the hotel. Placeholder. ---
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
  restaurant: ["Nigerian Special Soup", "Others"],
  lounge: ["Cocktails", "Mocktails & Zobo", "Beer & Cider", "Spirits", "Wine", "Shisha"],
};
