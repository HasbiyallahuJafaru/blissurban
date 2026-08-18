# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router) + React 19 + Tailwind v4, TypeScript. Sanity 6 as the headless CMS
via `next-sanity` 13, with the Studio embedded at `/studio`. Deployed on Vercel. Stack chosen
by the user, not delegated.

No database, no auth, no payment processor. The only server code is two Route Handlers: one
that relays submissions to Telegram, one that receives Sanity's publish webhook.

## Users

**Primary: business travellers in Kaduna.** In town for work — government, NGO, agriculture,
manufacturing, or a posting at one of the nearby institutions. Booking from a phone, often
the night before or the morning of, frequently on a patchy mobile connection. They are not
browsing for pleasure; they want to know it is clean, secure, powered, and available, then
book in under two minutes.

Once checked in they become the restaurant and lounge customer too — a business traveller in
Kaduna is unlikely to go out for dinner, so the restaurant is not an amenity, it is where
they will eat every night of the stay. Room service ordered from a phone upstairs is a core
flow, not an afterthought.

**Secondary: Kaduna residents** using the restaurant and lounge without staying — Barnawa is
residential and commercial, and local trade fills the tables midweek.

## Product Purpose

Bliss Urban Hotels & Suites has no web presence. The site exists to convert intent into a
message a staff member can act on: a room booked, a meal ordered, a table reserved. Success
is measured in Telegram messages that turn into revenue, not in traffic.

It replaces the current process — a phone number passed around WhatsApp — with something a
guest can use at 1am without waking anyone up.

## Positioning

A hotel in Barnawa competes on the things Nigerian business travel actually turns on:
uninterrupted power, secure parking, working wifi, and a kitchen that is open when the guest
gets in late. The site's job is to state these plainly and prove them, not to imply luxury
through stock imagery.

The mechanism a neighbouring hotel cannot copy from the page: every enquiry lands in staff
Telegram within a second and is answered by a person, so a guest gets a human confirmation
rather than an automated booking that may not survive contact with reality.

## Operating Context

- Staff work from a Telegram supergroup with three topics: Reservations, Restaurant, Lounge.
  Front desk, kitchen, and bar each watch their own thread.
- No payment is taken online. Every submission is an enquiry; staff confirm by phone or
  WhatsApp and collect on arrival. The site must never imply a booking is guaranteed or paid.
- Room availability is not tracked anywhere digital. The front desk knows what is free. The
  site collects a request against a room *type*, never a specific numbered room.
- Management edits prices and menus in Sanity Studio from a browser, with no developer.
- Guests are overwhelmingly on Android phones over mobile data. Page weight is a business
  constraint, not a vanity metric.

## Capabilities and Constraints

**Confirmed:** room reservation requests; restaurant food ordering with a cart; lounge drink
ordering with a cart; delivery context per order (room service / dine-in / takeaway);
Telegram delivery routed per section; Sanity-managed rooms, menus, prices, and imagery.

**Explicitly excluded:** online payment, user accounts, live availability, email, and
multi-language. None is buildable without a backend, and a booking flow that pretends
otherwise misleads guests.

**Undecided / not yet supplied:** street address within Barnawa, phone and WhatsApp numbers,
real room rates, real menu and prices, opening hours, Sanity project ID, Telegram bot token
and chat/topic IDs. All are placeholders in Sanity until supplied — none may be invented.

## Brand Commitments

- Name: **Bliss Urban Hotels & Suites**.
- Palette pinned by the user: black ground, shades of gold for foreground and text.
- Layout pinned by the user: the editorial reference supplied in-thread (slim nav, split hero
  with an overlapping card, tinted trust strip, "heading left / cards right" section rhythm,
  circular-arrow motif, one full-bleed inverted accent band, fat footer).
- Location: Barnawa, Kaduna, Nigeria. Currency is the Naira (₦).

## Evidence on Hand

**None.** No photography, no logo files, no testimonials, no press, no real menu, no real
rates. Every image and every review on the site at launch is authored placeholder material
and must be labelled as such in the handoff, with a replacement checklist for the client.

Guest testimonials in particular must not be fabricated as real quotes from real people —
they ship as clearly-marked placeholder content in Sanity, empty by default in production if
the client has not supplied real ones.

## Product Principles

1. **The enquiry is the product.** Every screen exists to produce a well-formed Telegram
   message. Anything that does not move a guest toward one is decoration.
2. **State the facts a Nigerian business traveller actually checks.** Power, security,
   parking, wifi, airport distance, kitchen hours. Concrete beats atmospheric.
3. **Never imply a guarantee the hotel cannot honour.** No "booked", no "confirmed", no
   "paid" — the word is *request*, and a human answers it.
4. **Built for a phone on mobile data.** Weight, tap targets, and thumb reach outrank
   desktop grandeur.
5. **The client must be able to change anything commercial without a developer.** Prices,
   dishes, rooms, and hours live in Sanity or they are a bug.

## Accessibility & Inclusion

No standard was specified by the client, so the build targets WCAG 2.2 AA as the floor.
Specific to this palette: gold on black passes only at certain values, so body copy uses a
warm off-white and gold is reserved for headings, borders, and fills. Every form is
keyboard-navigable with visible focus, and the cart and booking flows are usable at 200%
zoom on a 360px viewport.
