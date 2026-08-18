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
    <div className="sticky bottom-0 z-40 mt-12 border-t border-leaf/25 bg-hide/95 backdrop-blur-md">
      <Link
        href="/cart"
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-10"
      >
        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-leaf/80">
            {count} item{count === 1 ? "" : "s"} in your order
          </p>
          <p className="tabular display mt-0.5 text-xl text-bone">{naira(cartTotal(lines))}</p>
        </div>
        <span className="press leaf-field inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[0.82rem] font-semibold uppercase tracking-[0.12em] text-hide shadow-[0_2px_0_var(--color-leaf-lo)] active:shadow-none">
          Check out
          <ArrowRight />
        </span>
      </Link>
    </div>
  );
}
