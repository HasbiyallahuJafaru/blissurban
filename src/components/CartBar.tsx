"use client";

import Link from "next/link";
import { cartCount, cartTotal, useCart } from "@/lib/cart";
import { naira } from "@/lib/format";
import { ArrowRight } from "./ui";

/** Appears only once something is in the order, so it never blocks an empty page. */
export function CartBar() {
  const lines = useCart();
  const count = cartCount(lines);
  if (count === 0) return null;

  return (
    <div className="on-ink sticky bottom-0 z-40 mt-16">
      <Link
        href="/cart"
        className="mx-auto flex max-w-[95rem] items-center justify-between gap-4 px-5 py-4 lg:px-12"
      >
        <div>
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-gold-bright">
            {count} item{count === 1 ? "" : "s"} in your order
          </p>
          <p className="tabular display mt-1 text-xl text-ink">{naira(cartTotal(lines))}</p>
        </div>
        <span className="press foil-fill inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.14em] shadow-[0_2px_0_rgba(0,0,0,0.45)] active:shadow-none">
          Check out
          <ArrowRight />
        </span>
      </Link>
    </div>
  );
}
