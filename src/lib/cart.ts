"use client";

import { useSyncExternalStore } from "react";
import type { Section } from "@/sanity/lib/types";

export type CartLine = {
  id: string;
  name: string;
  price: number;
  qty: number;
  section: Section;
};

const KEY = "bliss-cart";

let lines: CartLine[] = [];
const subscribers = new Set<() => void>();

// "use client" modules still execute during SSR, so only touch storage in a browser.
if (typeof window !== "undefined") {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (Array.isArray(saved)) lines = saved;
  } catch {
    // Corrupt or unreadable storage is not worth a crash; start empty.
  }
}

function commit(next: CartLine[]) {
  lines = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    // Private mode or a full quota. The cart still works for this session.
  }
  for (const notify of subscribers) notify();
}

function subscribe(notify: () => void) {
  subscribers.add(notify);
  return () => subscribers.delete(notify);
}

// Must return a stable reference or useSyncExternalStore re-renders forever.
const snapshot = () => lines;
const EMPTY: CartLine[] = [];
const serverSnapshot = () => EMPTY;

export function useCart() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

export function addItem(item: Omit<CartLine, "qty">, qty = 1) {
  const existing = lines.find((l) => l.id === item.id);
  commit(
    existing
      ? lines.map((l) => (l.id === item.id ? { ...l, qty: l.qty + qty } : l))
      : [...lines, { ...item, qty }],
  );
}

export function setQty(id: string, qty: number) {
  commit(qty <= 0 ? lines.filter((l) => l.id !== id) : lines.map((l) => (l.id === id ? { ...l, qty } : l)));
}

export const clearCart = () => commit([]);

export const cartTotal = (ls: CartLine[]) => ls.reduce((sum, l) => sum + l.price * l.qty, 0);
export const cartCount = (ls: CartLine[]) => ls.reduce((sum, l) => sum + l.qty, 0);
