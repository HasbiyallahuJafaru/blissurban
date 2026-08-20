/**
 * Fallback content, used only while NEXT_PUBLIC_SANITY_PROJECT_ID is unset.
 * It exists so the site is browsable before the client has a Sanity project.
 *
 * Real, supplied by the hotel on its 2026 tariff sheet: the address, both phone
 * numbers, the room categories with both rates, the house rules, and every
 * price on the restaurant, drinks, laundry and transport lists.
 *
 * Still placeholder: room descriptions and amenity lists, the hall's seating
 * figure, and every photograph (Unsplash stand-ins, not this building). Room
 * sizes and bed types are deliberately absent rather than invented. The site
 * shows a ribbon saying so while this file is in use.
 */
import type { MenuItem, Room, Section, SiteSettings } from "./types";

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
    "Twenty-four hour power, a gated compound, and a kitchen that stays open late. Book a room, order dinner, send out your laundry, or have a driver meet your flight. Every request reaches the front desk within seconds.",
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
      body: "Fixed fares to both airports, published in full. Book a car without booking a room.",
    },
    {
      icon: "broom",
      title: "Same-Day Laundry",
      body: "Washing, ironing and starching, priced by the piece. Left at the desk, back the same day.",
    },
  ],
  policies: [
    "Pay before check-in.",
    "Check out time is 12:00 noon.",
    "All guests fill in the Guest Registration Form and show a valid ID card before check-in.",
    "Cancellation and no-show attract a 50% charge.",
    "Maximum of 2 adults in a room.",
    "No transfer of a room to a third party, except with the consent of hotel management.",
    "Foreign guests must submit a photocopy of their international passport.",
    "No smoking of any substance in the rooms.",
    "Please leave valuables at the reception for safe keeping.",
    "Pets, illicit drugs, dangerous weapons and arms are not allowed in the hotel, except for security agencies.",
    "Room rates are subject to change without prior notice.",
  ],
  promoEyebrow: "Room service",
  promoHeading: "The kitchen runs until midnight.",
  promoBody:
    "Order from upstairs and it comes to your door. Give your room number at checkout and the kitchen sees it immediately.",
  promoCtaLabel: "See the menu",
  promoCtaHref: "/restaurant",
};

/* Amenities every room carries. The hotel advertises these building-wide, so
   they are safe to repeat; anything that would differ per room is left out
   until the hotel confirms it. */
const BASE = ["24hr power", "En-suite bathroom", "Fibre Wi-Fi", "DSTV", "Air conditioning"];

