# Bliss Urban Hotels & Suites

The website for a business hotel in Barnawa, Kaduna. Guests request a room, order
from the restaurant, or order from the lounge, and each request lands in the staff
Telegram group within a second.

There is no database, no login, and no payment processor. Every submission is an
enquiry that a person confirms.

---

## How it works

```
guest's browser
      |
      |  POST /api/notify   (ids and quantities only, never prices)
      v
Next.js route handler on Vercel
      |  holds TELEGRAM_BOT_TOKEN, recomputes every total from Sanity
      v
Telegram supergroup
   Reservations topic  |  Restaurant topic  |  Lounge topic
```

Content lives in Sanity. Management edits rooms, dishes, drinks and prices in a
browser at `/studio`, and a webhook drops the affected pages so the change is live
within seconds without a redeploy.

## Stack

| Piece | Choice |
|---|---|
| Framework | Next.js 16 (App Router, React 19, Turbopack) |
| Styling | Tailwind v4, CSS-first tokens in `src/app/globals.css` |
| CMS | Sanity 6 via `next-sanity` 13, Studio embedded at `/studio` |
| Validation | zod, on the API boundary only |
| Hosting | Vercel |

No component library. No state library: the cart is a module store read through
`useSyncExternalStore`, so there is no provider to thread through the tree.

## Running it

```bash
npm install
cp .env.example .env.local     # works with everything left blank
npm run dev
```

The site is fully browsable with no credentials at all. Every Sanity read falls back
to `src/sanity/lib/seed.ts`, and a "demo content" ribbon shows while that fallback is
in use. Add a Sanity project id and the ribbon disappears.

```bash
npm run build       # production build
npm run lint        # eslint
npx tsc --noEmit    # typecheck
```

## Setting up Sanity

1. Create a project at [sanity.io/manage](https://sanity.io/manage), dataset `production`.
2. Put the project id in `.env.local` as `NEXT_PUBLIC_SANITY_PROJECT_ID`.
3. Restart the dev server and open `/studio`.
4. Add rooms and menu items. Create one **Site Settings** document for contact
   details, hero copy and amenities.

To make published edits appear immediately, add a webhook in Sanity
(API → Webhooks) pointing at `https://your-domain/api/revalidate`, method POST,
with the same secret you set as `SANITY_REVALIDATE_SECRET`.

## Setting up Telegram

1. Message [@BotFather](https://t.me/BotFather), send `/newbot`, copy the token.
2. Create a group, turn on **Topics**, and add the bot as an administrator.
3. Create three topics: Reservations, Restaurant, Lounge.
4. Send a message in the group, then open
   `https://api.telegram.org/bot<TOKEN>/getUpdates` and read `chat.id` (a negative
   number starting `-100`) and each topic's `message_thread_id`.
5. Fill in `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` and the three topic ids.

`TELEGRAM_BOT_TOKEN` must never be prefixed with `NEXT_PUBLIC_`. That prefix ships a
variable to the browser, and anyone could then post to the group as the hotel.

## Project layout

```
src/
  app/
    (site)/            public pages, wrapped in the header and footer
      page.tsx         home
      rooms/           room list and the booking request form
      restaurant/      food menu, add to order
      lounge/          drinks and shisha, add to order
      cart/            checkout: where it goes, who to call
    studio/            embedded Sanity Studio, no site chrome
    api/notify/        the only code that knows the Telegram token
    api/revalidate/    Sanity publish webhook
  components/
    ui.tsx             eyebrow, pills, eyelet, section head, icons
    Plate.tsx          image slot, with a drawn placeholder when there is no photo
    MenuSection.tsx    shared by restaurant and lounge
    forms/             reservation and checkout
  lib/
    cart.ts            module store, localStorage, useSyncExternalStore
    format.ts          naira formatting
  sanity/
    schemaTypes/       siteSettings, room, menuItem
    lib/               client, image urls, fetch with seed fallback
```

## How orders are kept honest

The browser sends item ids and quantities. It never sends prices. The route handler
looks every id up in Sanity and recomputes the total, so editing a price in DevTools
changes nothing that staff see.

A cart holding both food and drinks sends two messages, one to the kitchen's topic
and one to the bar's, sharing a single reference like `BU-4F2A`.

Spam is filtered in three cheap steps before anything reaches Telegram: a hidden
honeypot field, a minimum form-fill time, and a per-IP rate limit. A submission that
trips the honeypot gets a normal-looking response so a bot learns nothing.

If Telegram is unreachable, the form shows a WhatsApp link pre-filled with the same
details rather than a dead end.

## Before launch

- [ ] Replace the drawn placeholder artwork with real photography of the rooms, food and lounge
- [ ] Enter real room types and rates in Studio
- [ ] Confirm the menu and prices
- [ ] Set the Sanity project id, Telegram token, chat id and topic ids in Vercel
- [ ] Point `NEXT_PUBLIC_SITE_URL` at the real domain, for the sitemap and canonical URLs
- [ ] Send one test booking and one test order and confirm they land in the right topics

## Accessibility

Targets WCAG 2.2 AA. Body copy is warm off-white rather than gold, because mid-gold
at small sizes does not carry enough contrast on a dark ground; gold is reserved for
headings, borders and fills. Forms are keyboard-navigable with visible focus, and the
layout holds at 200% zoom on a 360px viewport.
