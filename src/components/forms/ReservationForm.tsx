"use client";

import { useEffect, useRef, useState } from "react";
import { naira } from "@/lib/format";
import type { Room } from "@/sanity/lib/types";
import { PillButton } from "../ui";
import { Field, Honeypot, Input, Result, Select, Textarea, postNotify, nowMs, type Submission } from "./fields";

const today = () => new Date().toISOString().slice(0, 10);

export function ReservationForm({ rooms, whatsapp }: { rooms: Room[]; whatsapp: string }) {
  const [state, setState] = useState<Submission>({ status: "idle" });
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
    setFallback(
      `Hello Bliss Urban, I would like to request the ${room?.name ?? "room"} from ${get("checkIn")} to ${get("checkOut")} for ${get("guests")} guest(s). My name is ${get("name")}, ${get("phone")}.`,
    );

    setState({ status: "sending" });
    const result = await postNotify({
      type: "reservation",
      roomId: get("roomId"),
      checkIn: get("checkIn"),
      checkOut: get("checkOut"),
      guests: Number(get("guests")),
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
          <Field label="Room type">
            <Select name="roomId" required defaultValue={rooms.find((r) => r.featured)?._id ?? rooms[0]?._id}>
              {rooms.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} at {naira(r.price)} per night
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Check in">
          <Input type="date" name="checkIn" required min={today()} defaultValue={today()} />
        </Field>
        <Field label="Check out">
          <Input type="date" name="checkOut" required min={today()} />
        </Field>

        <Field label="Guests">
          <Input type="number" name="guests" required min={1} max={12} defaultValue={1} className="tabular" />
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

        <div className="sm:col-span-2">
          <Field label="Anything else" hint="Airport pickup, late arrival, a quiet floor.">
            <Textarea name="note" rows={3} maxLength={500} />
          </Field>
        </div>
      </div>

      <PillButton type="submit" disabled={state.status === "sending"} className="mt-7 w-full">
        {state.status === "sending" ? "Sending" : "Send request"}
      </PillButton>

      <p className="mt-4 text-center text-xs leading-relaxed text-bone-dim">
        This is a request, not a booking. No card details, no payment. A person confirms by phone.
      </p>
    </form>
  );
}