export const seedRooms: Room[] = [
  {
    _id: "room-bliss-standard",
    photo: "photo-1631049307264-da0ec9d70304",
    gallery: ["photo-1631049552057-403cdb8f0658", "photo-1596394516093-501ba68a0ba6", "photo-1584132967334-10e028bd69f7"],
    name: "Bliss Standard",
    slug: "bliss-standard",
    price: 31000,
    discountedPrice: 28500,
    capacity: 2,
    amenities: [...BASE, "Work desk"],
    description:
      "The entry room, and the one most single travellers book. Everything the hotel runs on is already here: power that does not cut, hot water that stays hot, and a desk you can work at.",
    image: null,
    available: true,
  },
  {
    _id: "room-bliss-superior",
    photo: "photo-1590490360182-c33d57733427",
    gallery: ["photo-1578683010236-d716f9a3f461", "photo-1595576508898-0ad5c879a061"],
    name: "Bliss Superior",
    slug: "bliss-superior",
    price: 38000,
    discountedPrice: 35000,
    capacity: 2,
    amenities: [...BASE, "Work desk", "Mini fridge"],
    description:
      "More floor space than the Standard and a fridge of your own. The usual choice for a stay of two or three nights.",
    image: null,
    available: true,
  },
  {
    _id: "room-bliss-luxury",
    photo: "photo-1611892440504-42a792e24d32",
    gallery: ["photo-1560448204-e02f11c3d0e2", "photo-1571003123894-1f0594d2b5d9", "photo-1566665797739-1674de7a421a"],
    name: "Bliss Luxury",
    slug: "bliss-luxury",
    price: 53000,
    discountedPrice: 45000,
    capacity: 2,
    amenities: [...BASE, "Work desk", "Mini fridge", "Sitting area"],
    description:
      "A sitting area set apart from the bed, so you can take a call or read without sitting on the mattress to do it.",
    image: null,
    featured: true,
    available: true,
  },
  {
    _id: "room-bliss-executive-luxury",
    photo: "photo-1566073771259-6a8506099945",
    gallery: ["photo-1522708323590-d24dbb6b0267", "photo-1587985064135-0366536eab42", "photo-1551882547-ff40c63fe5fa"],
    name: "Bliss Executive Luxury",
    slug: "bliss-executive-luxury",
    price: 60000,
    discountedPrice: 55000,
    capacity: 2,
    amenities: [...BASE, "Work desk", "Mini fridge", "Sitting area", "Bathtub"],
    description:
      "The Luxury with a bathtub and a wider desk. Booked most often by guests staying a working week.",
    image: null,
    available: true,
  },
  {
    _id: "room-bliss-presidential-suite",
    photo: "photo-1582719478250-c89cae4dc85b",
    name: "Bliss Presidential Suite",
    slug: "bliss-presidential-suite",
    price: 75000,
    discountedPrice: 68000,
    capacity: 2,
    amenities: [...BASE, "Separate sitting room", "Work desk", "Mini fridge", "Bathtub"],
    description:
      "A suite with its own sitting room behind a door, which is the difference that matters when you are hosting anyone at all.",
    image: null,
    available: true,
  },
  {
    _id: "room-bliss-classic-presidential-suite",
    photo: "photo-1618773928121-c32242e63f39",
    name: "Bliss Classic Presidential Suite",
    slug: "bliss-classic-presidential-suite",
    price: 80000,
    discountedPrice: 75000,
    capacity: 2,
    amenities: [...BASE, "Separate sitting room", "Work desk", "Mini fridge", "Bathtub", "Airport pickup on request"],
    description:
      "The largest suite in the building, and the one the hotel puts its name to. Ask the desk what is included before you book it.",
    image: null,
    available: true,
  },
  {
    _id: "hall-bliss",
    photo: "photo-1414235077428-338989a2e8c0",
    name: "The Hall",
    slug: "the-hall",
    price: 230000,
    discountedPrice: 200000,
    /* Placeholder. The tariff sheet prices the hall but does not seat it. */
    capacity: 150,
    kind: "hall",
    amenities: ["24hr power", "Secure parking", "Fibre Wi-Fi", "Air conditioning", "Catering from our kitchen"],
    description:
      "One room for weddings, conferences, launches and church programmes, hired by the day. The kitchen downstairs caters it, so the food does not have to travel.",
    image: null,
    available: true,
  },
];

