import { NextResponse } from "next/server";
import { z } from "zod";
import { asDate, asTime, naira, nightsBetween } from "@/lib/format";
import { priceList } from "@/sanity/lib/fetch";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TOPIC = {
  reservation: process.env.TELEGRAM_TOPIC_RESERVATIONS,
  restaurant: process.env.TELEGRAM_TOPIC_RESTAURANT,
  lounge: process.env.TELEGRAM_TOPIC_LOUNGE,
  laundry: process.env.TELEGRAM_TOPIC_LAUNDRY,
  transport: process.env.TELEGRAM_TOPIC_TRANSPORT,
};

/** One thread per department, so nobody reads orders meant for someone else. */
const DESK = {
  restaurant: { heading: "🍲 <b>RESTAURANT ORDER</b>", topic: TOPIC.restaurant },
  lounge: { heading: "🥂 <b>LOUNGE ORDER</b>", topic: TOPIC.lounge },
  laundry: { heading: "🧺 <b>LAUNDRY</b>", topic: TOPIC.laundry },
} as const;

type Desk = keyof typeof DESK;
const DESKS = Object.keys(DESK) as Desk[];

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
    // Generous, because the same form books the hall as well as a room.
    guests: z.number().int().min(1).max(1000),
    transfer: z.enum(["none", "arrival", "departure", "both"]).default("none"),
    transferPlace: z.string().trim().max(120).optional(),
    transferTime: z.string().trim().max(40).optional(),
    ...contact,
  }),
  z.object({
    type: z.literal("order"),
    lines: z.array(z.object({ id: z.string().min(1).max(120), qty: z.number().int().min(1).max(50) })).min(1).max(60),
    fulfilment: z.enum(["room", "table", "takeaway"]),
    place: z.string().trim().min(1).max(40),
    ...contact,
  }),
  /** Car hire booked on its own, without a room. */
  z.object({
    type: z.literal("transfer"),
    routeId: z.string().min(1).max(120),
    date: z.string().max(20),
    time: z.string().trim().min(1).max(20),
    trip: z.enum(["oneWay", "return"]),
    pickup: z.string().trim().min(1).max(120),
    passengers: z.number().int().min(1).max(12),
    ...contact,
  }),
]);

/**
 * Two limits, because they stop different things.
 *
 * Per IP catches one person hammering the form. The global budget catches a
 * distributed flood, and it is the one that matters most: Telegram refuses
 * more than roughly twenty messages a minute into a single chat, so without a
 * ceiling a flood does not merely spam the group, it wedges it, and real
 * bookings stop arriving while the desk sees nothing wrong.
 *
 * Both live in instance memory, so they reset per lambda and are best effort
 * by nature. The edge rule in the Vercel firewall is the real defence; this is
 * the floor underneath it, and the part that protects Telegram specifically.
 */
const WINDOW = 60_000;
/** Both are tunable without a deploy, and settable low to test the ceilings. */
const PER_IP = Number(process.env.NOTIFY_LIMIT_PER_IP ?? 6);
/** Messages, not requests: one mixed order sends three. Kept under Telegram's
 *  own per-chat ceiling so the group can never be talked into silence. */
const GLOBAL_MESSAGES = Number(process.env.NOTIFY_LIMIT_GLOBAL ?? 18);

const hits = new Map<string, number[]>();
/** When each message actually reached Telegram, newest last. */
const sent: number[] = [];

const fresh = (times: number[], now: number) => times.filter((t) => now - t < WINDOW);

/** Returns the reason a request is refused, or null to let it through. */
function rateLimited(ip: string): "ip" | "global" | null {
  const now = Date.now();

  // Prune expired entries rather than emptying the table. The previous version
  // called hits.clear() once it held 5,000 keys, which reset the attacker's own
  // counter along with everyone else's — an eviction that rewarded the flood.
  if (hits.size > 5_000) {
    for (const [key, times] of hits) {
      const live = fresh(times, now);
      if (live.length) hits.set(key, live);
      else hits.delete(key);
    }
  }

  // Checked before the per-IP bucket so a spread-out flood is caught too.
  // Anything already accepted runs to completion: refusing here, rather than
  // part-way through sending, is what stops an order arriving half-delivered.
  const live = fresh(sent, now);
  sent.length = 0;
  sent.push(...live);
  if (live.length >= GLOBAL_MESSAGES) return "global";

  const recent = fresh(hits.get(ip) ?? [], now);
  if (recent.length >= PER_IP) return "ip";

  recent.push(now);
  hits.set(ip, recent);
  return null;
}

/**
 * The client can put anything in x-forwarded-for, so the platform's own header
 * is preferred: reading the left-most forwarded value first let a determined
 * sender rotate a header string and get a clean bucket every time.
 */
