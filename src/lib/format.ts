export const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

/**
 * The counter that opens each menu category, from a zero-based position.
 * Two digits, because the lounge runs to ten categories and "010" is not a
 * number anyone writes.
 */
export const step = (i: number) => String(i + 1).padStart(2, "0");

/**
 * A browser submits dates as yyyy-mm-dd and times as 24-hour hh:mm, whatever
 * the picker showed the guest. The desk reads dd/mm/yyyy on a twelve-hour
 * clock, so every message converts here on the way out, once, in one place.
 */
export const asDate = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
};

export const asTime = (value: string) => {
  const m = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!m) return value;
  const h = Number(m[1]);
  if (h > 23) return value;
  const suffix = h < 12 ? "am" : "pm";
  return `${h % 12 === 0 ? 12 : h % 12}:${m[2]} ${suffix}`;
};

/** Whole nights between two yyyy-mm-dd dates, or 0 if either will not parse. */
export const nightsBetween = (from: string, to: string) => {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86_400_000));
};
