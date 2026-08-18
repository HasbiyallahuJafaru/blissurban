import { defineField, defineType } from "sanity";
import { categoryOrder } from "../lib/seed";

const allCategories = [...categoryOrder.restaurant, ...categoryOrder.lounge];

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
});

const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "contact", title: "Contact", default: true },
    { name: "hero", title: "Home hero" },
    { name: "amenities", title: "Amenities" },
    { name: "promo", title: "Promo band" },
  ],
  fields: [
    defineField({ name: "phone", type: "string", group: "contact", description: "Shown in the header and footer." }),
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
      name: "price",
      title: "Price per night (₦)",
      type: "number",
      validation: (r) => r.required().min(0),
    }),
    defineField({ name: "capacity", title: "Sleeps", type: "number", validation: (r) => r.required().min(1) }),
    defineField({ name: "size", type: "string", description: "Example: 28 m²" }),
    defineField({ name: "bed", type: "string", description: "Example: King" }),
    defineField({ name: "description", type: "text", rows: 3 }),
    defineField({ name: "amenities", type: "array", of: [{ type: "string" }], options: { layout: "tags" } }),
    image,
    defineField({ name: "featured", type: "boolean", description: "Shown large on the home page. Pick one." }),
    defineField({ name: "available", type: "boolean", initialValue: true, description: "Untick to hide from the site." }),
  ],
  preview: { select: { title: "name", subtitle: "price", media: "image" } },
});

const menuItem = defineType({
  name: "menuItem",
  title: "Menu Item",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "price", title: "Price (₦)", type: "number", validation: (r) => r.required().min(0) }),
    defineField({
      name: "section",
      type: "string",
      options: { list: ["restaurant", "lounge"], layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      type: "string",
      options: { list: allCategories },
      validation: (r) => r.required(),
      description: "Must belong to the section chosen above.",
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

export const schemaTypes = [siteSettings, room, menuItem];
