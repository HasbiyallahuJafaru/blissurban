"use client";

import { useRef, useState, type ReactNode } from "react";
import { asDate, asTime } from "@/lib/format";

/**
 * Reading the clock is impure, so it lives here at module scope rather than in
 * a component body. Used to measure how long a form was open, which is how the
 * server tells a person from a bot that submits instantly.
 */
export const nowMs = () => Date.now();

export type Submission =
  | { status: "idle" | "sending" }
  | { status: "sent"; ref: string }
  | { status: "failed"; error: string };

export async function postNotify(
  body: unknown,
): Promise<{ ok: true; ref: string } | { ok: false; error: string }> {
  try {
    const res = await fetch("/api/notify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) {
      return { ok: false, error: json?.error ?? "Something went wrong. Please try again." };
    }
    return { ok: true, ref: json.ref as string };
  } catch {
    return { ok: false, error: "No connection. Check your network and try again." };
  }
}

const wellClass =
  "w-full rounded-sm border border-ink/18 bg-paper px-4 py-3 text-[0.95rem] text-ink " +
  "shadow-[inset_0_1px_3px_color-mix(in_srgb,var(--color-ink)_10%,transparent)] " +
  "placeholder:text-ink-3/70 transition focus:border-gold";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-gold-deep">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs text-ink-3">{hint}</span> : null}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${wellClass} ${props.className ?? ""}`} />;
}

/**
 * A date field that always reads dd/mm/yyyy, whatever the guest's browser
 * would otherwise show.
 *
 * `<input type="date">` renders its own text in the locale of the browser, and
 * HTML gives no way to override that: a phone set to US English shows
 * mm/dd/yyyy and there is no attribute that says otherwise. So the native
 * input stays, because it carries the value, the validation and the calendar
 * everyone already knows how to use, and its own text is made transparent and
 * ours painted over the top.
 *
 * Clicking anywhere in the field opens the calendar rather than only the small
 * icon at its edge.
 */
export function DateInput({
  name,
  required,
  min,
  defaultValue = "",
}: {
  name: string;
  required?: boolean;
  min?: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const ref = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    // showPicker throws if the browser does not have one, or if the click was
    // not judged a user gesture. Either way the native field still works.
    try {
      ref.current?.showPicker();
    } catch {
      /* the input handles it on its own */
    }
  };

  return (
    <div className="relative">
      <input
        ref={ref}
        type="date"
        name={name}
        required={required}
        min={min}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onClick={openPicker}
        className={`${wellClass} text-transparent [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[0.95rem] tabular"
      >
        {value ? <span className="text-ink">{asDate(value)}</span> : <span className="text-ink-3/70">dd/mm/yyyy</span>}
      </span>
    </div>
  );
}

/** The same trick for time, so the desk and the guest both read am/pm. */
export function TimeInput({
  name,
  required,
  defaultValue = "",
}: {
  name: string;
  required?: boolean;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <input
        ref={ref}
        type="time"
        name={name}
        required={required}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onClick={() => {
          try {
            ref.current?.showPicker();
          } catch {
            /* the input handles it on its own */
          }
        }}
        className={`${wellClass} text-transparent [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[0.95rem] tabular"
      >
        {value ? <span className="text-ink">{asTime(value)}</span> : <span className="text-ink-3/70">--:-- am</span>}
      </span>
    </div>
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${wellClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${wellClass} ${props.className ?? ""}`} />;
}

/** Off-screen but not display:none, so bots that skip hidden fields still fill it. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute left-[-9999px] top-0 h-px w-px overflow-hidden">
      <label>
        Company
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function Result({
  state,
  whatsapp,
  fallbackText,
  onReset,
}: {
  state: Submission;
  whatsapp: string;
  fallbackText: string;
  onReset: () => void;
}) {
  if (state.status === "sent") {
    return (
      <div className="plate p-8 text-center">
        <p className="display text-2xl text-ink">Sent to the front desk</p>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-[1.75] text-ink-2">
          Your reference is{" "}
          <span className="tabular font-semibold text-ink">{state.ref}</span>. Someone will call you
          back to confirm. Nothing is booked or charged until they do.
        </p>
        <button
          onClick={onReset}
          className="press mt-7 rounded-full border border-ink/25 px-6 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink hover:bg-paper-2"
        >
          Send another
        </button>
      </div>
    );
  }

  if (state.status === "failed") {
    return (
      <div className="plate border-gold/60 p-8">
        <p className="text-sm font-semibold text-ink">{state.error}</p>
        <p className="mt-2.5 text-sm leading-[1.75] text-ink-2">
          Send it on WhatsApp instead and the front desk will pick it up there.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(fallbackText)}`}
            className="press rounded-full bg-ink px-6 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-paper"
          >
            Open WhatsApp
          </a>
          <button
            onClick={onReset}
            className="press rounded-full border border-ink/25 px-6 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink hover:bg-paper-2"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return null;
}
