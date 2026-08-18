"use client";

import type { ReactNode } from "react";

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
  "w-full rounded-xl border border-leaf/20 bg-hide/70 px-4 py-3 text-[0.95rem] text-bone " +
  "shadow-[inset_0_1px_3px_rgba(0,0,0,0.55)] placeholder:text-bone-dim/55 " +
  "transition focus:border-leaf/70 [color-scheme:dark]";

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
      <span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-leaf/85">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs text-bone-dim">{hint}</span> : null}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${wellClass} ${props.className ?? ""}`} />;
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
      <div className="plate p-6 text-center">
        <p className="display text-2xl text-leaf">Sent to the front desk</p>
        <p className="mt-3 text-sm leading-relaxed text-bone-dim">
          Your reference is{" "}
          <span className="tabular font-semibold text-bone">{state.ref}</span>. Someone will call you
          back to confirm. Nothing is booked or charged until they do.
        </p>
        <button
          onClick={onReset}
          className="press mt-6 rounded-full border border-leaf/35 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-leaf hover:bg-leaf/10"
        >
          Send another
        </button>
      </div>
    );
  }

  if (state.status === "failed") {
    return (
      <div className="plate border-leaf/40 p-6">
        <p className="text-sm font-semibold text-bone">{state.error}</p>
        <p className="mt-2 text-sm leading-relaxed text-bone-dim">
          Send it on WhatsApp instead and the front desk will pick it up there.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(fallbackText)}`}
            className="press leaf-field rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-hide"
          >
            Open WhatsApp
          </a>
          <button
            onClick={onReset}
            className="press rounded-full border border-leaf/35 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-leaf hover:bg-leaf/10"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return null;
}
