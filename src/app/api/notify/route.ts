import { NextResponse } from "next/server";
import { z } from "zod";
import { naira } from "@/lib/format";
import { priceList } from "@/sanity/lib/fetch";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TOPIC = {
  reservation: process.env.TELEGRAM_TOPIC_RESERVATIONS,
  restaurant: process.env.TELEGRAM_TOPIC_RESTAURANT,
  lounge: process.env.TELEGRAM_TOPIC_LOUNGE,
};

const contact = {
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(25),
  note: z.string().trim().max(500).optional(),
  /**
   * Hidden field. Bots fill it, people never see it. Deliberately permissive:
   * rejecting it in the schema would answer 400 and tell a bot the field
   * matters. It is checked below and answered 200 instead.
   */
  company: z.string().max(200).optional(),
  /** Milliseconds the form was open, measured by the client's own clock. */
  elapsed: z.number().nonnegative(),
};

const Payload = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("reservation"),
    roomId: z.string().min(1).max(120),
    checkIn: z.string().max(20),
    checkOut: z.string().max(20),
    guests: z.number().int().min(1).max(12),
    ...contact,
  }),
  z.object({
    type: z.literal("order"),
    lines: z.array(z.object({ id: z.string().min(1).max(120), qty: z.number().int().min(1).max(50) })).min(1).max(60),
    fulfilment: z.enum(["room", "table", "takeaway"]),
    place: z.string().trim().min(1).max(40),
    ...contact,
  }),
]);

// ponytail: in-memory bucket, so it resets per serverless instance. Enough to
// stop a naive flood; swap for Upstash if this ever gets targeted properly.
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  if (hits.size > 5_000) hits.clear();
  hits.set(ip, recent);
  return recent.length > 6;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const ref = () => `BU-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

async function sendToTelegram(text: string, threadId?: string) {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
      ...(threadId ? { message_thread_id: Number(threadId) } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Telegram ${res.status}: ${await res.text()}`);
}

const stamp = () =>
  new Date().toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  });

export async function POST(request: Request) {
  if (!TOKEN || !CHAT_ID) {
    return NextResponse.json(
      { ok: false, error: "Telegram is not configured on the server." },
      { status: 503 },
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many requests. Try again shortly." }, { status: 429 });
  }

  const parsed = Payload.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Some details are missing or invalid." }, { status: 400 });
  }
  const data = parsed.data;

  // Honeypot filled, or submitted faster than a person can type: drop it, but
  // answer 200 so a bot learns nothing from the response.
  if (data.company || data.elapsed < 2500) {
    return NextResponse.json({ ok: true, ref: ref() });
  }

  const who =
    `\n<b>Name:</b> ${esc(data.name)}` +
    `\n<b>Phone:</b> ${esc(data.phone)}` +
    (data.note ? `\n<b>Note:</b> ${esc(data.note)}` : "");

  const orderRef = ref();
  const prices = await priceList();

  try {
    if (data.type === "reservation") {
      const room = prices.get(data.roomId);
      if (!room) {
        return NextResponse.json({ ok: false, error: "That room is no longer listed." }, { status: 400 });
      }
      await sendToTelegram(
        `🔑 <b>ROOM REQUEST</b> · ${orderRef}\n` +
          `\n<b>${esc(room.name)}</b> — ${naira(room.price)} per night` +
          `\n<b>Check in:</b> ${esc(data.checkIn)}` +
          `\n<b>Check out:</b> ${esc(data.checkOut)}` +
          `\n<b>Guests:</b> ${data.guests}` +
          who +
          `\n\n<i>${stamp()}</i>`,
        TOPIC.reservation,
      );
      return NextResponse.json({ ok: true, ref: orderRef });
    }

    // Prices come from Sanity, never from the browser.
    const priced = data.lines.flatMap((l) => {
      const found = prices.get(l.id);
      return found ? [{ ...found, qty: l.qty, id: l.id }] : [];
    });
    if (priced.length === 0) {
      return NextResponse.json({ ok: false, error: "Those items are no longer available." }, { status: 400 });
    }

    const where =
      data.fulfilment === "room"
        ? `Room ${esc(data.place)}`
        : data.fulfilment === "table"
          ? `Table ${esc(data.place)}`
          : `Takeaway, pickup ${esc(data.place)}`;

    // The kitchen and the bar each get only their own lines, under one reference.
    const bySection = { restaurant: [] as typeof priced, lounge: [] as typeof priced };
    for (const line of priced) {
      (line.section === "lounge" ? bySection.lounge : bySection.restaurant).push(line);
    }

    const groups = (["restaurant", "lounge"] as const).filter((s) => bySection[s].length > 0);

    for (const section of groups) {
      const lines = bySection[section];
      const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
      const heading = section === "lounge" ? "🥂 <b>LOUNGE ORDER</b>" : "🍲 <b>RESTAURANT ORDER</b>";

      await sendToTelegram(
        `${heading} · ${orderRef}\n\n` +
          lines.map((l) => `${l.qty} × ${esc(l.name)} — ${naira(l.price * l.qty)}`).join("\n") +
          `\n<b>Total: ${naira(total)}</b>` +
          `\n\n<b>Deliver to:</b> ${where}` +
          who +
          (groups.length > 1 ? `\n\n<i>Part of a split order, see ${orderRef} in the other thread.</i>` : "") +
          `\n<i>${stamp()}</i>`,
        TOPIC[section],
      );
    }

    return NextResponse.json({ ok: true, ref: orderRef });
  } catch (err) {
    console.error("Telegram delivery failed:", err);
    return NextResponse.json(
      { ok: false, error: "We could not reach the front desk just now." },
      { status: 502 },
    );
  }
}
