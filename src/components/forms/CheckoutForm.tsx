"use client";

import { useEffect, useRef, useState } from "react";
import { cartTotal, clearCart, setQty, useCart } from "@/lib/cart";
import { naira } from "@/lib/format";
import { PillButton, PillLink } from "../ui";
import { Field, Honeypot, Input, Result, Textarea, postNotify, nowMs, type Submission } from "./fields";

const PLACE = {
  room: { label: "Room number", placeholder: "204", hint: "We bring it up on a tray." },
  table: { label: "Table number", placeholder: "7", hint: "Ask a server if you are unsure." },
  takeaway: { label: "Pickup time", placeholder: "19:30", hint: "Collect at the front desk." },
};

/* Laundry is never carried to a table or taken away, so an order made up of
   nothing else skips the choice and just asks which room to collect from. */
const COLLECT = {
  label: "Room number",
  placeholder: "204",
  hint: "Someone comes up to collect the bag.",
};

export function CheckoutForm({ whatsapp }: { whatsapp: string }) {
  const lines = useCart();
  const [fulfilment, setFulfilment] = useState<keyof typeof PLACE>("room");
  const [state, setState] = useState<Submission>({ status: "idle" });
  const [fallback, setFallback] = useState("");
  // Recorded in an effect, not during render, so the component stays pure.
  const opened = useRef(0);
  useEffect(() => {
    opened.current = nowMs();
  }, []);

  const total = cartTotal(lines);
  const laundryOnly = lines.length > 0 && lines.every((l) => l.section === "laundry");
  const place = laundryOnly ? COLLECT : PLACE[fulfilment];
  const mode = laundryOnly ? "room" : fulfilment;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "");

    setFallback(
      `Hello Bliss Urban, I would like to ${laundryOnly ? "send out laundry" : "order"}:\n${lines
        .map((l) => `${l.qty} x ${l.name}`)
        .join("\n")}\nTotal ${naira(total)}\n${place.label}: ${get("place")}\nName: ${get("name")}, ${get("phone")}`,
    );

    setState({ status: "sending" });
    const result = await postNotify({
      type: "order",
      lines: lines.map((l) => ({ id: l.id, qty: l.qty })),
      fulfilment: mode,
      place: get("place"),
      name: get("name"),
      phone: get("phone"),
      note: get("note") || undefined,
      company: get("company"),
      elapsed: nowMs() - opened.current,
    });

    if (result.ok) {
      setState({ status: "sent", ref: result.ref });
      clearCart();
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

  if (lines.length === 0) {
    return (
      <div className="plate p-10 text-center">
        <p className="display text-2xl text-ink">Nothing in your order yet</p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-2">
          Add something from the kitchen, the bar or the laundry and it will show up here.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <PillLink href="/restaurant">Restaurant menu</PillLink>
          <PillLink href="/lounge" variant="ghost">
            Lounge menu
          </PillLink>
          <PillLink href="/laundry" variant="ghost">
            Laundry list
          </PillLink>
        </div>
      </div>
    );
  }

  return (
    /* min-w-0 on both columns: a grid item defaults to min-width:auto, so
       anything inside that refuses to shrink (a nowrap button, a long dish
       name) widens the track and takes the whole page sideways with it. */
    <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:gap-12">
      {/* ------------------------------------------------------- the order */}
      <div className="plate min-w-0 p-6 lg:p-8">
        <h2 className="display text-xl text-ink">Your order</h2>

        {/* The stepper and the line total are ~200px of fixed furniture. Held
            on one row they leave a phone about 40px for the name, which
            truncates a dish to two letters, so the name takes the full width
            on its own until there is room to share. */}
        <ul className="mt-5">
          {lines.map((l) => (
            <li
              key={l.id}
              className="rule-ink flex flex-wrap items-center gap-x-4 gap-y-3 py-4 first:border-t-0 first:shadow-none"
            >
              <div className="w-full min-w-0 sm:w-auto sm:flex-1">
                <p className="text-[0.95rem] leading-snug wrap-break-word text-ink sm:truncate">
                  {l.name}
                </p>
                <p className="tabular mt-1 text-xs text-ink-2">
                  {naira(l.price)} each, {l.section}
                </p>
              </div>

              <div className="flex items-center gap-1 rounded-full border border-ink/20 p-1">
                <button
                  onClick={() => setQty(l.id, l.qty - 1)}
                  aria-label={`Remove one ${l.name}`}
                  className="press grid size-9 place-items-center rounded-full text-gold-deep hover:bg-paper-2 sm:size-8"
                >
                  {"\u2212"}
                </button>
                <span className="tabular w-6 text-center text-sm font-semibold text-ink">{l.qty}</span>
                <button
                  onClick={() => setQty(l.id, l.qty + 1)}
                  aria-label={`Add one ${l.name}`}
                  className="press grid size-9 place-items-center rounded-full text-gold-deep hover:bg-paper-2 sm:size-8"
                >
                  +
                </button>
              </div>

              <p className="tabular ml-auto shrink-0 text-right text-[0.95rem] text-gold-deep sm:ml-0 sm:w-24">
                {naira(l.price * l.qty)}
              </p>
            </li>
          ))}
        </ul>

        <div className="rule-ink mt-2 flex items-baseline justify-between pt-5">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-ink-2">Total</span>
          <span className="tabular display text-3xl text-gold-deep">{naira(total)}</span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-2">
          {laundryOnly
            ? "Pieces are counted at the desk when the bag is collected, and the total is confirmed then."
            : "Prices are confirmed by the kitchen when they see the order."}{" "}
          You pay on delivery or at the desk.
        </p>
      </div>

      {/* ---------------------------------------------------------- details */}
      <form onSubmit={onSubmit} className="plate relative h-fit min-w-0 p-6 lg:p-8">
        <Honeypot />
        <h2 className="display text-xl text-ink">
          {laundryOnly ? "Where do we collect it?" : "Where is it going?"}
        </h2>

        {laundryOnly ? null : (
          <div
            role="radiogroup"
            aria-label="Where is it going?"
            className="mt-5 grid grid-cols-3 gap-1 rounded-full border border-ink/20 p-1"
          >
            {(Object.keys(PLACE) as Array<keyof typeof PLACE>).map((key) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={fulfilment === key}
                onClick={() => setFulfilment(key)}
                className={`press rounded-full py-2.5 text-[0.66rem] font-bold uppercase tracking-widest ${
                  fulfilment === key ? "foil-fill text-paper" : "text-ink-2 hover:text-ink"
                }`}
              >
                {key === "room" ? "My room" : key === "table" ? "A table" : "Takeaway"}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 grid gap-5">
          <Field label={place.label} hint={place.hint}>
            <Input
              name="place"
              required
              maxLength={40}
              placeholder={place.placeholder}
              className="tabular"
            />
          </Field>
          <Field label="Your name">
            <Input name="name" required minLength={2} maxLength={80} autoComplete="name" />
          </Field>
          <Field label="Phone">
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
          <Field
            label="Anything else"
            hint={laundryOnly ? "Starch the shirts, do not tumble dry." : "No pepper, extra ice, allergies."}
          >
            <Textarea name="note" rows={3} maxLength={500} />
          </Field>
        </div>

        {/* the pill sets white-space:nowrap for its own sake; this span opts
            the label back out by inheritance, so a six-figure lounge total
            wraps instead of forcing the button wider than the phone */}
        <PillButton type="submit" disabled={state.status === "sending"} className="mt-7 w-full">
          <span className="whitespace-normal">
            {state.status === "sending"
              ? "Sending"
              : `${laundryOnly ? "Send request" : "Send order"}, ${naira(total)}`}
          </span>
        </PillButton>

        <p className="mt-4 text-center text-xs leading-relaxed text-ink-2">
          No payment here. It goes straight to the {laundryOnly ? "laundry" : "kitchen"} and you settle in
          person.
        </p>
      </form>
    </div>
  );
}
