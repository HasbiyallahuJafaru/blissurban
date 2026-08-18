import type { Metadata } from "next";
import { MenuSection } from "@/components/MenuSection";
import { getMenu } from "@/sanity/lib/fetch";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Lounge",
  description:
    "Cocktails, chilled zobo, bottles and shisha in Barnawa, Kaduna. Hold a table, or send an order up to your room.",
};

export default async function LoungePage() {
  const items = await getMenu("lounge");

  return (
    <MenuSection
      section="lounge"
      items={items}
      heroPhoto="photo-1544148103-0773bf10d330"
      eyebrow="Open until late"
      title="Somewhere to sit"
      italic="after the meetings."
      body="Cocktails and bottles at one end, chilled zobo and kunu at the other, and shisha on the terrace. Order from a table downstairs or send it up to your room."
    />
  );
}
