import type { Metadata } from "next";
import { Plate } from "@/components/Plate";
import { ReservationForm } from "@/components/forms/ReservationForm";
import { Eyebrow, SectionHead } from "@/components/ui";
import { naira } from "@/lib/format";
import { getRooms, getSettings } from "@/sanity/lib/fetch";
import { imageUrl } from "@/sanity/lib/image";

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
      <section className="mx-auto max-w-7xl px-5 pt-12 lg:px-10 lg:pt-16">
        <div className="max-w-2xl">
          <Eyebrow className="text-leaf">{rooms.length} room types</Eyebrow>
          <h1 className="display mt-6 text-[clamp(2.6rem,6vw,4.4rem)] leading-[1] text-bone">
            Every room has
            <em className="block font-normal italic text-leaf">the same power supply.</em>
          </h1>
          <p className="mt-7 text-[0.98rem] leading-[1.7] text-bone-dim">
            The difference between them is space, not comfort. Pick the size you need, send a request, and
            the front desk will call to confirm what is free on your dates.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          {rooms.map((room, i) => (
            <article key={room._id} className="plate overflow-hidden">
              <div className="aspect-16/10 overflow-hidden border-b border-leaf/12">
                <Plate
                  src={imageUrl(room.image, 900)}
                  alt={room.name}
                  seed={room.name}
                  priority={i < 2}
                />
              </div>

              <div className="p-6 lg:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="display text-2xl text-bone">{room.name}</h2>
                    <p className="mt-1.5 text-xs uppercase tracking-[0.14em] text-bone-dim">
                      Sleeps {room.capacity}
                      {room.bed ? ` · ${room.bed}` : ""}
                      {room.size ? ` · ${room.size}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="tabular display text-2xl text-leaf">{naira(room.price)}</p>
                    <p className="text-[0.62rem] uppercase tracking-[0.16em] text-bone-dim">per night</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-bone-dim">{room.description}</p>

                <ul className="tooled-t mt-5 flex flex-wrap gap-x-5 gap-y-2 pt-5">
                  {room.amenities.map((a) => (
                    <li key={a} className="flex items-center gap-2 text-xs text-bone-dim">
                      <span className="size-1 shrink-0 rotate-45 bg-leaf" />
                      {a}
                    </li>
                  ))}
                </ul>

                <a
                  href="#request"
                  className="press mt-6 inline-flex w-full items-center justify-center rounded-full border border-leaf/35 px-6 py-3 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-leaf hover:bg-leaf/10"
                >
                  Request {room.name}
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="request" className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
          <SectionHead
            eyebrow="Request a room"
            title="Tell us the dates,"
            italic="we will call you back."
            body="Nothing is charged and nothing is held automatically. The front desk checks what is actually free and rings the number you leave."
          />
          <ReservationForm rooms={rooms} whatsapp={settings.whatsapp} />
        </div>
      </section>
    </>
  );
}
