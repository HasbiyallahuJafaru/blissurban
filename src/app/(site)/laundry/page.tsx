import type { Metadata } from "next";
import { MenuSection } from "@/components/MenuSection";
import { getMenu } from "@/sanity/lib/fetch";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Laundry",
  description:
    "Washing, ironing and starching at Bliss Urban Hotels & Suites, Narayi High Cost, Barnawa, Kaduna. Priced by the piece, collected from your room.",
};

export default async function LaundryPage() {
  const items = await getMenu("laundry");

  return (
    <MenuSection
      section="laundry"
      items={items}
      /* No stand-in photo: the foil panel is honest about there being no
         photograph of this hotel's laundry yet. */
      eyebrow="Left by 09:00, back the same day"
      title="Someone else can"
      italic="press the shirts."
      body="Washing, ironing and starching, priced by the piece so you know the bill before you hand anything over. Tick what is in the bag, give your room number, and the desk sends someone up for it."
    />
  );
}
