import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { MenuSection } from "@/components/MenuSection";
import { getMenu, getSettings } from "@/sanity/lib/fetch";
import { imageUrl } from "@/sanity/lib/image";
import { SITE, breadcrumbSchema, menuSchema } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Restaurant",
  alternates: { canonical: "/restaurant" },
  description:
    "Pepper soup, rice and spaghetti at Bliss Urban Hotels & Suites, Narayi High Cost, Barnawa, Kaduna. Order to your room, to a table, or to take away.",
};

export default async function RestaurantPage() {
  const [items, settings] = await Promise.all([getMenu("restaurant"), getSettings()]);

  return (
    <>
      <MenuSection
        section="restaurant"
        items={items}
        /* Ninety dishes across five courses. Stacked down one page it reads as a
           wall, so the courses open one at a time. */
        layout="cards"
        noun="dish"
        heroSrc={imageUrl(settings.restaurantImage, 2000)}
        eyebrow="Ground floor, from 07:00"
        title="Pepper soup, the way"
        italic="it should taste."
        body="Catfish, goat meat, cow tail and kayan chiki, all cooked to order. Rice and spaghetti alongside. Pick a course below to see what is in it, then send it up to your room, take a table downstairs, or collect it on your way through."
      />
      <JsonLd data={menuSchema("Restaurant menu", items, `${SITE}/restaurant`)} />
      <JsonLd data={breadcrumbSchema("Restaurant menu", "/restaurant")} />
    </>
  );
}
