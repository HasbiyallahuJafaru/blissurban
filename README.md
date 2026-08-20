# Bliss Urban Hotels & Suites

The website for a business hotel in Barnawa, Kaduna. Guests request a room or the
hall, order from the restaurant or the lounge, send out laundry, and book a car,
and each request lands in the right thread of the staff Telegram group within a
second.

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
   Reservations | Restaurant | Lounge | Laundry | Car Hire
```

Content lives in Sanity. Management edits rooms, dishes, drinks, laundry prices,
car hire fares and the house rules in a browser at `/studio`, and a webhook drops
the affected pages so the change is live within seconds without a redeploy.

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

```bash
npx sanity login
npx sanity projects create "Bliss Urban" --dataset production --dataset-visibility public --json
```

Put the returned project id in `.env.local` as `NEXT_PUBLIC_SANITY_PROJECT_ID`,
restart the dev server, and open `/studio`. Add rooms and menu items, and create
the one **Site Settings** document for contact details, hero copy and amenities.

The dataset has to be public: the client uses `useCdn: true` with no read token,
so a private dataset returns nothing and the site quietly falls back to seed
content.

There is no separate Studio deploy. Schemas live in `src/sanity/schemaTypes/`
and ship with the app.

Full setup, including CORS, the revalidation webhook and Vercel environment
variables, is in [DEPLOYMENT.md](DEPLOYMENT.md).

## Setting up Telegram

1. Message [@BotFather](https://t.me/BotFather), send `/newbot`, copy the token.
2. Create a group, turn on **Topics**, and add the bot as an administrator.
3. Create five topics: Reservations, Restaurant, Lounge, Laundry, Car Hire.
4. Send a message in the group, then open
   `https://api.telegram.org/bot<TOKEN>/getUpdates` and read `chat.id` (a negative
   number starting `-100`) and each topic's `message_thread_id`.
5. Fill in `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` and the five topic ids. A topic
   left blank still delivers; the message just lands in the group's General thread.

`TELEGRAM_BOT_TOKEN` must never be prefixed with `NEXT_PUBLIC_`. That prefix ships a
variable to the browser, and anyone could then post to the group as the hotel.

## Project layout

```
src/
  app/
    (site)/            public pages, wrapped in the header and footer
      page.tsx         home
      rooms/           room grid, the hall, the house rules, booking form
      restaurant/      food menu, add to order
      lounge/          drinks and spirits, add to order
      laundry/         laundry price list, add to order
      car-hire/        published fares plus the booking form
      cart/            checkout: where it goes, who to call
    studio/            embedded Sanity Studio, no site chrome
    api/notify/        the only code that knows the Telegram token
    api/revalidate/    Sanity publish webhook
  components/
    ui.tsx             eyebrow, pills, eyelet, rate, section head, icons
    Plate.tsx          image slot, with a drawn placeholder when there is no photo
    MenuSection.tsx    shared by restaurant, lounge, laundry and car hire
    RoomCard.tsx       room medallion, photo viewer, booking modal
    HallCard.tsx       the hall, priced by the day, with its own booking modal
    forms/             reservation, checkout and car hire
  lib/
    cart.ts            module store, localStorage, useSyncExternalStore
    format.ts          naira formatting
  sanity/
    schemaTypes/       siteSettings, room, menuItem
    lib/               client, image urls, fetch with seed fallback
```

`MenuSection` renders all four priced lists. Restaurant, lounge and laundry are
orderable, so their rows carry an Add button and the cart bar. Car hire passes
`orderable={false}`: a ride needs a date and a time that a cart line cannot carry,
so the page shows the fares as a table and books through its own form.

## How orders are kept honest

The browser sends item ids and quantities. It never sends prices. The route handler
looks every id up in Sanity and recomputes the total, so editing a price in DevTools
changes nothing that staff see.

The lookup is also what decides where a line is allowed to go. Only restaurant,
lounge and laundry ids are orderable; a room id, a car hire route id, or an item
priced on request is dropped rather than trusted, whatever a crafted request claims.

A cart holding food, drinks and laundry sends three messages, one to each
department's topic, sharing a single reference like `BU-4F2A`.

Spam is filtered in three cheap steps before anything reaches Telegram: a hidden
honeypot field, a minimum form-fill time, and a per-IP rate limit. A submission that
trips the honeypot gets a normal-looking response so a bot learns nothing.

If Telegram is unreachable, the form shows a WhatsApp link pre-filled with the same
details rather than a dead end.

## Photography

The site currently shows Unsplash photographs as stand-ins, hotlinked from
`images.unsplash.com`. Their ids live in `src/sanity/lib/seed.ts` and at the top of
`src/app/(site)/page.tsx`.

**These are pictures of other hotels.** They are fine while the site is in
development, but a guest booking a room based on a photograph of a different
building has been misled, so they must come out before launch. Upload real photos in
Studio and they take precedence automatically: `picture()` in `src/sanity/lib/image.ts`
prefers a Sanity asset, falls back to the Unsplash id, and falls back again to a
drawn foil panel if there is neither.

## What is real and what is not

Real, taken from the hotel's own tariff sheet:

- the address, both phone numbers, and the email
- the six room categories, each with its standard and discounted rate
- the hall, priced by the day
- the house rules, shown in full on `/rooms`
- all 90 restaurant dishes, all 91 drinks, 14 laundry prices, 13 car hire fares

Still placeholder, and marked as such by a ribbon at the top of every page:

- every photograph
- room descriptions and amenity lists
- the hall's seating figure

Room sizes and bed types are **absent rather than invented**: the tariff sheet does
not give them, so no figure is shown until the hotel supplies one.

Two transcription notes. The sheet prints `Big Stoiut`, corrected here to `Big
Stout`. Its pounded yam and semo blocks abbreviate the second half of each list to
bare lines like `Serve with Fish`, which mean nothing away from the printed table,
so those are spelled out in full. Prices are untouched.

## Before launch

- [ ] Replace every Unsplash photo with real pictures of this building
- [ ] Confirm the room descriptions and amenity lists with the hotel
- [ ] Add room sizes and bed types in Studio once the hotel supplies them
- [ ] Ask the hotel how many the hall seats
- [ ] Set the Sanity project id, Telegram token, chat id and five topic ids in Vercel
- [ ] Point `NEXT_PUBLIC_SITE_URL` at the real domain, for the sitemap and canonical URLs
- [ ] Send one test booking, one test order, one laundry request and one car hire
      request, and confirm each lands in the right topic

## Accessibility

Targets WCAG 2.2 AA. Body copy is warm off-white rather than gold, because mid-gold
at small sizes does not carry enough contrast on a dark ground; gold is reserved for
headings, borders and fills. Forms are keyboard-navigable with visible focus, and the
layout holds at 200% zoom on a 360px viewport.
