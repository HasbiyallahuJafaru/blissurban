"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cartCount, useCart } from "@/lib/cart";
import { PillLink } from "./ui";

const NAV = [
  { href: "/rooms", label: "Rooms" },
  { href: "/restaurant", label: "Restaurant" },
  { href: "/lounge", label: "Lounge" },
];

function Wordmark() {
  return (
    <Link href="/" className="group flex shrink-0 flex-col leading-none">
      <span className="display whitespace-nowrap text-[1.35rem] tracking-[0.02em] text-bone transition group-hover:text-leaf-hi">
        Bliss Urban
      </span>
      <span className="mt-1 whitespace-nowrap border-t border-leaf/30 pt-1 text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-leaf/80">
        Hotels &amp; Suites
      </span>
    </Link>
  );
}

function CartLink({ onClick }: { onClick?: () => void }) {
  const count = cartCount(useCart());
  return (
    <Link
      href="/cart"
      onClick={onClick}
      className="press relative grid size-11 place-items-center rounded-full border border-leaf/30 text-leaf hover:border-leaf hover:bg-leaf/10"
      aria-label={count ? `Order, ${count} item${count === 1 ? "" : "s"}` : "Order, empty"}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="size-5" aria-hidden>
        <path d="M4 7h16l-1.3 11.2a2 2 0 0 1-2 1.8H7.3a2 2 0 0 1-2-1.8L4 7ZM8.5 7V5a3.5 3.5 0 1 1 7 0v2" />
      </svg>
      {count > 0 ? (
        <span className="tabular absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-leaf px-1 text-[0.65rem] font-bold text-hide">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const link = (href: string) =>
    `text-[0.82rem] font-semibold uppercase tracking-[0.14em] transition ${
      pathname === href ? "text-leaf" : "text-bone-dim hover:text-bone"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-leaf/12 bg-hide/88 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 lg:px-10">
        <Wordmark />

        <nav aria-label="Sections" className="hidden items-center gap-9 lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={link(n.href)}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <CartLink />
          {/* PillLink sets display:inline-flex itself, so the breakpoint has to
              live on a wrapper or the two display utilities fight and lose. */}
          <div className="hidden sm:block">
            <PillLink href="/rooms#request">Reserve</PillLink>
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="press grid size-11 place-items-center rounded-full border border-leaf/30 text-leaf lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.4" className="size-5" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <nav id="mobile-nav" aria-label="Sections" className="border-t border-leaf/12 px-5 pb-5 lg:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block border-b border-leaf/10 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-bone"
            >
              {n.label}
            </Link>
          ))}
          <PillLink href="/rooms#request" className="mt-5 w-full">
            Reserve a room
          </PillLink>
        </nav>
      ) : null}
    </header>
  );
}
