# Deployment

Target: Vercel. Environment variables set through the Vercel CLI.

Everything in the codebase is finished. What remains is account setup, content
the hotel still has to supply, and one round of end-to-end testing against a
real Telegram group.

---

## Where things stand

**Works right now, with no credentials at all.** Sanity reads fall back to
`src/sanity/lib/seed.ts`, so you can deploy today and get a working URL. A
ribbon across the top says the photographs are stand-ins. Submitting a booking
or order will fail gracefully to a pre-filled WhatsApp link, because there is
no Telegram token yet.

**Blocking a real launch:**

| Item | Who | Notes |
|---|---|---|
| Photographs of the building, rooms, food | Hotel | Currently Unsplash photos **of other hotels** |
| Room descriptions and amenity lists | Hotel | Rates are real; the prose around them is written, not supplied |
| Seating figure for the hall | Hotel | The tariff sheet prices it but does not seat it |
| Sanity project, dataset, CORS, webhook | You | Free tier; all scriptable, see step 1 |
| Telegram bot, group, five topics | You | Free |
| Domain | You | Optional; a `.vercel.app` URL works |

Everything priced is real and already in the code, taken from the hotel's own
tariff sheet: the six room categories with both the standard and discounted
rate, the hall, the house rules, all 90 restaurant dishes, all 91 drinks, the
14 laundry prices and the 13 car hire fares. So are the address, both phone
numbers and the email.

Room sizes and bed types are deliberately **absent** rather than invented,
because the tariff sheet does not give them. Add them in Studio when the hotel
confirms them and they appear automatically.

---

## 1. Sanity project

All of this can be done from the CLI. `sanity.cli.ts` in the repo root points
the CLI at the project, and it reads `.env.local`, so once the project ID is in
that file no command needs `-p` again.

```bash
npx sanity login

# Creates the project and its production dataset in one call.
npx sanity projects create "Bliss Urban" \
  --dataset production \
  --dataset-visibility public \
  --json
```

The `--json` output includes the project ID. Put it in `.env.local` straight
away so every later command picks it up:

```bash
cat >> .env.local <<'EOF'
NEXT_PUBLIC_SANITY_PROJECT_ID=paste-the-id-here
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-03-01
EOF
```

Confirm it worked:

```bash
npx sanity projects list
npx sanity datasets list
```

**The dataset must be public.** The client runs with `useCdn: true` and no read
token, so a private dataset returns nothing and every page silently falls back
to seed content, which looks like the site is simply ignoring your edits. If
you created it private by mistake:

```bash
npx sanity datasets visibility set production public
```

There is no separate Studio to deploy. The schemas live in
`src/sanity/schemaTypes/` and ship with the Next app, so `/studio` updates
whenever you deploy to Vercel. Do not run `sanity deploy`.

Generate the webhook secret now, any random string:

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

Keep it. It goes into both Vercel and the Sanity webhook in step 5.

---

## 2. Telegram

