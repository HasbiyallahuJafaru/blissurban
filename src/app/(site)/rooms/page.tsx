import type { Metadata } from "next";
import { HallCard } from "@/components/HallCard";
import { JsonLd } from "@/components/JsonLd";
import { RoomCard } from "@/components/RoomCard";
import { Eyebrow, Knot } from "@/components/ui";
import { getRooms, getSettings } from "@/sanity/lib/fetch";
import { breadcrumbSchema, roomsSchema } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Rooms & Suites",
  alternates: { canonical: "/rooms" },
  description:
    "Six room types from Bliss Standard to the Classic Presidential Suite, plus a hall for events, in Barnawa, Kaduna. Every rate published.",
};

export default async function RoomsPage() {
  const [rooms, settings] = await Promise.all([getRooms(), getSettings()]);

  const bedrooms = rooms.filter((r) => r.kind !== "hall");
  const hall = rooms.find((r) => r.kind === "hall");

  return (
    <>
      <JsonLd data={roomsSchema(rooms)} />
      <JsonLd data={breadcrumbSchema("Rooms & Suites", "/rooms")} />
      <section className="mx-auto max-w-380 px-5 pt-14 lg:px-12 lg:pt-20">
        <div className="text-center">
          <Eyebrow className="justify-center text-gold-deep">{bedrooms.length} room types</Eyebrow>
          <h1 className="display mt-7 text-[clamp(2.6rem,5.4vw,4.2rem)] leading-none text-ink">
            Comfort at its best,
            <em className="block font-normal italic text-gold-deep">whatever your budget.</em>
          </h1>
        </div>
        <div className="max-w-2xl">
          <p className="mt-8 text-[0.98rem] leading-[1.8] text-ink-2">
            Whatever you can spend, you sleep well here. We look after every room the same way, so the
            smallest of them still feels like somewhere you chose rather than somewhere you settled
            for. Go higher and the space opens up and the quiet gets deeper. Open any room to see it
            properly, and when you ask for one, a person calls you back.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-380 px-5 py-20 lg:px-12 lg:py-28">
        <div className="grid gap-x-8 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
          {bedrooms.map((room, i) => (
            <RoomCard key={room._id} room={room} whatsapp={settings.whatsapp} priority={i < 2} />
          ))}
        </div>
      </section>

      {hall ? (
        <section className="mx-auto max-w-380 px-5 lg:px-12">
          <HallCard hall={hall} whatsapp={settings.whatsapp} />
        </section>
      ) : null}

      {/* ═══════════════════════════════════════════ the house rules
          Straight off the tariff sheet. Better read now than discovered
          at the desk with luggage in hand. */}
      {settings.policies?.length ? (
        <section className="mx-auto max-w-380 px-5 py-24 lg:px-12 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <Eyebrow className="text-gold-deep">Before you arrive</Eyebrow>
              <h2 className="display mt-6 text-[clamp(1.8rem,3.4vw,2.5rem)] leading-[1.06] text-ink">
                The house rules,
                <em className="block font-normal italic text-gold-deep">in full.</em>
              </h2>
              <p className="mt-6 max-w-sm text-[0.9rem] leading-[1.75] text-ink-2">
                The same notice that hangs at the reception desk. Nothing here is a surprise charge.
              </p>
            </div>

            <ul className="grid gap-x-10 gap-y-4 lg:col-span-8 lg:grid-cols-2">
              {settings.policies.map((rule) => (
                <li key={rule} className="flex gap-3 text-[0.88rem] leading-[1.7] text-ink-2">
                  <Knot className="mt-1.5 text-gold" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
