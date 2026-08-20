"use client";

import { useEffect, useRef, useState } from "react";
import { cartCount, cartTotal, useCart } from "@/lib/cart";
import { naira, step } from "@/lib/format";
import type { MenuItem } from "@/sanity/lib/types";
import { MenuRow } from "./MenuRow";
import { CloseButton, Eyelet, PillButton, dialogClass } from "./ui";

export type MenuGroup = { category: string; items: MenuItem[] };

/** "dish" -> "dishes", "drink" -> "drinks". Enough for the nouns we use. */
const plural = (noun: string, n: number) =>
  n === 1 ? noun : /(s|x|ch|sh)$/.test(noun) ? `${noun}es` : `${noun}s`;

/** Cheapest priced item in a group, ignoring anything priced on the day. */
function cheapest(items: MenuItem[]) {
  const priced = items.filter((i) => !i.onRequest).map((i) => i.price);
  return priced.length ? Math.min(...priced) : null;
}

/**
 * Ninety dishes in one scroll is not a menu, it is a wall. This shows the
 * categories as cards and opens one at a time in a dialog, so the reader picks
 * a course before reading any of it.
 *
 * One dialog is reused rather than one per category: with ten categories that
 * is ten fewer subtrees mounted, and only the open one is ever in the DOM.
 */
export function MenuGroups({
  groups,
  orderable,
  noun = "item",
}: {
  groups: MenuGroup[];
  orderable: boolean;
  /** Singular. Shown on each card as "17 dishes". */
  noun?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<MenuGroup | null>(null);

  // showModal() is imperative and runs before React commits, so opening from
  // the click handler would flash an empty dialog. Opening from an effect lets
  // the content render first.
  useEffect(() => {
    if (active) dialog.current?.showModal();
  }, [active]);

  const close = () => dialog.current?.close();

  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {groups.map((g, i) => {
          const from = cheapest(g.items);
          return (
            <li key={g.category}>
              <button
                onClick={() => setActive(g)}
                className="plate group flex w-full items-center gap-5 p-6 text-left transition hover:border-ink/35 lg:p-7"
              >
                <div className="min-w-0 flex-1">
                  <span className="tabular text-[0.62rem] font-semibold text-gold">{step(i)}</span>
                  <p className="display mt-2 text-[1.35rem] leading-tight text-ink">{g.category}</p>
                  <p className="tabular mt-2.5 text-[0.7rem] uppercase tracking-[0.14em] text-ink-3">
                    {g.items.length} {plural(noun, g.items.length)}
                    {from !== null ? ` · from ${naira(from)}` : ""}
                  </p>
                </div>
                <Eyelet />
              </button>
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialog}
        aria-label={active?.category ?? "Menu category"}
        /* Escape and the backdrop both fire close, so resetting here is the one
           place that has to remember to clear the open category. */
        onClose={() => setActive(null)}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
        className={dialogClass}
      >
        {active ? (
          <div className="flex h-full flex-col">
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-ink/10 px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold-deep">
                  {active.items.length} {plural(noun, active.items.length)}
                </p>
                <h2 className="display truncate text-xl leading-tight text-ink sm:text-2xl">
                  {active.category}
                </h2>
              </div>
              <CloseButton onClick={close} />
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="mx-auto w-full max-w-3xl px-4 pb-8 sm:px-6">
                <ul>
                  {active.items.map((item) => (
                    <MenuRow key={item._id} item={item} orderable={orderable} />
                  ))}
                </ul>
              </div>
            </div>

            {orderable ? <ModalFooter onDone={close} /> : null}
          </div>
        ) : null}
      </dialog>
    </>
  );
}

/**
 * The cart bar is behind the dialog's backdrop, so without this you could add
 * four things and watch nothing happen. Lives in its own component to keep the
 * cart subscription off the parent, which would otherwise re-render every card
 * on every tap of Add.
 */
function ModalFooter({ onDone }: { onDone: () => void }) {
  const lines = useCart();
  const count = cartCount(lines);

  return (
    <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-ink/10 bg-paper px-4 py-4 sm:px-6">
      <div aria-live="polite">
        {count > 0 ? (
          <>
            <p className="tabular display text-xl leading-none text-gold-deep">
              {naira(cartTotal(lines))}
            </p>
            <p className="mt-1.5 text-[0.58rem] uppercase tracking-[0.18em] text-ink-3">
              {count} item{count === 1 ? "" : "s"} in your order
            </p>
          </>
        ) : (
          <p className="text-xs text-ink-3">Nothing added yet</p>
        )}
      </div>
      <PillButton onClick={onDone}>Done</PillButton>
    </footer>
  );
}