const make =
  (section: Section, prefix: string) =>
  (name: string, price: number, category: string, description?: string, tags?: string[]): MenuItem => ({
    _id: `${prefix}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    name,
    price,
    category,
    description,
    tags,
    section,
    image: null,
    available: true,
  });

const food = make("restaurant", "r");
const drink = make("lounge", "l");
const wash = make("laundry", "w");
const ride = make("transport", "t");

/** Priced by the kitchen on the day, so no figure is printed. */
const onRequest = (item: MenuItem): MenuItem => ({ ...item, price: 0, onRequest: true });

// ═══════════════════════════════════════════════════════════ restaurant
const BREAKFAST = "Breakfast";
const PASTA = "Pasta, Noodles, Fries & BBQ";
const RICE = "Rice Dishes";
const POUNDED = "Pounded Yam & Local Meals";
const HOTPOT = "Nigerian Dishes & Hot Pot";

const restaurant: MenuItem[] = [
  food("Coffee/Tea with milk & choice", 2000, BREAKFAST),
  food("Coffee/Tea served with bread", 3000, BREAKFAST),
  food("Coffee/Tea/Custard/Oat served with beans cake", 4000, BREAKFAST),
  food("Coffee/Tea served with toasted bread", 4500, BREAKFAST),
  food("Custard/Cornflakes/Oat served with milk of choice", 3000, BREAKFAST),
  food("Pap served with bread/beans cake", 3000, BREAKFAST),
  food("Chips & Eggs", 4000, BREAKFAST),
  food("Chips & Egg Sauce", 5000, BREAKFAST),
  food("Plantain with Egg Sauce", 5000, BREAKFAST),
  food("Fried Plantain with Egg Sauce", 6000, BREAKFAST),
  food("Sandwich served with Coffee/Tea", 5000, BREAKFAST),
  food("Boiled Yam with Fish Sauce", 6000, BREAKFAST),
  food("Fried Yam with Egg Sauce", 4000, BREAKFAST),
  food("Boiled Yam with Vegetable Sauce", 5000, BREAKFAST),
  food("Chicken Curry Sauce", 7000, BREAKFAST),
  food("Liver Sauce", 6000, BREAKFAST),
  food("Gizzard Sauce", 7000, BREAKFAST),

  food("Seafood Pasta (Cream)", 8500, PASTA),
  food("Seafood Pasta (Jollof)", 7500, PASTA),
  food("Beef Pasta", 7500, PASTA),
  food("Chicken Pasta", 8500, PASTA),
  food("Spaghetti Noodles", 10000, PASTA),
  food("Spaghetti Bolognese", 6000, PASTA),
  food("Spaghetti Jollof with Chicken", 9000, PASTA),
  food("Noodles & Egg", 3000, PASTA),
  food("Bliss Special Noodles", 5000, PASTA, undefined, ["House"]),
  food("Fries, Cheese and Chicken", 7000, PASTA),
  food("BBQ Chicken", 7000, PASTA),
  onRequest(food("BBQ Fish with Fries or Plantain", 0, PASTA, "Priced by size on the day.")),
  food("Chicken Nugget (with Fries)", 5000, PASTA),
  food("Gizz Dodo (Gizzard & Plantain)", 7000, PASTA),
  food("Samosa", 6000, PASTA),
  food("Beef Dodo", 7000, PASTA),

  food("Jollof Rice with Chicken", 7500, RICE),
  food("Jollof Rice with Fish", 7000, RICE),
  food("Jollof Rice with Goat Meat", 7000, RICE),
  food("Jollof Rice with Beef", 5000, RICE),
  food("Fried Rice with Chicken", 7500, RICE),
  food("Fried Rice with Fish", 7000, RICE),
  food("Fried Rice with Goat Meat", 7000, RICE),
  food("Fried Rice with Beef", 5000, RICE),
  food("Coconut Rice with Chicken", 7500, RICE),
  food("Coconut Rice with Fish", 7000, RICE),
  food("Coconut Rice with Goat Meat", 7000, RICE),
  food("Coconut Rice with Beef", 6000, RICE),
  food("White Rice with Chicken", 7500, RICE),
  food("White Rice with Fish", 7000, RICE),
  food("White Rice with Goat Meat", 7000, RICE),
  food("White Rice with Beef", 5000, RICE),
  food("Mexican Rice with Chicken", 7500, RICE),
  food("Mexican Rice with Fish", 7000, RICE),
  food("Mexican Rice with Goat Meat", 7000, RICE),
  food("Mexican Rice with Beef", 6000, RICE),
  food("Chinese Rice with Chicken", 7500, RICE),
  food("Chinese Rice with Fish", 7500, RICE),
  food("Chinese Rice with Goat Meat", 7000, RICE),
  food("Chinese Rice with Beef", 6000, RICE),
  food("Basmati Rice with Chicken", 8000, RICE),
  food("Basmati Rice with Fish", 7000, RICE),
  food("Basmati Rice with Goat Meat", 7000, RICE),
  food("Basmati Rice with Beef", 6000, RICE),
  food("Ofada Rice", 5000, RICE),

  /* The sheet abbreviates the second half of each block to "Serve with Fish".
     Spelled out here, because a menu line has to stand on its own. */
  food("Pounded Yam with Veg/Afang/Oha/Bitter Leaf & Chicken", 9000, POUNDED),
  food("Pounded Yam with Veg/Afang/Oha/Bitter Leaf & Goat Meat", 8000, POUNDED),
  food("Pounded Yam with Veg/Afang/Oha/Bitter Leaf & Fish", 8000, POUNDED),
  food("Pounded Yam with Veg/Afang/Oha/Bitter Leaf & Beef", 6000, POUNDED),
  food("Pounded Yam with Ogbono/Okro/Egusi & Chicken", 9000, POUNDED),
  food("Pounded Yam with Ogbono/Okro/Egusi & Goat Meat", 8000, POUNDED),
  food("Pounded Yam with Ogbono/Okro/Egusi & Fish", 8000, POUNDED),
  food("Pounded Yam with Ogbono/Okro/Egusi & Beef", 7000, POUNDED),

  food("Semo/Wheat/Eba with Veg/Afang/Oha/Bitter Leaf & Chicken", 7000, HOTPOT),
  food("Semo/Wheat/Eba with Veg/Afang/Oha/Bitter Leaf & Goat Meat", 7000, HOTPOT),
  food("Semo/Wheat/Eba with Veg/Afang/Oha/Bitter Leaf & Fish", 7000, HOTPOT),
  food("Semo/Wheat/Eba with Veg/Afang/Oha/Bitter Leaf & Beef", 5000, HOTPOT),
  food("Semo/Wheat/Eba with Ogbono/Egusi/Okro & Chicken", 6000, HOTPOT),
  food("Semo/Wheat/Eba with Ogbono/Egusi/Okro & Goat Meat", 5500, HOTPOT),
  food("Semo/Wheat/Eba with Ogbono/Egusi/Okro & Fish", 5000, HOTPOT),
  food("Semo/Wheat/Eba with Ogbono/Egusi/Okro & Beef", 5000, HOTPOT),
  food("Chicken Pepper Soup", 6000, HOTPOT),
  food("Pepper Chicken", 6000, HOTPOT, undefined, ["Spicy"]),
  food("Catfish Pepper Soup", 5000, HOTPOT),
  food("Crocker Fish Pepper Soup", 8000, HOTPOT),
  food("Goat Meat Pepper Soup", 5000, HOTPOT),
  food("Cow Head Pepper Soup", 5000, HOTPOT),
  food("Cow Tail Pepper Soup", 7000, HOTPOT),
  food("Kayanchikin (Offals)", 4000, HOTPOT),
  food("Peppered Gizzard", 5000, HOTPOT, undefined, ["Spicy"]),
  food("Isi-Ewu", 5000, HOTPOT),
  food("Nkwobi (Ekubi)", 5000, HOTPOT),
  food("Abacha With Fish", 5000, HOTPOT),
];

// ═══════════════════════════════════════════════════════════════ lounge
const WATER = "Water";
const SOFT = "Soft Drinks";
const ENERGY = "Energy Drinks";
const JUICE = "Juices & Dairy";
const BEER = "Beer & Stout";
const NOALC = "Non-Alcoholic Wine";
const CHAMPAGNE = "Champagne";
const RED = "Red Wine";
const COGNAC = "Cognac & Cream";
const SPIRITS = "Spirits";

const lounge: MenuItem[] = [
  drink("Water", 500, WATER, undefined, ["No alcohol"]),

  drink("Coke Plastic", 700, SOFT),
  drink("Coke Can", 1000, SOFT),
  drink("Fanta Plastic", 700, SOFT),
  drink("Sprite", 700, SOFT),
  drink("Fayrouz", 1000, SOFT),
  drink("Schweppes Can", 1000, SOFT),
  drink("Maltina Bottle", 1000, SOFT),
  drink("Maltina Plastic", 800, SOFT),
  drink("Maltina Can", 1000, SOFT),
  drink("Amstel Malt", 1000, SOFT),

  drink("Fearless", 1000, ENERGY),
  drink("Climax", 1200, ENERGY),
  drink("Monster", 1300, ENERGY),
  drink("Pure Heaven Can", 2000, ENERGY),
  drink("Double Black Can", 2000, ENERGY),
  drink("Black Bullet", 3000, ENERGY),
  drink("Red Bull", 2500, ENERGY),
  drink("Power Horse", 2500, ENERGY),

  drink("Chivita Active", 2800, JUICE),
  drink("Exotic", 2800, JUICE),
  drink("Hollandia", 3000, JUICE),
  drink("5 Alive", 3000, JUICE),
  drink("Martinelli's Cider", 3000, JUICE),
  drink("Viju Wheat", 1500, JUICE),
  drink("Yogo Yogurt", 1500, JUICE),

  drink("Life", 1500, BEER),
  drink("Star", 1500, BEER),
  drink("Gulder", 1500, BEER),
  drink("Origin Beer", 1500, BEER),
  drink("Big Stout", 1800, BEER),
  drink("Medium Stout", 1500, BEER),
  drink("Heineken", 1700, BEER),
  drink("Budweiser", 1700, BEER),
  drink("Legend", 1700, BEER),
  drink("Hero", 1500, BEER),
  drink("Trophy Beer", 1500, BEER),
  drink("Trophy Stout", 1500, BEER),
  drink("Goldberg", 1500, BEER),
  drink("Goldberg Black", 1500, BEER),
  drink("Castle Lite", 1500, BEER),
  drink("Desperados", 1500, BEER),
  drink("Flying Fish", 1500, BEER),
  drink("Star Radler", 1500, BEER),
  drink("Star Lite", 1500, BEER),

  drink("Eva Wine", 9000, NOALC, undefined, ["No alcohol"]),
  drink("Pure Heaven", 6000, NOALC, undefined, ["No alcohol"]),
  drink("Velvets", 7000, NOALC, undefined, ["No alcohol"]),

  drink("Moet Rose", 140000, CHAMPAGNE),
  drink("Moet Brut", 120000, CHAMPAGNE),
  drink("Andre Rose", 20000, CHAMPAGNE),
  drink("Andre Brut", 20000, CHAMPAGNE),
  drink("Joven Capel", 20000, CHAMPAGNE),

  drink("Carlo Rossi", 15000, RED),
  drink("Canyon de Vida", 10000, RED),
  drink("Four Cousins", 15000, RED),
  drink("4th Street", 10000, RED),
  drink("Escudo Rojo", 20000, RED),
  drink("Agor Wine", 15000, RED),
  drink("Lafiola Du Pape", 80000, RED),
  drink("Don Simon", 6000, RED),
  drink("Lambrusco", 15000, RED),
  drink("Don Folder", 15000, RED),
  drink("Barton & Guestier", 15000, RED),
  drink("Baron Romero", 17000, RED),

  drink("Glenfiddich 18", 150000, COGNAC),
  drink("Glenfiddich 15", 105000, COGNAC),
  drink("Glenfiddich 12", 80000, COGNAC),
  drink("Hennessy VSOP", 125000, COGNAC),
  drink("Hennessy VS", 90000, COGNAC),
  drink("Remy Martin", 110000, COGNAC),
  drink("Martell VS", 80000, COGNAC),
  drink("Gold Label", 80000, COGNAC),
  drink("Black Label", 50000, COGNAC),
  drink("Red Label", 30000, COGNAC),
  drink("Jameson Black", 60000, COGNAC),
  drink("Jack Daniels", 40000, COGNAC),
  drink("William Lawson", 25000, COGNAC),

  drink("Small Imperial Blue", 3000, SPIRITS),
  drink("Big Imperial Blue", 10000, SPIRITS),
  drink("Big Gordons", 10000, SPIRITS),
  drink("Small Gordons", 3000, SPIRITS),
  drink("Big X1 Vodka", 10000, SPIRITS),
  drink("Small X1 Vodka", 4000, SPIRITS),
  drink("Tequila", 35000, SPIRITS),
  drink("Big Best", 20000, SPIRITS),
  drink("Small Best", 4000, SPIRITS),
  drink("Big Campari", 30000, SPIRITS),
  drink("Mid Campari", 25000, SPIRITS),
  drink("Origin Bitters Palm Size", 2000, SPIRITS),
  drink("3D Bitters Palm Size", 2000, SPIRITS),
];

// ══════════════════════════════════════════════════════════════ laundry
const NATIVE = "Native & Traditional";
const SHIRTS = "Shirts & Trousers";
const SUITS = "Suits & Jackets";
const TOWELS = "Towels & Inner Wear";
const PARTIAL = "Wash or Iron Only";

const laundry: MenuItem[] = [
  wash("Native 2 Pieces", 2000, NATIVE, "Washed and ironed."),
  wash("Agbada", 2000, NATIVE, "Washed and ironed."),
  wash("Ankara / Gowns", 2000, NATIVE, "Washed and ironed."),

  wash("Packet Shirts", 1000, SHIRTS, "Washed and ironed."),
  wash("Polo Shirts", 800, SHIRTS, "Washed and ironed."),
  wash("Jeans Trousers", 1000, SHIRTS, "Washed and ironed."),

  wash("Suits", 3000, SUITS, "Washed and ironed."),
  wash("Jacket / Sweater", 1000, SUITS, "Washed and ironed."),

  wash("White Towels", 1500, TOWELS, "Washed and ironed."),
  wash("Colour Towels", 1000, TOWELS, "Washed and ironed."),
  wash("Inner Wears, Singlets / Boxers", 500, TOWELS, "Washed and ironed."),

  wash("Washing, 2 Pieces", 1000, PARTIAL, "Washing only, no ironing."),
  wash("Ironing, 2 Pieces", 1000, PARTIAL, "Ironing only, no washing."),
  wash("Starching", 500, PARTIAL, "Per piece, on top of washing."),
];

// ════════════════════════════════════════════════════════════ transport
const KADUNA = "Around Kaduna";
const AIRPORT = "Kaduna Airport";
const INTERCITY = "Out of State";

const transport: MenuItem[] = [
  ride("Around Narayi High-Cost", 4000, KADUNA),
  ride("Command Junction, Television, Kamazou, Janruwa, NNPC", 5000, KADUNA),
  ride("Kaduna Main Town", 6500, KADUNA),
  ride("Kawo, Mando", 10000, KADUNA),
  ride("Goni Gora & FHE", 10000, KADUNA),

  ride("Kaduna Airport, drop off", 20000, AIRPORT),
  ride("Kaduna Airport, pick up", 20000, AIRPORT),
  ride("Kaduna Airport, both ways", 35000, AIRPORT, "One booking, out and back."),

  ride("Jaji & Zaria", 38000, INTERCITY),
  ride("Madalla & Zuba", 60000, INTERCITY),
  ride("Kano State", 70000, INTERCITY),
  ride("Abuja Town, Wuse Market as last stop", 70000, INTERCITY),
  ride("Abuja Airport", 85000, INTERCITY),
];

export const seedMenu: MenuItem[] = [...restaurant, ...lounge, ...laundry, ...transport];

/** Category order per section. Anything not listed sorts to the end. */
export const categoryOrder: Record<string, string[]> = {
  restaurant: [BREAKFAST, PASTA, RICE, POUNDED, HOTPOT],
  lounge: [WATER, SOFT, ENERGY, JUICE, BEER, NOALC, CHAMPAGNE, RED, COGNAC, SPIRITS],
  laundry: [NATIVE, SHIRTS, SUITS, TOWELS, PARTIAL],
  transport: [KADUNA, AIRPORT, INTERCITY],
};
