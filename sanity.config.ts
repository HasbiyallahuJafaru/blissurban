"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { schemaTypes, PRICED_LIST_TYPES } from "@/sanity/schemaTypes";
import { categoryOrder } from "@/sanity/lib/seed";

/** The section key each document type belongs to, for looking up categories. */
const SECTION_OF: Record<string, keyof typeof categoryOrder> = {
  restaurantItem: "restaurant",
  loungeItem: "lounge",
  laundryItem: "laundry",
  transportItem: "transport",
};

export default defineConfig({
  basePath: "/studio",
  title: "Bliss Urban",
  projectId,
  dataset,
  apiVersion,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({
      /**
       * One entry per priced list, matching the four pages on the site, and
       * inside each one a folder per category in the order the tariff sheet
       * prints them. Everything used to sit in a single "Menu & Drinks" list
       * of two hundred items, which is no way to find one bottle.
       */
      structure: (S) =>
        S.list()
          .title("Bliss Urban")
          .items([
            S.listItem()
              .title("Site Settings")
              .id("siteSettings")
              .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
            S.divider(),
            S.documentTypeListItem("room").title("Rooms & Hall"),
            S.divider(),
            ...PRICED_LIST_TYPES.map(({ name, title }) =>
              S.listItem()
                .title(title)
                .id(name)
                .child(
                  S.list()
                    .title(title)
                    .items([
                      S.listItem()
                        .title(`All ${title.toLowerCase()} items`)
                        .id(`${name}-all`)
                        .child(S.documentTypeList(name).title(`All ${title.toLowerCase()} items`)),
                      S.divider(),
                      ...categoryOrder[SECTION_OF[name]].map((category) =>
                        S.listItem()
                          .title(category)
                          .id(`${name}-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`)
                          .child(
                            // documentTypeList rather than documentList: it keeps
                            // the schema type attached, so "create new" inside a
                            // folder still makes the right kind of document.
                            S.documentTypeList(name)
                              .title(category)
                              .filter("_type == $type && category == $category")
                              .params({ type: name, category })
                              // Required whenever a list carries a custom filter:
                              // without it the query is run against a floating
                              // API version, which Sanity is moving away from.
                              .apiVersion(apiVersion),
                          ),
                      ),
                    ]),
                ),
            ),
          ]),
    }),
  ],
});
