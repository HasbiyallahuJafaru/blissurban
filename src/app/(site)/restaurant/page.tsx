import type { Metadata } from "next";
import { MenuSection } from "@/components/MenuSection";
import { getMenu } from "@/sanity/lib/fetch";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Restaurant",
  description:
    "Northern Nigerian and continental cooking in Barnawa, Kaduna. Order to your room, to a table, or to take away. The kitchen runs until midnight.",
};

export default async function RestaurantPage() {
  const items = await getMenu("restaurant");

  return (
    <MenuSection
      section="restaurant"
      items={items}
      eyebrow="Ground floor, from 07:00"
      title="Tuwo, suya, and"
      italic="a proper breakfast."
      body="The kitchen cooks northern food the way it should be cooked, and keeps a continental menu for the mornings you have a flight. Order to your room, to a table downstairs, or to take away."
    />
  );
}
