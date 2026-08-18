import type { Metadata } from "next";
import { RoomCard } from "@/components/RoomCard";
import { Eyebrow } from "@/components/ui";
import { getRooms, getSettings } from "@/sanity/lib/fetch";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Rooms & Suites",
  description:
    "Single rooms through to a business suite that seats six, in Barnawa, Kaduna. Twenty-four hour power, fibre Wi-Fi, secure parking. Request a room and the front desk calls you back.",
};

export default async function RoomsPage() {
  const [rooms, settings] = await Promise.all([getRooms(), getSettings()]);

  return (
    <>
      <section className="mx-auto max-w-[95rem] px-5 pt-14 lg:px-12 lg:pt-20">
        <div className="max-w-2xl">
          <Eyebrow className="text-gold-deep">{rooms.length} room types</Eyebrow>
          <h1 className="display mt-7 text-[clamp(2.6rem,5.4vw,4.2rem)] leading-none text-ink">
            Every room has
            <em className="block font-normal italic text-gold-deep">the same power supply.</em>
          </h1>
          <p className="mt-8 text-[0.98rem] leading-[1.8] text-ink-2">
            The difference between them is space, not comfort. Open a room to look through the photos,
            then request it there. Nothing is charged and nothing is held automatically: the front desk
            checks what is actually free and rings the number you leave.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[95rem] px-5 py-20 lg:px-12 lg:py-28">
        <div className="grid gap-x-8 gap-y-20 sm:grid-cols-2 lg:grid-cols-4">
          {rooms.map((room, i) => (
            <RoomCard key={room._id} room={room} whatsapp={settings.whatsapp} priority={i < 2} />
          ))}
        </div>
      </section>
    </>
  );
}
