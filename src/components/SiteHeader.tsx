"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cartCount, useCart } from "@/lib/cart";
import { PillLink } from "./ui";

const NAV = [
  { href: "/rooms", label: "Rooms" },
  { href: "/restaurant", label: "Restaurant" },
  { href: "/lounge", label: "Lounge" },
];

function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="group flex shrink-0 flex-col leading-none">
      <span className="display whitespace-nowrap text-[1.4rem] tracking-[0.01em] text-ink">
        Bliss Urban
      </span>
      <span className="mt-1 whitespace-nowrap border-t border-gold pt-1 text-[0.53rem] font-semibold uppercase tracking-[0.3em] text-gold-deep">
        Hotels &amp; Suites
      </span>
    </Link>
  );
}

function CartLink() {
  const count = cartCount(useCart());
  return (
    <Link
      href="/cart"
      className="press relative grid size-11 place-items-center rounded-full border border-ink/20 text-ink hover:border-ink/50 hover:bg-paper-2"
      aria-label={count ? `Order, ${count} item${count === 1 ? "" : "s"}` : "Order, empty"}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="size-5" aria-hidden>
        <path d="M4 7h16l-1.3 11.2a2 2 0 0 1-2 1.8H7.3a2 2 0 0 1-2-1.8L4 7ZM8.5 7V5a3.5 3.5 0 1 1 7 0v2" />
      </svg>
      {count > 0 ? (
        <span className="tabular absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.65rem] font-bold text-paper">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Escape closes it, and the page behind must not scroll while it is out.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const link = (href: string) =>
    `text-[0.78rem] font-semibold uppercase tracking-[0.14em] transition ${
      pathname === href ? "text-gold-deep" : "text-ink-2 hover:text-ink"
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[95rem] items-center gap-6 px-5 py-4 lg:px-12">
          <Wordmark />

          <nav aria-label="Sections" className="ml-14 hidden items-center gap-9 lg:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={link(n.href)}>
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <CartLink />
            {/* PillLink sets display:inline-flex itself, so the breakpoint lives
                on a wrapper or the two display utilities fight and lose. */}
            <div className="hidden sm:block">
              <PillLink href="/rooms">Reserve</PillLink>
            </div>
            <button
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              className="press grid size-11 place-items-center rounded-full border border-ink/20 text-ink lg:hidden"
            >
              <span className="sr-only">Open menu</span>
              <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.4" className="size-5" aria-hidden>
                <path d="M4 8h16M4 16h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* The drawer sits outside <header> on purpose: the header's
          backdrop-blur creates a containing block, which would trap a
          fixed-position child inside it. */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden={!open}
        className={`fixed inset-0 z-60 bg-black/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="mobile-nav"
        aria-label="Menu"
        /* inert takes the whole subtree out of the tab order while it is
           tucked away, so a closed drawer cannot be reached by keyboard. */
        inert={!open}
        className={`fixed right-0 top-0 z-70 flex h-dvh w-[min(21rem,86vw)] flex-col border-l border-gold/25 bg-paper transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <Wordmark onClick={() => setOpen(false)} />
          <button
            onClick={() => setOpen(false)}
            className="press grid size-11 place-items-center rounded-full border border-ink/25 text-ink hover:bg-paper-2"
          >
            <span className="sr-only">Close menu</span>
            <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className="size-5" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-2">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={`block border-b border-ink/10 py-5 text-sm font-semibold uppercase tracking-[0.16em] ${
                pathname === n.href ? "text-gold-deep" : "text-ink"
              }`}
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/cart"
            onClick={() => setOpen(false)}
            className="block border-b border-ink/10 py-5 text-sm font-semibold uppercase tracking-[0.16em] text-ink"
          >
            Your order
          </Link>
        </nav>

        <div className="border-t border-ink/10 p-5" onClick={() => setOpen(false)}>
          <PillLink href="/rooms" className="w-full">
            Reserve a room
          </PillLink>
        </div>
      </aside>
    </>
  );
}
