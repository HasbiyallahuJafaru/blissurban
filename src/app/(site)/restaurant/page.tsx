import type { Metadata } from "next";
import { MenuSection } from "@/components/MenuSection";
import { getMenu } from "@/sanity/lib/fetch";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Restaurant",
  description:
    "Pepper soup, rice and spaghetti at Bliss Urban Hotels & Suites, Narayi High Cost, Barnawa, Kaduna. Order to your room, to a table, or to take away.",
};

export default async function RestaurantPage() {
  const items = await getMenu("restaurant");

  return (
    <MenuSection
      section="restaurant"
      items={items}
      /* Ninety dishes across five courses. Stacked down one page it reads as a
         wall, so the courses open one at a time. */
      layout="cards"
      noun="dish"
      heroPhoto="photo-1504674900247-0877df9cc836"
      eyebrow="Ground floor, from 07:00"
      title="Pepper soup, the way"
      italic="it should taste."
      body="Catfish, goat meat, cow tail and kayan chiki, all cooked to order. Rice and spaghetti alongside. Pick a course below to see what is in it, then send it up to your room, take a table downstairs, or collect it on your way through."
    />
  );
}
