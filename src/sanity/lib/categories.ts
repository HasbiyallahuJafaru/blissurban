/**
 * The order each priced list prints its categories in, matching the hotel's
 * tariff sheet. Drives the Studio's category dropdown and folders, and the
 * section order on the site. A category missing from here still shows on the
 * site, after these, but cannot be picked in Studio until it is added.
 */
export const categoryOrder: Record<string, string[]> = {
  restaurant: [
    "Breakfast",
    "Pasta, Noodles, Fries & BBQ",
    "Rice Dishes",
    "Pounded Yam & Local Meals",
    "Nigerian Dishes & Hot Pot",
  ],
  lounge: [
    "Water",
    "Soft Drinks",
    "Energy Drinks",
    "Juices & Dairy",
    "Beer & Stout",
    "Non-Alcoholic Wine",
    "Champagne",
    "Red Wine",
    "Cognac & Cream",
    "Spirits",
  ],
  laundry: [
    "Native & Traditional",
    "Shirts & Trousers",
    "Suits & Jackets",
    "Towels & Inner Wear",
    "Wash or Iron Only",
  ],
  transport: ["Around Kaduna", "Kaduna Airport", "Out of State"],
};
