import type { Metadata } from "next";
import { CarHireForm } from "@/components/forms/CarHireForm";
import { MenuSection } from "@/components/MenuSection";
import { Eyebrow } from "@/components/ui";
import { getMenu, getSettings } from "@/sanity/lib/fetch";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Car Hire & Airport Pickup",
  description:
    "Fixed fares from Bliss Urban Hotels & Suites, Barnawa, Kaduna. Kaduna Airport, Zaria, Kano and Abuja, published in full. Book a driver without booking a room.",
};

export default async function CarHirePage() {
  const [routes, settings] = await Promise.all([getMenu("transport"), getSettings()]);

  return (
    <MenuSection
      section="transport"
      items={routes}
      /* A fare table, not a menu: no Add buttons, no cart bar. The booking
         form below carries the date and time a cart line cannot. */
      orderable={false}
      eyebrow="Kaduna, Zaria, Kano, Abuja"
      title="Fixed fares,"
      italic="agreed before you get in."
      body="Every route the hotel drives, with the price written down. No haggling at the gate and no surprise at the end. You do not need to be staying here to book one."
    >
      <section id="request" className="scroll-mt-28 pt-20">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <Eyebrow className="text-gold-deep">Book a driver</Eyebrow>
            <p className="mt-5 max-w-xs text-[0.88rem] leading-[1.75] text-ink-2 lg:sticky lg:top-28">
              Tell the desk where and when. Someone calls you back to confirm the driver and the fare
              before anything is agreed.
            </p>
          </div>

          <div className="lg:col-span-9">
            <CarHireForm routes={routes} whatsapp={settings.whatsapp} />
          </div>
        </div>
      </section>
    </MenuSection>
  );
}
