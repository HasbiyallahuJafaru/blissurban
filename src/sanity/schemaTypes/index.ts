import { defineField, defineType } from "sanity";
import { categoryOrder } from "../lib/seed";

const image = defineField({
  name: "image",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      type: "string",
      title: "Alt text",
      description: "What the photo shows, for screen readers and search.",
    }),
  ],
  // Demanded only once a photo is actually there, so an empty slot is not an error.
  validation: (r) =>
    r.custom((value?: { asset?: unknown; alt?: string }) =>
      !value?.asset || value.alt?.trim() ? true : "Add alt text describing this photo.",
    ),
});

const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "contact", title: "Contact", default: true },
    { name: "hero", title: "Home hero" },
    { name: "amenities", title: "Amenities" },
    { name: "policies", title: "House rules" },
    { name: "promo", title: "Promo band" },
  ],
  fields: [
    defineField({ name: "phone", type: "string", group: "contact", description: "Shown in the header and footer." }),
    defineField({ name: "phoneAlt", title: "Second phone", type: "string", group: "contact" }),
    defineField({ name: "email", type: "string", group: "contact" }),
    defineField({
      name: "whatsapp",
      type: "string",
      group: "contact",
      description: "Digits only, with country code and no plus. Example: 2348012345678",
    }),
    defineField({ name: "address", type: "text", rows: 2, group: "contact" }),
    defineField({ name: "hours", type: "string", group: "contact", description: "Front desk and kitchen hours." }),

    defineField({ name: "heroEyebrow", type: "string", group: "hero" }),
    defineField({ name: "heroHeadline", type: "string", group: "hero", description: "First line, set upright." }),
    defineField({ name: "heroHeadlineItalic", type: "string", group: "hero", description: "Second line, set in italic." }),
    defineField({ name: "heroBody", type: "text", rows: 3, group: "hero" }),
    defineField({ ...image, name: "heroImage", title: "Hero image", group: "hero" }),
    defineField({
      name: "heroStandIn",
      title: "Stand-in hero (Unsplash id)",
      type: "string",
      group: "hero",
      description:
        "Borrowed photograph shown until a real one is uploaded above. Clearing this field drops the stand-in without a deploy.",
    }),

    defineField({
      name: "amenities",
      type: "array",
      group: "amenities",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "icon",
              type: "string",
              options: {
                list: ["power", "gate", "signal", "pot", "key", "broom"],
              },
            },
            { name: "title", type: "string" },
            { name: "body", type: "text", rows: 2 },
          ],
          preview: { select: { title: "title", subtitle: "body" } },
        },
      ],
    }),

    defineField({
      name: "policies",
      title: "House rules",
      type: "array",
      of: [{ type: "string" }],
      group: "policies",
      description: "The Special Notice from the tariff sheet. Shown on the Rooms page.",
    }),

    defineField({ name: "promoEyebrow", type: "string", group: "promo" }),
    defineField({ name: "promoHeading", type: "string", group: "promo" }),
    defineField({ name: "promoBody", type: "text", rows: 3, group: "promo" }),
    defineField({ name: "promoCtaLabel", type: "string", group: "promo" }),
    defineField({ name: "promoCtaHref", type: "string", group: "promo", description: "Example: /restaurant" }),
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});

