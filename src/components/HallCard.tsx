"use client";

import { useRef } from "react";
import { picture } from "@/sanity/lib/image";
import type { Room } from "@/sanity/lib/types";
import { Plate } from "./Plate";
import { ReservationForm } from "./forms/ReservationForm";
import { ArrowRight, CloseButton, Eyebrow, PillButton, Rate, dialogClass, unitFor } from "./ui";

/**
 * The hall is on the same tariff sheet as the rooms but is nothing like one:
 * hired by the day, seated rather than slept in, and priced an order of
 * magnitude higher. It gets a band of its own under the room grid instead of a
 * card in it, where "Sleeps 2 · King" would be nonsense.
 */
export function HallCard({ hall, whatsapp }: { hall: Room; whatsapp: string }) {
  const booking = useRef<HTMLDialogElement>(null);

  return (
    <>
      <div className="plate-sunk grid items-center gap-10 p-9 lg:grid-cols-12 lg:gap-14 lg:p-14">
        <div className="aspect-16/10 overflow-hidden rounded-sm border border-ink/12 lg:col-span-5 lg:aspect-4/3">
          <Plate src={picture(hall.image, hall.photo, 1000)} alt={hall.name} seed="bliss-hall" />
        </div>

        <div className="lg:col-span-7">
          <Eyebrow className="text-gold-deep">Events</Eyebrow>
          <h2 className="display mt-6 text-[clamp(1.9rem,3.8vw,2.8rem)] leading-[1.05] text-ink">
            {hall.name},
            <em className="block font-normal italic text-gold-deep">by the day.</em>
          </h2>

          <p className="mt-6 max-w-md text-[0.95rem] leading-[1.8] text-ink-2">{hall.description}</p>

          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2.5">
            {hall.amenities.map((a) => (
              <li key={a} className="flex items-center gap-2.5 text-xs text-ink-2">
                <span className="size-1 shrink-0 rotate-45 bg-gold" />
                {a}
              </li>
            ))}
          </ul>

          <div className="foil-t mt-9 flex flex-wrap items-end justify-between gap-6 pt-7">
            <Rate room={hall} className="text-[2.2rem] text-ink" unit={unitFor(hall)} />
            <PillButton onClick={() => booking.current?.showModal()}>
              Ask about the hall
              <ArrowRight />
            </PillButton>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-ink-3">
            Seating depends on how you want the room laid out. Ask the desk and they will talk it
            through before you commit to a date.
          </p>
        </div>
      </div>

      <dialog
        ref={booking}
        aria-label={`Request ${hall.name}`}
        onClick={(e) => {
          if (e.target === booking.current) booking.current.close();
        }}
        className={dialogClass}
      >
        <div className="flex h-full flex-col">
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-ink/10 px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold-deep">
                Request the hall
              </p>
              <h3 className="display truncate text-xl leading-tight text-ink sm:text-2xl">{hall.name}</h3>
            </div>
            <CloseButton onClick={() => booking.current?.close()} />
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
              <ReservationForm rooms={[hall]} whatsapp={whatsapp} />
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
