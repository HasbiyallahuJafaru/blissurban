export const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

/**
 * The counter that opens each menu category, from a zero-based position.
 * Two digits, because the lounge runs to ten categories and "010" is not a
 * number anyone writes.
 */
export const step = (i: number) => String(i + 1).padStart(2, "0");