const room = defineType({
  name: "room",
  title: "Room",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "kind",
      title: "Type",
      type: "string",
      options: { list: [{ title: "Guest room", value: "room" }, { title: "Event hall", value: "hall" }], layout: "radio" },
      initialValue: "room",
      description: "A hall is priced per day and shown in its own block, not the room grid.",
    }),
    defineField({
      name: "price",
      title: "Standard rate (₦)",
      type: "number",
      validation: (r) => r.required().min(0),
      description: "The rack rate from the tariff sheet.",
    }),
    defineField({
      name: "discountedPrice",
      title: "Discounted rate (₦)",
      type: "number",
      validation: (r) => r.min(0),
      description:
        "What the guest actually pays. Shown as the headline price, with the standard rate struck through. Leave empty to quote the standard rate alone.",
    }),
    defineField({ name: "capacity", title: "Sleeps", type: "number", validation: (r) => r.required().min(1) }),
    defineField({ name: "size", type: "string", description: "Example: 28 m²" }),
    defineField({ name: "bed", type: "string", description: "Example: King" }),
    defineField({ name: "description", type: "text", rows: 3 }),
    defineField({ name: "amenities", type: "array", of: [{ type: "string" }], options: { layout: "tags" } }),
    image,
    defineField({
      name: "images",
      title: "More photos",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      description: "Shown in the gallery when someone opens this room.",
    }),
    defineField({
      name: "standInPhoto",
      title: "Stand-in photo (Unsplash id)",
      type: "string",
      description:
        "Borrowed photograph shown until a real one is uploaded above. Clear it once the photo is real.",
    }),
    defineField({
      name: "standInGallery",
      title: "Stand-in gallery (Unsplash ids)",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: "Borrowed gallery shots, replaced by More photos above.",
    }),
    defineField({ name: "featured", type: "boolean", description: "Shown large on the home page. Pick one." }),
    defineField({ name: "available", type: "boolean", initialValue: true, description: "Untick to hide from the site." }),
  ],
  preview: { select: { title: "name", subtitle: "price", media: "image" } },
});

/**
 * One document type per priced list, rather than a single "menuItem" holding
 * all four behind a `section` dropdown.
 *
 * The merged version put ninety dishes, ninety-one drinks, the laundry prices
 * and the car hire fares into one undifferentiated list, and offered every
 * category from every section in the same dropdown, so adding a beer invited
 * you to file it under Breakfast. Splitting the type means each list carries
 * only its own categories, and the Studio can show them as four separate
 * groups that match the four pages on the site.
 *
 * The type *is* the section, so no `section` field is stored; the queries in
 * lib/fetch.ts add it back to keep the rest of the app unchanged.
 */
const PRICED_LISTS = [
  { name: "restaurantItem", title: "Restaurant", noun: "Dish", categories: categoryOrder.restaurant },
  { name: "loungeItem", title: "Lounge", noun: "Drink", categories: categoryOrder.lounge },
  { name: "laundryItem", title: "Laundry", noun: "Item", categories: categoryOrder.laundry },
  { name: "transportItem", title: "Car Hire", noun: "Route", categories: categoryOrder.transport },
] as const;

const pricedList = ({
  name,
  title,
  noun,
  categories,
}: {
  name: string;
  title: string;
  noun: string;
  categories: readonly string[];
}) =>
  defineType({
    name,
    title,
    type: "document",
    fields: [
      defineField({ name: "name", title: `${noun} name`, type: "string", validation: (r) => r.required() }),
      defineField({ name: "price", title: "Price (₦)", type: "number", validation: (r) => r.required().min(0) }),
      defineField({
        name: "onRequest",
        title: "Price on request",
        type: "boolean",
        initialValue: false,
        description: "Hides the price and shows “On request” instead. The item cannot be added to an order.",
      }),
      defineField({
        name: "category",
        type: "string",
        options: { list: [...categories] },
        validation: (r) => r.required(),
        description: `Which part of the ${title.toLowerCase()} list this belongs to.`,
      }),
      defineField({ name: "description", type: "text", rows: 2 }),
      defineField({
        name: "tags",
        type: "array",
        of: [{ type: "string" }],
        options: { list: ["Chef's pick", "Spicy", "Vegetarian", "No alcohol", "House"], layout: "tags" },
      }),
      image,
      defineField({ name: "displayOrder", type: "number", description: "Lower numbers sort first inside a category." }),
      defineField({ name: "available", type: "boolean", initialValue: true, description: "Untick when it sells out." }),
    ],
    preview: { select: { title: "name", subtitle: "category", media: "image" } },
  });

const pricedListTypes = PRICED_LISTS.map(pricedList);

export const schemaTypes = [siteSettings, room, ...pricedListTypes];
export const PRICED_LIST_TYPES = PRICED_LISTS.map((l) => ({ name: l.name, title: l.title }));
