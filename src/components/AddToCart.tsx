"use client";

import { useState } from "react";
import { addItem } from "@/lib/cart";
import type { MenuItem } from "@/sanity/lib/types";

export function AddToCart({ item }: { item: MenuItem }) {
  const [added, setAdded] = useState(false);

  return (
    <button
      onClick={() => {
        addItem({ id: item._id, name: item.name, price: item.price, section: item.section });
        setAdded(true);
        setTimeout(() => setAdded(false), 1300);
      }}
      className={`press w-20 shrink-0 rounded-full border px-3 py-2 text-[0.66rem] font-bold uppercase tracking-[0.14em] ${
        added
          ? "border-leaf bg-leaf text-hide"
          : "border-leaf/35 text-leaf hover:border-leaf hover:bg-leaf/10"
      }`}
    >
      <span aria-live="polite">{added ? "Added" : "Add"}</span>
      <span className="sr-only"> {item.name} to your order</span>
    </button>
  );
}
