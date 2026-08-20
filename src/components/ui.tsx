import Link from "next/link";
import type { ReactNode } from "react";
import { naira } from "@/lib/format";
import { isReduced, rate, type Room } from "@/sanity/lib/types";

/* The mark that opens every section: two interlaced squares, the geometry
   that runs through northern Nigerian relief and textile work. */
export function Knot({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden className={`size-2.5 shrink-0 ${className}`}>
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="1.5" y="1.5" width="9" height="9" transform="rotate(45 6 6)" />
        <rect x="3.25" y="3.25" width="5.5" height="5.5" />
      </g>
    </svg>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`flex items-center gap-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] ${className}`}
    >
      <Knot />
      {children}
    </p>
  );
}

const pill = (variant: "solid" | "ghost" | "onInk") =>
  [
    "press inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5",
    "text-[0.78rem] font-semibold uppercase tracking-[0.14em] whitespace-nowrap",
    variant === "solid" && "bg-ink text-paper shadow-[0_2px_0_var(--color-gold)] hover:bg-ink-2 active:shadow-none",
    variant === "ghost" &&
      "border border-ink/25 text-ink shadow-[0_2px_0_color-mix(in_srgb,var(--color-gold)_45%,transparent)] hover:border-ink/60 hover:bg-paper-2 active:shadow-none",
    variant === "onInk" &&
      "foil-fill shadow-[0_2px_0_rgba(0,0,0,0.5)] hover:brightness-105 active:shadow-none",
  ]
    .filter(Boolean)
    .join(" ");

type PillProps = {
  children: ReactNode;
  variant?: "solid" | "ghost" | "onInk";
  className?: string;
};

export function PillLink({ href, children, variant = "solid", className = "" }: PillProps & { href: string }) {
  return (
    <Link href={href} className={`${pill(variant)} ${className}`}>
      {children}
    </Link>
  );
}

export function PillButton({
  children,
  variant = "solid",
  className = "",
  ...rest
}: PillProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${pill(variant)} disabled:opacity-45 ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`size-4 ${className}`}>
      <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/** A struck foil disc. Fills on hover of its parent card. */
export function Eyelet({ className = "" }: { className?: string }) {
  return (
    <span
      className={`grid size-11 shrink-0 place-items-center rounded-full border border-gold/50 text-gold-deep transition duration-200 group-hover:border-ink group-hover:bg-ink group-hover:text-paper ${className}`}
    >
      <ArrowRight />
    </span>
  );
}

/**
 * A full-bleed native <dialog>. Used by the room viewer, the hall and the menu
 * categories, so the three read as one thing. showModal() brings the focus
 * trap, Escape to close and the backdrop with it.
 */
export const dialogClass =
  "m-0 h-dvh max-h-none w-screen max-w-none bg-paper p-0 text-ink " +
  "backdrop:bg-black/85 backdrop:backdrop-blur-sm";

/** The round close control every dialog carries in its top right. */
export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Close"
      className="press grid size-11 shrink-0 place-items-center rounded-full border border-ink/25 text-ink hover:bg-paper-2"
    >
      <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className="size-5" aria-hidden>
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  );
}

/**
 * What the guest pays, with the tariff sheet's standard rate struck through
 * beside it when the hotel is discounting. The strike is sized in `em` so it
 * tracks whatever type size the caller sets.
 */
export function Rate({ room, className = "", unit }: { room: Room; className?: string; unit?: string }) {
  return (
    <>
      <p className={`tabular display leading-none ${className}`}>
        {naira(rate(room))}
        {isReduced(room) ? (
          <>
            <span className="ml-2.5 align-middle text-[0.48em] font-normal text-ink-3 line-through decoration-gold/70 decoration-1">
              {naira(room.price)}
            </span>
            <span className="sr-only">, reduced from {naira(room.price)}</span>
          </>
        ) : null}
      </p>
      {unit ? (
        <p className="mt-2 text-[0.6rem] uppercase tracking-[0.18em] text-ink-3">{unit}</p>
      ) : null}
    </>
  );
}

/** Halls are hired by the day, rooms by the night. */
export const unitFor = (room: Room) => (room.kind === "hall" ? "per day" : "per night");

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-gold/45 px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-gold-deep">
      {children}
    </span>
  );
}

/**
 * Section opener. Deliberately off-axis: the index sits out in the margin and
 * the heading hangs left of the content it introduces.
 */
export function SectionHead({
  index,
  eyebrow,
  title,
  italic,
  href,
  linkLabel,
  body,
  className = "",
}: {
  index?: string;
  eyebrow: string;
  title: string;
  italic?: string;
  href?: string;
  linkLabel?: string;
  body?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-baseline gap-5">
        {index ? (
          <span className="tabular display text-sm text-gold">{index}</span>
        ) : null}
        <Eyebrow className="text-gold-deep">{eyebrow}</Eyebrow>
      </div>

      <h2 className="display mt-6 text-[clamp(2.1rem,4.6vw,3.4rem)] leading-[1.02] text-ink">
        {title}
        {italic ? <em className="block font-normal italic text-gold-deep">{italic}</em> : null}
      </h2>

      {body ? <p className="mt-6 max-w-sm text-[0.95rem] leading-[1.75] text-ink-2">{body}</p> : null}

      {href && linkLabel ? (
        <Link
          href={href}
          className="group mt-8 inline-flex items-center gap-3 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-ink"
        >
          <span className="border-b border-gold pb-1 transition group-hover:border-ink">{linkLabel}</span>
          <ArrowRight className="text-gold-deep transition group-hover:translate-x-1" />
        </Link>
      ) : null}
    </div>
  );
}

const ICONS: Record<string, ReactNode> = {
  power: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  gate: <path d="M3 21V9l9-6 9 6v12M3 13h18M8 21V11M12 21V9.5M16 21V11" />,
  signal: <path d="M2 8.5a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16.5a5 5 0 0 1 6 0M12 20.5h.01" />,
  pot: <path d="M4 9h16v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9ZM2 9h20M8 5.5c0-1 1-1.5 1-2.5M12 5.5c0-1 1-1.5 1-2.5M16 5.5c0-1 1-1.5 1-2.5" />,
  key: <path d="M15.5 3a5.5 5.5 0 1 0-4.6 8.6L3 19.5V22h3l1-2h2l1-2h2l1.5-2.6A5.5 5.5 0 0 0 15.5 3Zm1.5 4.5h.01" />,
  broom: <path d="M14 3 8.5 12M4 21l5-9h6l-2 9H4ZM11 16h4" />,
};

export function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      className={`size-6 ${className}`}
    >
      {ICONS[name] ?? ICONS.key}
    </svg>
  );
}
