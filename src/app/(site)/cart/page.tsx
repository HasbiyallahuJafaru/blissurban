import type { Metadata } from "next";
import { CheckoutForm } from "@/components/forms/CheckoutForm";
import { Eyebrow } from "@/components/ui";
import { getSettings } from "@/sanity/lib/fetch";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false },
};

export default async function CartPage() {
  const settings = await getSettings();

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 lg:px-10 lg:py-16">
      <div className="max-w-2xl">
        <Eyebrow className="text-leaf">Almost there</Eyebrow>
        <h1 className="display mt-6 text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.02] text-bone">
          Check the order,
          <em className="block font-normal italic text-leaf">then tell us where you are.</em>
        </h1>
      </div>

      <div className="mt-12">
        <CheckoutForm whatsapp={settings.whatsapp} />
      </div>
    </section>
  );
}
