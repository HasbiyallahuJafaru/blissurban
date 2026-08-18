# Deployment

Target: Vercel. Environment variables set through the Vercel CLI.

Everything in the codebase is finished. What remains is account setup, content
the hotel still has to supply, and one round of end-to-end testing against a
real Telegram group.

---

## Where things stand

**Works right now, with no credentials at all.** Sanity reads fall back to
`src/sanity/lib/seed.ts`, so you can deploy today and get a working URL. A
ribbon across the top says room rates and the lounge list are placeholders.
Submitting a booking or order will fail gracefully to a pre-filled WhatsApp
link, because there is no Telegram token yet.

**Blocking a real launch:**

| Item | Who | Notes |
|---|---|---|
| Room types, descriptions, nightly rates | Hotel | Only placeholders exist |
| Lounge and drinks list with prices | Hotel | Never supplied; current list is invented |
| Photographs of the building, rooms, food | Hotel | Currently Unsplash photos **of other hotels** |
| Sanity project | You | Free tier is enough |
| Telegram bot, group, three topics | You | Free |
| Domain | You | Optional; a `.vercel.app` URL works |

The restaurant menu, address, both phone numbers and the email are real and
already in the code.

---

## 1. Sanity project

1. Go to [sanity.io/manage](https://sanity.io/manage), create a project.
2. Create a dataset named `production`.
3. Set the dataset to **public**. The client runs with `useCdn: true` and no
   read token, so a private dataset returns nothing and every page silently
   falls back to seed content.
4. Copy the project ID.

Generate a webhook secret now, any random string:

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

Keep it. It goes into both Vercel and the Sanity webhook in step 5.

---

## 2. Telegram

1. Message [@BotFather](https://t.me/BotFather), send `/newbot`, copy the token.
2. Create a group, open its settings and turn on **Topics**.
3. Add the bot to the group and make it an **administrator**.
4. Create three topics: `Reservations`, `Restaurant`, `Lounge`.

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

Write down all four numbers before moving on.

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
| `TELEGRAM_TOPIC_RESERVATIONS` | runtime | Front desk thread |
| `TELEGRAM_TOPIC_RESTAURANT` | runtime | Kitchen thread |
| `TELEGRAM_TOPIC_LOUNGE` | runtime | Bar thread |

---

## 5. Connect Sanity to the deployed site

**CORS.** The Studio is served from your own domain at `/studio`, so Sanity has
to allow it. In sanity.io/manage, open API, then CORS Origins, and add:

- `https://your-project.vercel.app` with **Allow credentials** ticked
- your custom domain, also with credentials
- `http://localhost:3000` with credentials, for local work

Without this, `/studio` loads and then fails to log in.

**Webhook.** Still under API, create a webhook:

| Field | Value |
|---|---|
| URL | `https://your-domain/api/revalidate` |
| Dataset | `production` |
| Trigger on | Create, Update, Delete |
| Filter | `_type in ["siteSettings", "room", "menuItem"]` |
| HTTP method | `POST` |
| Secret | the string from step 1 |

The filter matches the `TAGS` map in `src/app/api/revalidate/route.ts`. A
document type outside that list returns `{revalidated: false}` rather than an
error, which is intentional.

Pages carry a 60 second revalidate window on their own, so the webhook is what
makes a price change appear in seconds instead of a minute.

---

## 6. Enter the real content

Open `https://your-domain/studio` and log in.

- [ ] Create the single **Site Settings** document. Fill in contact details,
      hero copy, the amenity list, and the promo band.
- [ ] Add the real **rooms** with correct rates, capacity, and descriptions.
      Tick `featured` on exactly one, which is the room the home page shows.
- [ ] Add the **lounge** menu items with `section` set to `lounge`.
- [ ] Check the restaurant items against the printed menu. They were entered
      from the copy you supplied and should match already.
- [ ] Upload real photographs. A Sanity image always beats the Unsplash
      stand-in, so the placeholders disappear on their own as you upload.

The demo ribbon disappears as soon as `NEXT_PUBLIC_SANITY_PROJECT_ID` is set.
It is tied to that variable, not to whether the dataset actually has content,
so do not leave the site pointing at an empty dataset.

---

## 7. Verify before announcing

**Delivery**

- [ ] Send a room request. It arrives in the Reservations topic with the right
      room, dates, guests and phone number.
- [ ] Request a transfer with the booking. A `🚗 TRANSFER` block appears with
      direction, place and time.
- [ ] Order food only. It arrives in the Restaurant topic.
- [ ] Order drinks only. It arrives in the Lounge topic.
- [ ] Order food and drinks together. Two messages arrive, one per topic,
      sharing one reference like `BU-4F2A`.
- [ ] Edit a price in DevTools before submitting. The Telegram message shows
      the **Sanity** price, not the edited one.

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
- **Standalone pickup.** Transfers currently only exist inside a room booking.
  If a guest should be able to request a car without booking a room, that is a
  separate small flow and is not built.
- **Preview deployments** will post into whatever Telegram group they are
  configured with. Give preview its own group or leave its Telegram variables
  unset.

---

## Troubleshooting

**Every page shows seed content and the demo ribbon.**
`NEXT_PUBLIC_SANITY_PROJECT_ID` is unset in that build, or it was set after the
last deploy. Redeploy.

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
