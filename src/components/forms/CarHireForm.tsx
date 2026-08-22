"use client";

import { useEffect, useRef, useState } from "react";
import { asDate, asTime, naira } from "@/lib/format";
import type { MenuItem } from "@/sanity/lib/types";
import { PillButton } from "../ui";
import { DateInput, TimeInput, Field, Honeypot, Input, Result, Select, Textarea, postNotify, nowMs, type Submission } from "./fields";

const today = () => new Date().toISOString().slice(0, 10);

const TRIP = {
  oneWay: { label: "One way", blurb: "A single run to the destination." },
  return: {
    label: "Return",
    blurb: "The driver waits or comes back for you. The desk confirms the fare for the second leg.",
  },
} as const;

type TripKey = keyof typeof TRIP;

/**
 * A ride is booked rather than ordered: it needs a date and a time, which a
 * cart line cannot carry. Fares are the published ones and the form quotes
 * them, but the server prices the route again from its own id before it
 * reaches the front desk.
 */
export function CarHireForm({ routes, whatsapp }: { routes: MenuItem[]; whatsapp: string }) {
  const [state, setState] = useState<Submission>({ status: "idle" });
  const [trip, setTrip] = useState<TripKey>("oneWay");
  const [routeId, setRouteId] = useState(routes[0]?._id ?? "");
  const [fallback, setFallback] = useState("");
  // Recorded in an effect, not during render, so the component stays pure.
  const opened = useRef(0);
  useEffect(() => {
    opened.current = nowMs();
  }, []);

  const route = routes.find((r) => r._id === routeId) ?? routes[0];

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? "");

    setFallback(
      `Hello Bliss Urban, I would like to book a car: ${route?.name ?? "a route"}` +
        ` (${TRIP[trip].label.toLowerCase()}) on ${asDate(get("date"))} at ${asTime(get("time"))}` +
        `, picking up from ${get("pickup")}, ${get("passengers")} passenger(s).` +
        ` My name is ${get("name")}, ${get("phone")}.`,
    );

    setState({ status: "sending" });
    const result = await postNotify({
      type: "transfer",
      routeId,
      date: get("date"),
      time: get("time"),
      trip,
      pickup: get("pickup"),
      passengers: Number(get("passengers")),
      name: get("name"),
      phone: get("phone"),
      note: get("note") || undefined,
      company: get("company"),
      elapsed: nowMs() - opened.current,
    });

    if (result.ok) {
      setState({ status: "sent", ref: result.ref });
      form.reset();
      setTrip("oneWay");
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

  if (routes.length === 0) {
    return (
      <div className="plate p-10 text-center">
        <p className="display text-2xl text-ink">No routes listed just now</p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-2">
          Call the front desk and they will quote you directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="plate relative p-6 lg:p-8">
      <Honeypot />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Where are you going?">
            <Select
              name="routeId"
              required
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
            >
              {routes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} — {naira(r.price)}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Pick up from" hint="The hotel, an address, the airport arrivals hall.">
            <Input name="pickup" required maxLength={120} defaultValue="Bliss Urban Hotel" />
          </Field>
        </div>

        <Field label="Date">
          <DateInput name="date" required min={today()} defaultValue={today()} />
        </Field>
        <Field label="Time" hint="Your flight time is enough.">
          <TimeInput name="time" required />
        </Field>

        <div className="sm:col-span-2">
          <fieldset>
            <legend className="mb-3 block text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-gold-deep">
              One way or return?
            </legend>
            <div role="radiogroup" aria-label="Trip" className="grid grid-cols-2 gap-2">
              {(Object.keys(TRIP) as TripKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={trip === key}
                  onClick={() => setTrip(key)}
                  className={`press rounded-full border px-3 py-2.5 text-[0.66rem] font-bold uppercase tracking-widest ${
                    trip === key
                      ? "border-ink bg-ink text-paper"
                      : "border-ink/25 text-ink-2 hover:border-ink/60 hover:text-ink"
                  }`}
                >
                  {TRIP[key].label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-3">{TRIP[trip].blurb}</p>
          </fieldset>
        </div>

        <Field label="Passengers">
          <Input type="number" name="passengers" required min={1} max={12} defaultValue={1} className="tabular" />
        </Field>
        <Field label="Your name">
          <Input name="name" required minLength={2} maxLength={80} autoComplete="name" placeholder="Ada Obi" />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Phone" hint="The driver calls this number when he is outside.">
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
          <Field label="Anything else" hint="Luggage, a child seat, a stop on the way.">
            <Textarea name="note" rows={3} maxLength={500} />
          </Field>
        </div>
      </div>

      <PillButton type="submit" disabled={state.status === "sending"} className="mt-7 w-full">
        {state.status === "sending"
          ? "Sending"
          : route
            ? `Request this car, ${naira(route.price)}`
            : "Request this car"}
      </PillButton>

      <p className="mt-4 text-center text-xs leading-relaxed text-ink-2">
        This is a request, not a booking. No card details, no payment. The front desk confirms the fare
        and the driver by phone.
      </p>
    </form>
  );
}