function clientIp(request: Request) {
  return (
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
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
  // Counted here rather than at the door, because this is the number Telegram
  // actually meters: one submission can be one message or three.
  sent.push(Date.now());
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

  const limited = rateLimited(clientIp(request));
  if (limited) {
    // Deliberately the same wording either way. Telling a flood which ceiling
    // it hit tells it which one to work around.
    return NextResponse.json(
      { ok: false, error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "retry-after": "60" } },
    );
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
      const TRANSFER_LABEL = {
        arrival: "Pick up, to the hotel",
        departure: "Drop off, from the hotel",
        both: "Both ways",
      } as const;

      const transfer =
        data.transfer === "none"
          ? "\n<b>Transfer:</b> not needed"
          : `\n\n🚗 <b>TRANSFER — ${TRANSFER_LABEL[data.transfer]}</b>` +
            (data.transferPlace ? `\n<b>Where:</b> ${esc(data.transferPlace)}` : "") +
            (data.transferTime ? `\n<b>When:</b> ${esc(asTime(data.transferTime))}` : "") +
            `\n<i>Fare quoted separately.</i>`;

      const hall = room.kind === "hall";

      // The desk was handed a nightly rate and left to do the sum itself. It now
      // gets the multiplication too, so the figure the guest owes is on the
      // message rather than in somebody's head.
      const nights = nightsBetween(data.checkIn, data.checkOut);
      const unit = hall ? "day" : "night";
      const stay = nights
        ? `\n<b>${hall ? "Days" : "Nights"}:</b> ${nights}` +
          `\n<b>Total:</b> ${naira(room.price * nights)}  <i>(${nights} × ${naira(room.price)})</i>`
        : `\n<b>Total:</b> <i>dates unclear, confirm with the guest</i>`;

      await sendToTelegram(
        `${hall ? "🏛 <b>HALL REQUEST</b>" : "🔑 <b>ROOM REQUEST</b>"} · ${orderRef}\n` +
          `\n<b>${esc(room.name)}</b> — ${naira(room.price)} per ${unit}` +
          `\n<b>${hall ? "Event date" : "Check in"}:</b> ${esc(asDate(data.checkIn))}` +
          `\n<b>${hall ? "Until" : "Check out"}:</b> ${esc(asDate(data.checkOut))}` +
          stay +
          `\n<b>Guests:</b> ${data.guests}` +
          transfer +
          who +
          `\n\n<i>${stamp()}</i>`,
        TOPIC.reservation,
      );
      return NextResponse.json({ ok: true, ref: orderRef });
    }

    if (data.type === "transfer") {
      const route = prices.get(data.routeId);
      if (!route || route.section !== "transport") {
        return NextResponse.json({ ok: false, error: "That route is no longer listed." }, { status: 400 });
      }

      // Only the one-way fare is published, so a return quotes the leg we know
      // and flags the other rather than doubling a number nobody agreed to.
      const total =
        data.trip === "return"
          ? `\n<b>Total:</b> ${naira(route.price)} outward, return fare to confirm`
          : `\n<b>Total:</b> ${naira(route.price)}`;

      await sendToTelegram(
        `🚗 <b>CAR HIRE</b> · ${orderRef}\n` +
          `\n<b>${esc(route.name)}</b> — ${naira(route.price)} one way` +
          `\n<b>Trip:</b> ${data.trip === "return" ? "Return" : "One way"}` +
          total +
          `\n<b>Pick up from:</b> ${esc(data.pickup)}` +
          `\n<b>When:</b> ${esc(asDate(data.date))} at ${esc(asTime(data.time))}` +
          `\n<b>Passengers:</b> ${data.passengers}` +
          who +
          `\n\n<i>${stamp()}</i>`,
        TOPIC.transport,
      );
      return NextResponse.json({ ok: true, ref: orderRef });
    }

    // Prices come from Sanity, never from the browser. Anything that is not an
    // orderable line is dropped here rather than trusted: a room, a car hire
    // route, or a dish the kitchen prices on the day has no business arriving
    // as a cart line, whatever a crafted request claims.
    const priced = data.lines.flatMap((l) => {
      const found = prices.get(l.id);
      if (!found || found.onRequest) return [];
      return DESKS.includes(found.section as Desk)
        ? [{ ...found, section: found.section as Desk, qty: l.qty, id: l.id }]
        : [];
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

    // The kitchen, the bar and the laundry each get only their own lines,
    // under one shared reference.
    const bySection = new Map<Desk, typeof priced>();
    for (const line of priced) {
      const existing = bySection.get(line.section);
      if (existing) existing.push(line);
      else bySection.set(line.section, [line]);
    }

    const groups = DESKS.filter((s) => bySection.has(s));

    for (const section of groups) {
      const lines = bySection.get(section) ?? [];
      const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
      const { heading, topic } = DESK[section];

      await sendToTelegram(
        `${heading} · ${orderRef}\n\n` +
          lines.map((l) => `${l.qty} × ${esc(l.name)} — ${naira(l.price * l.qty)}`).join("\n") +
          `\n<b>Total: ${naira(total)}</b>` +
          `\n\n<b>${section === "laundry" ? "Collect from" : "Deliver to"}:</b> ${where}` +
          who +
          (groups.length > 1
            ? `\n\n<i>Part of a split order, see ${orderRef} in the other ${
                groups.length > 2 ? "threads" : "thread"
              }.</i>`
            : "") +
          `\n<i>${stamp()}</i>`,
        topic,
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
