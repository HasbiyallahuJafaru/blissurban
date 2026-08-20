"use client";

import { useRef, useState } from "react";
import { picture, unsplash } from "@/sanity/lib/image";
import type { Room } from "@/sanity/lib/types";
import { Plate } from "./Plate";
import { ReservationForm } from "./forms/ReservationForm";
import { ArrowRight, CloseButton, PillButton, Rate, dialogClass, unitFor } from "./ui";

/**
 * A room as a foil medallion. Opening it shows one large photo with a
 * thumbnail strip beneath, and requesting it hands off to a second modal
 * holding the booking form for that room alone.
 *
 * Both use native <dialog>, which brings the focus trap, Escape to close,
 * and the backdrop for free.
 */
export function RoomCard({
  room,
  whatsapp,
  priority,
}: {
  room: Room;
  whatsapp: string;
  priority: boolean;
}) {
  const viewer = useRef<HTMLDialogElement>(null);
  const booking = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState(0);

  const cover = picture(room.image, room.photo, 900);

  // Sanity photos win; the Unsplash gallery is only a stand-in. Each shot
  // carries its own thumbnail source, so the strip does not download four
  // full-size photos to render four 96px squares.
  const extra = room.images?.length
    ? room.images.map((img) => ({
        full: picture(img, undefined, 1400),
        thumb: picture(img, undefined, 220),
      }))
    : (room.gallery ?? []).map((id) => ({ full: unsplash(id, 1400), thumb: unsplash(id, 220) }));

  const shots = [
    { full: cover, thumb: picture(room.image, room.photo, 220) },
    ...extra,
  ].filter((s): s is { full: string; thumb: string | null } => Boolean(s.full));

  const main = shots[active]?.full ?? cover;

  function openBooking() {
    viewer.current?.close();
    booking.current?.showModal();
  }

  return (
    <>
      <article className="group text-center">
        <button
          onClick={() => viewer.current?.showModal()}
          aria-label={`View ${room.name}`}
          className="press mx-auto block aspect-square w-full max-w-72 overflow-hidden rounded-full border border-gold/40 p-1.5 transition duration-300 group-hover:border-gold/80"
        >
          <span className="block size-full overflow-hidden rounded-full">
            <Plate src={cover} alt={room.name} seed={room.name} priority={priority} />
          </span>
        </button>

        <h2 className="display mt-7 text-2xl text-ink">{room.name}</h2>
        <p className="mt-2 text-[0.7rem] uppercase tracking-[0.16em] text-ink-3">
          Sleeps {room.capacity}
          {room.bed ? ` · ${room.bed}` : ""}
          {room.size ? ` · ${room.size}` : ""}
        </p>
        <div className="mt-4">
          <Rate room={room} className="text-3xl text-gold-deep" unit={unitFor(room)} />
        </div>

        <button
          onClick={() => viewer.current?.showModal()}
          className="press mt-6 inline-flex items-center gap-2 rounded-full border border-ink/25 px-6 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink hover:border-ink/60 hover:bg-paper-2"
        >
          View room
          <ArrowRight />
        </button>
      </article>

      {/* ─────────────────────────────────────────────── viewer */}
      <dialog
        ref={viewer}
        aria-label={room.name}
        onClick={(e) => {
          if (e.target === viewer.current) viewer.current.close();
        }}
        className={dialogClass}
      >
        <div className="flex h-full flex-col">
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-ink/10 px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <h3 className="display truncate text-xl leading-tight text-ink sm:text-2xl">{room.name}</h3>
              <p className="mt-1 truncate text-[0.62rem] uppercase tracking-[0.16em] text-gold-deep">
                Sleeps {room.capacity}
                {room.bed ? ` · ${room.bed}` : ""}
                {room.size ? ` · ${room.size}` : ""}
              </p>
            </div>
            <CloseButton onClick={() => viewer.current?.close()} />
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6">
              {/* the one big photo */}
              <div className="aspect-4/3 overflow-hidden rounded-sm border border-gold/20 sm:aspect-16/10">
                <Plate src={main} alt={`${room.name}, photo ${active + 1}`} seed={`${room.name}-${active}`} />
              </div>

              {/* click through the rest */}
              {shots.length > 1 ? (
                <div
                  className="mt-3 flex gap-3 overflow-x-auto pb-1"
                  role="tablist"
                  aria-label={`${room.name} photos`}
                >
                  {shots.map((shot, i) => (
                    <button
                      key={i}
                      role="tab"
                      aria-selected={i === active}
                      aria-label={`Photo ${i + 1}`}
                      onClick={() => setActive(i)}
                      className={`press aspect-4/3 w-24 shrink-0 overflow-hidden rounded-sm border transition sm:w-28 ${
                        i === active ? "border-gold" : "border-ink/15 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Plate src={shot.thumb ?? shot.full} alt="" seed={`${room.name}-thumb-${i}`} priority />
                    </button>
                  ))}
                </div>
              ) : null}

              <p className="mt-7 text-[0.95rem] leading-[1.8] text-ink-2">{room.description}</p>

              <h4 className="foil-t mt-8 pt-6 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-gold-deep">
                In this room
              </h4>
              <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {room.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2.5 text-sm text-ink-2">
                    <span className="size-1 shrink-0 rotate-45 bg-gold" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-ink/10 bg-paper/60 px-4 py-4 backdrop-blur-md sm:px-6">
            <div>
              <Rate room={room} className="text-2xl text-ink sm:text-3xl" unit={unitFor(room)} />
            </div>
            <PillButton onClick={openBooking} className="flex-1 sm:flex-none">
              Request this room
              <ArrowRight />
            </PillButton>
          </footer>
        </div>
      </dialog>

      {/* ────────────────────────────────────────────── booking */}
      <dialog
        ref={booking}
        aria-label={`Request ${room.name}`}
        onClick={(e) => {
          if (e.target === booking.current) booking.current.close();
        }}
        className={dialogClass}
      >
        <div className="flex h-full flex-col">
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-ink/10 px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold-deep">
                Request a room
              </p>
              <h3 className="display truncate text-xl leading-tight text-ink sm:text-2xl">{room.name}</h3>
            </div>
            <CloseButton onClick={() => booking.current?.close()} />
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
              {/* only this room, so the select is already the right one */}
              <ReservationForm rooms={[room]} whatsapp={whatsapp} />
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
