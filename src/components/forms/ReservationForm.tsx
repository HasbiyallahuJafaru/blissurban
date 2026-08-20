"use client";

import { useEffect, useRef, useState } from "react";
import { naira } from "@/lib/format";
import { rate, type Room } from "@/sanity/lib/types";
import { PillButton, unitFor } from "../ui";
import { Field, Honeypot, Input, Result, Select, Textarea, postNotify, nowMs, type Submission } from "./fields";

const today = () => new Date().toISOString().slice(0, 10);

/** Airport and city transfers, in either direction or both. */
const TRANSFER = {
  none: { label: "None", blurb: "" },
  arrival: { label: "Pick me up", blurb: "A driver collects you and brings you to the hotel." },
  departure: { label: "Drop me off", blurb: "A driver takes you from the hotel to where you are going." },
  both: { label: "Both ways", blurb: "Collected on arrival and dropped off when you leave." },
} as const;

type TransferKey = keyof typeof TRANSFER;

export function ReservationForm({ rooms, whatsapp }: { rooms: Room[]; whatsapp: string }) {
  // Opened for the hall alone, the date fields mean something different, so
  // they say so. A mixed list is always rooms.
  const hall = rooms.length === 1 && rooms[0]?.kind === "hall";
  const [state, setState] = useState<Submission>({ status: "idle" });
  const [transfer, setTransfer] = useState<TransferKey>("none");
  const [fallback, setFallback] = useState("");
  // Recorded in an effect, not during render, so the component stays pure.
  const opened = useRef(0);
  useEffect(() => {
    opened.current = nowMs();
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? "");

    const room = rooms.find((r) => r._id === get("roomId"));
    const transferLine =
      transfer === "none"
        ? ""
        : ` I also need a transfer (${TRANSFER[transfer].label.toLowerCase()}) at ${get("transferPlace")}${
            get("transferTime") ? `, ${get("transferTime")}` : ""
          }.`;

    setFallback(
      `Hello Bliss Urban, I would like to request the ${room?.name ?? "room"} from ${get("checkIn")} to ${get("checkOut")} for ${get("guests")} guest(s).${transferLine} My name is ${get("name")}, ${get("phone")}.`,
    );

    setState({ status: "sending" });
    const result = await postNotify({
      type: "reservation",
      roomId: get("roomId"),
      checkIn: get("checkIn"),
      checkOut: get("checkOut"),
      guests: Number(get("guests")),
      transfer,
      transferPlace: get("transferPlace") || undefined,
      transferTime: get("transferTime") || undefined,
      name: get("name"),
      phone: get("phone"),
      note: get("note") || undefined,
      company: get("company"),
      elapsed: nowMs() - opened.current,
    });

    if (result.ok) {
      setState({ status: "sent", ref: result.ref });
      form.reset();
    } else {
      setState({ status: "failed", error: result.error });
    }
  }

  if (state.status === "sent" || state.status === "failed") {
    return (
      <Result
        state={state}
        whatsapp={whatsapp}
        fallbackText={fallback}
        onReset={() => {
          opened.current = nowMs();
          setState({ status: "idle" });
        }}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} className="plate relative p-6 lg:p-8">
      <Honeypot />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label={hall ? "Booking" : "Room type"}>
            {/* RoomCard's modal sets this by id when someone picks a room there. */}
            <Select
              id="roomId"
              name="roomId"
              required
              defaultValue={rooms.find((r) => r.featured)?._id ?? rooms[0]?._id}
            >
              {rooms.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} at {naira(rate(r))} {unitFor(r)}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label={hall ? "Event date" : "Check in"}>
          <Input type="date" name="checkIn" required min={today()} defaultValue={today()} />
        </Field>
        <Field label={hall ? "Until" : "Check out"} hint={hall ? "Same day is fine." : undefined}>
          <Input type="date" name="checkOut" required min={today()} />
        </Field>

        <Field label={hall ? "Guests expected" : "Guests"}>
          <Input
            type="number"
            name="guests"
            required
            min={1}
            max={hall ? 1000 : 12}
            defaultValue={hall ? 50 : 1}
            className="tabular"
          />
        </Field>
        <Field label="Your name">
          <Input name="name" required minLength={2} maxLength={80} autoComplete="name" placeholder="Ada Obi" />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Phone" hint="The front desk calls this number to confirm.">
            <Input
              type="tel"
              name="phone"
              required
              minLength={7}
              maxLength={25}
              autoComplete="tel"
              placeholder="0801 234 5678"
              className="tabular"
            />
          </Field>
        </div>

        {/* ------------------------------------------- airport / city transfer */}
        <div className="foil-t sm:col-span-2 sm:pt-7">
          <fieldset>
            <legend className="mb-3 block text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-gold-deep">
              Do you need a driver?
            </legend>

            <div role="radiogroup" aria-label="Transfer" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(Object.keys(TRANSFER) as TransferKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={transfer === key}
                  onClick={() => setTransfer(key)}
                  className={`press rounded-full border px-3 py-2.5 text-[0.66rem] font-bold uppercase tracking-widest ${
                    transfer === key
                      ? "border-ink bg-ink text-paper"
                      : "border-ink/25 text-ink-2 hover:border-ink/60 hover:text-ink"
                  }`}
                >
                  {TRANSFER[key].label}
                </button>
              ))}
            </div>

            {transfer === "none" ? (
              <p className="mt-3 text-xs text-ink-3">
                Fine. You can still arrange one later by calling the desk.
              </p>
            ) : (
              <>
                <p className="mt-3 text-xs text-ink-3">{TRANSFER[transfer].blurb}</p>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <Field
                    label={transfer === "departure" ? "Drop off at" : "Pick up from"}
                    hint="Airport, park, station, or an address."
                  >
                    <Input name="transferPlace" required maxLength={120} placeholder="Kaduna Airport" />
                  </Field>
                  <Field label="What time" hint="Your flight or arrival time is enough.">
                    <Input name="transferTime" maxLength={40} placeholder="14:30" className="tabular" />
                  </Field>
                </div>
              </>
            )}
          </fieldset>
        </div>

        <div className="sm:col-span-2">
          <Field label="Anything else" hint="Late arrival, a quiet floor, extra towels.">
            <Textarea name="note" rows={3} maxLength={500} />
          </Field>
        </div>
      </div>

      <PillButton type="submit" disabled={state.status === "sending"} className="mt-7 w-full">
        {state.status === "sending" ? "Sending" : "Send request"}
      </PillButton>

      <p className="mt-4 text-center text-xs leading-relaxed text-ink-2">
        This is a request, not a booking. No card details, no payment. A person confirms by phone.
      </p>
    </form>
  );
}
