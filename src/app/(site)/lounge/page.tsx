import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { MenuSection } from "@/components/MenuSection";
import { getMenu } from "@/sanity/lib/fetch";
import { SITE, breadcrumbSchema, menuSchema } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Lounge",
  alternates: { canonical: "/lounge" },
  description:
    "Beer, wine, spirits and soft drinks at Bliss Urban Hotels & Suites, Barnawa, Kaduna. Order to a table downstairs or up to your room.",
};

export default async function LoungePage() {
  const items = await getMenu("lounge");

  return (
    <>
      <MenuSection
        section="lounge"
        items={items}
        /* Ninety-one bottles across ten shelves, the longest list on the site.
           Same treatment as the restaurant: open one shelf at a time. */
        layout="cards"
        noun="drink"
        heroPhoto="photo-1544148103-0773bf10d330"
        eyebrow="Open until late"
        title="Somewhere to sit"
        italic="when the day is done."
        body="Cold beer and good bottles, or something soft if you are driving. Open a shelf to see what is on it, then send your order down to a table or up to your room."
      />
      <JsonLd data={menuSchema("Lounge list", items, `${SITE}/lounge`)} />
      <JsonLd data={breadcrumbSchema("Lounge list", "/lounge")} />
    </>
  );
}