1. Message [@BotFather](https://t.me/BotFather), send `/newbot`, copy the token.
2. Create a group, open its settings and turn on **Topics**.
3. Add the bot to the group and make it an **administrator**.
4. Create five topics: `Reservations`, `Restaurant`, `Lounge`, `Laundry`,
   `Car Hire`.

Each department reads only its own thread. A topic id left unset is not an
error: Telegram ignores an unknown `message_thread_id` and the message lands in
the group's General thread instead, so you can add Laundry and Car Hire later
without anything breaking in the meantime.

**Chat ID.** Send any message in the group, then open:

```
https://api.telegram.org/bot<TOKEN>/getUpdates
```

Look for `"chat":{"id":-100...}`. It is negative and starts with `-100`.

**Topic IDs.** Two ways, either is fine:

- In Telegram Desktop or Web, right-click a topic, Copy Link. The number at the
  end of the link is the topic ID.
- Or post a message inside each topic and read `message_thread_id` from
  `getUpdates`.

Write down all six numbers before moving on: the chat id and five topic ids.

---

## 3. First deploy

```bash
npm i -g vercel        # if you do not already have it
cd path/to/blissurban
vercel login
vercel link            # create or connect the project
vercel --prod          # first production deploy
```

Vercel detects Next.js on its own. There is no build configuration to set, no
output mode, and no install command to override.

This deploy will run on seed content. That is expected.

---

## 4. Environment variables

**Read this before running the commands.** Anything prefixed `NEXT_PUBLIC_` is
baked into the JavaScript at build time, not read at runtime. Setting one of
those does nothing until you deploy again. The four Telegram values and the
Sanity secret are read per request, so those take effect on the next
deployment either way.

`vercel env add` prompts for the value when you run it plainly. To paste
everything in one pass, pipe instead. Replace each placeholder first:

```bash
# --- Sanity (NEXT_PUBLIC_, so these need a rebuild to take effect) ---
printf 'your-project-id' | vercel env add NEXT_PUBLIC_SANITY_PROJECT_ID production
printf 'production'      | vercel env add NEXT_PUBLIC_SANITY_DATASET production
printf '2026-03-01'      | vercel env add NEXT_PUBLIC_SANITY_API_VERSION production

# --- Site URL, used by the sitemap, robots.txt and canonical tags ---
printf 'https://blissurban.com' | vercel env add NEXT_PUBLIC_SITE_URL production

# --- Sanity webhook secret (runtime) ---
printf 'the-secret-from-step-1' | vercel env add SANITY_REVALIDATE_SECRET production

# --- Telegram (runtime). Never prefix these with NEXT_PUBLIC_. ---
printf '123456:ABC-your-bot-token' | vercel env add TELEGRAM_BOT_TOKEN production
printf '-1001234567890'            | vercel env add TELEGRAM_CHAT_ID production
printf '2'                         | vercel env add TELEGRAM_TOPIC_RESERVATIONS production
printf '3'                         | vercel env add TELEGRAM_TOPIC_RESTAURANT production
printf '4'                         | vercel env add TELEGRAM_TOPIC_LOUNGE production
printf '5'                         | vercel env add TELEGRAM_TOPIC_LAUNDRY production
printf '6'                         | vercel env add TELEGRAM_TOPIC_TRANSPORT production
```

`printf` rather than `echo` on purpose: `echo` appends a newline, and a
trailing newline inside a bot token produces a confusing 404 from Telegram.

Repeat for `preview` if you want pull-request deploys to work. Point preview at
a **separate Telegram group**, or draft bookings from preview builds will land
in the live staff group.

Then rebuild so the `NEXT_PUBLIC_` values are compiled in:

```bash
vercel --prod
```

To pull the same values into local development:

```bash
vercel env pull .env.local
```

### The full list

| Variable | Runtime or build | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | build | Blank means the site serves seed content |
| `NEXT_PUBLIC_SANITY_DATASET` | build | `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | build | `2026-03-01` |
| `NEXT_PUBLIC_SITE_URL` | build | Sitemap, robots.txt, canonical URLs |
| `SANITY_REVALIDATE_SECRET` | runtime | Verifies the publish webhook |
| `TELEGRAM_BOT_TOKEN` | runtime | Secret. Browser must never see it |
| `TELEGRAM_CHAT_ID` | runtime | Negative, starts `-100` |
| `TELEGRAM_TOPIC_RESERVATIONS` | runtime | Front desk thread; rooms, the hall, and transfers booked with a room |
| `TELEGRAM_TOPIC_RESTAURANT` | runtime | Kitchen thread |
| `TELEGRAM_TOPIC_LOUNGE` | runtime | Bar thread |
| `TELEGRAM_TOPIC_LAUNDRY` | runtime | Laundry thread |
| `TELEGRAM_TOPIC_TRANSPORT` | runtime | Car hire thread; rides booked without a room |

---

## 5. Connect Sanity to the deployed site

**CORS.** The Studio is served from your own domain at `/studio`, so Sanity has
to allow that origin. `--credentials` is the part people miss: without it the
page loads and then login fails.

```bash
npx sanity cors add https://your-project.vercel.app --credentials
npx sanity cors add https://blissurban.com --credentials
npx sanity cors add http://localhost:3000 --credentials

npx sanity cors list   # check
```

Add the apex and `www` separately if you use both. Sanity matches origins
exactly, so `https://blissurban.com` does not cover `https://www.blissurban.com`.

**Webhook.** `sanity hooks create` takes no flags and prompts for each field.
Give these answers:

| Prompt | Answer |
|---|---|
| Name | `Revalidate site` |
| URL | `https://your-domain/api/revalidate` |
| Dataset | `production` |
| Trigger on | Create, Update, Delete |
| Filter | `_type in ["siteSettings", "room", "menuItem"]` |
| Projection | leave empty |
| HTTP method | `POST` |
| Secret | the string from step 1 |

```bash
npx sanity hooks create

npx sanity hooks list    # confirm it exists
npx sanity hooks logs    # after publishing something, check delivery
```

`hooks logs` is the fastest way to diagnose a price that will not update: it
shows the status code and response body the route returned.

The filter matches the `TAGS` map in `src/app/api/revalidate/route.ts`. A
document type outside that list returns `{revalidated: false}` rather than an
error, which is intentional.

Pages carry a 60 second revalidate window on their own, so the webhook is what
makes a price change appear in seconds instead of a minute.

---

## 6. Enter the real content

Open `https://your-domain/studio` and log in.

Everything below is already in `seed.ts` and correct. Studio is how it gets
edited from then on, and nothing has to be re-typed to launch.

- [ ] Create the single **Site Settings** document. Fill in contact details,
      hero copy, the amenity list, the house rules, and the promo band.
- [ ] Add the **rooms**. Each takes a standard rate and, optionally, a
      discounted rate; the discounted one becomes the headline price and the
      standard is struck through beside it. Leave the discount empty to quote
      one price. Tick `featured` on exactly one.
- [ ] Set the hall's `kind` to **Event hall**. That keeps it out of the room
      grid, prices it per day, and gives it its own block on `/rooms`.
- [ ] Add **menu items** with `section` set to `restaurant`, `lounge`,
      `laundry` or `transport` (car hire). All four lists were entered from the
      tariff sheet and should match already.
- [ ] Fill in room sizes and bed types once the hotel confirms them. They are
      empty on purpose rather than guessed.
- [ ] Upload real photographs. A Sanity image always beats the Unsplash
      stand-in, so the placeholders disappear on their own as you upload.

**Prices on request.** Tick `onRequest` on a menu item and the site prints "On
request" instead of a figure and refuses to let it into an order. `BBQ Fish
with Fries or Plantain` is the one item shipped this way, because the tariff
sheet prices it by size on the day.

The demo ribbon disappears as soon as `NEXT_PUBLIC_SANITY_PROJECT_ID` is set.
It is tied to that variable, not to whether the dataset actually has content,
so do not leave the site pointing at an empty dataset.

---

## 7. Verify before announcing

**Delivery**

- [ ] Send a room request. It arrives in the Reservations topic with the right
      room, dates, guests and phone number, quoting the **discounted** rate.
- [ ] Request a transfer with the booking. A `🚗 TRANSFER` block appears with
      direction, place and time.
- [ ] Request the hall from `/rooms`. It arrives as `🏛 HALL REQUEST`, priced
      per day, with the date labelled as an event date.
- [ ] Order food only. It arrives in the Restaurant topic.
- [ ] Order drinks only. It arrives in the Lounge topic.
- [ ] Order laundry only. It arrives in the Laundry topic and says **Collect
      from** rather than Deliver to. The checkout should not have offered
      "a table" or "takeaway" for a laundry-only order.
- [ ] Order food, drinks and laundry together. Three messages arrive, one per
      topic, sharing one reference like `BU-4F2A`.
- [ ] Book a car from `/car-hire` without booking a room. It arrives in the Car
      Hire topic with route, fare, pickup point, date, time and passengers.
- [ ] Edit a price in DevTools before submitting. The Telegram message shows
      the **Sanity** price, not the edited one.
- [ ] Post a crafted order containing a car hire route id or a room id. It is
      rejected rather than priced as a cart line.

**Content**

- [ ] Change a price in Studio and publish. The live site shows it within
      seconds, with no redeploy.
- [ ] Delete a menu item. It disappears from the site.

**The site itself**

- [ ] `/studio` loads and accepts a login on the production domain.
- [ ] Test on a real Android phone over mobile data, not just a simulator.
- [ ] Open a room, click through the thumbnails, request it, and submit.
- [ ] Cart survives a page reload.
- [ ] Lighthouse mobile: performance and accessibility.
- [ ] `https://your-domain/sitemap.xml` and `/robots.txt` show the real domain.

**Failure path**

- [ ] Temporarily remove `TELEGRAM_BOT_TOKEN` and redeploy. Submitting shows
      the WhatsApp fallback rather than a dead end. Put it back afterwards.

---

## 8. Decisions still open

- **Reserve buttons** in the header and on the home page land at the top of
  `/rooms` rather than at a form, since the page-bottom form was removed. Each
  room card leads to the booking modal, so the path works. Worth deciding
  whether those buttons should open a specific room's modal instead.
- **Return fares for car hire.** The booking form offers "one way" or "return",
  but only the one-way fare is published, so a return is sent through as
  "Return, fare to confirm" and the desk quotes the second leg. The tariff
  sheet already prices the airport run both ways as its own route. If the hotel
  wants every route priced both ways, that is a data change, not a code change.
- **Preview deployments** will post into whatever Telegram group they are
  configured with. Give preview its own group or leave its Telegram variables
  unset.

---

## Troubleshooting

**Every page shows seed content and the demo ribbon.**
`NEXT_PUBLIC_SANITY_PROJECT_ID` is unset in that build, or it was set after the
last deploy. Redeploy.

**The ribbon is gone but the content is still the old placeholder text.**
The dataset is private, so every query returns nothing and the code falls back
to seed data without erroring. Check with `npx sanity datasets list`, and fix
with `npx sanity datasets visibility set production public`.

**A Sanity CLI command asks which project to use.** It could not read
`sanity.cli.ts` or `.env.local`. Run it from the repo root, or pass
`-p <project-id>` explicitly.

**Studio loads but login fails.** CORS origin missing, or added without
credentials ticked.

**Submissions return 503.** `TELEGRAM_BOT_TOKEN` or `TELEGRAM_CHAT_ID` is not
set on the deployment.

**Submissions return 502.** The token and chat ID exist but Telegram rejected
the call. Usually a wrong chat ID, a bot that is not an admin, or a trailing
newline in the token. Check the function logs in Vercel for the exact response.

**Messages arrive in the group but not in topics.** Topics are off on the
group, or the thread IDs are wrong. Telegram ignores an invalid
`message_thread_id` and posts to the general thread.

**Prices do not update after publishing.** Webhook secret mismatch. Sanity's
webhook delivery log shows the response body.

**Someone floods the form.** Rate limiting is per instance and in memory, which
is best effort on serverless. If it becomes a real problem the fix is a shared
counter such as Upstash Redis in `src/app/api/notify/route.ts`.
