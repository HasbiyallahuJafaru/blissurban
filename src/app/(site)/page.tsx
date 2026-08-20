import Link from "next/link";
import { Plate } from "@/components/Plate";
import { ArrowRight, Eyebrow, Eyelet, Icon, PillLink, Rate, SectionHead, unitFor } from "@/components/ui";
import { naira } from "@/lib/format";
import { getRooms, getSettings } from "@/sanity/lib/fetch";
import { picture, unsplash } from "@/sanity/lib/image";
import { rate } from "@/sanity/lib/types";

export const revalidate = 60;

/**
 * Everything the hotel sells, struck as one set of foil medallions. Laundry
 * and car hire carry no `photo`: there is no honest stand-in for either, so
 * Plate draws its rosette instead of borrowing a picture of a bedroom.
 */
const SECTIONS = [
  {
    href: "/rooms",
    label: "Rooms & Suites",
    note: "Six categories, from the Standard to the Classic Presidential.",
    offset: "lg:mt-0",
    photo: "photo-1582719478250-c89cae4dc85b",
  },
  {
    href: "/restaurant",
    label: "Restaurant",
    note: "Pepper soups and rice, sent up to your room.",
    offset: "lg:mt-14",
    photo: "photo-1517248135467-4c7edcad34c4",
  },
  {
    href: "/lounge",
    label: "Lounge",
    note: "Somewhere to sit when the meetings are done.",
    offset: "lg:mt-5",
    photo: "photo-1514933651103-005eec06c04b",
  },
  {
    href: "/laundry",
    label: "Laundry",
    note: "Washing, ironing and starching, priced by the piece.",
    offset: "lg:mt-16",
    photo: undefined,
  },
  {
    href: "/car-hire",
    label: "Car Hire",
    note: "Fixed fares to the airport, Zaria, Kano and Abuja.",
    offset: "lg:mt-7",
    photo: undefined,
  },
];

/* Stand-ins until the hotel supplies its own photography. The hero is
   deliberately not the featured room, or the two sections show the same bed.
   Bliss Luxury became the featured room with the tariff sheet, so this moved
   off the id that room now carries. */
const HERO_PHOTO = "photo-1566665797739-1674de7a421a";
/* Dark and warm, so it sits on the ink band instead of punching a white
   hole in it. Checked against the other candidates before picking. */
const PROMO_PHOTO = "photo-1414235077428-338989a2e8c0";

export default async function HomePage() {
  const [settings, rooms] = await Promise.all([getSettings(), getRooms()]);

  const bedrooms = rooms.filter((r) => r.kind !== "hall");
  const featured = bedrooms.find((r) => r.featured) ?? bedrooms[1] ?? bedrooms[0];
  const cheapest = bedrooms.reduce<(typeof bedrooms)[number] | undefined>(
    (a, b) => (!a || rate(b) < rate(a) ? b : a),
    undefined,
  );

  return (
    <>
      {/* ═══════════════════════════════════════════════════════ hero
          5/7 split, not 6/6. The plate runs off the right edge. */}
      <section className="mx-auto max-w-380 px-5 pt-14 lg:pl-12 lg:pr-0 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Eyebrow className="text-gold-deep">{settings.heroEyebrow}</Eyebrow>

            {/* the headline hangs left of its own column */}
            <h1 className="display mt-8 text-[clamp(2.7rem,4.8vw,4.15rem)] leading-[0.98] text-ink lg:-ml-1">
              {settings.heroHeadline}
              <em className="block font-normal italic text-gold-deep">{settings.heroHeadlineItalic}</em>
            </h1>

            <p className="mt-9 max-w-md text-[1.02rem] leading-[1.8] text-ink-2">{settings.heroBody}</p>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <PillLink href="/rooms#request">Request a room</PillLink>
              <PillLink href="/restaurant" variant="ghost">
                See the menu
              </PillLink>
            </div>

            <dl className="foil-t mt-14 grid grid-cols-3 gap-x-6 gap-y-5 pt-8 lg:pr-10">
              {[
                { v: "24/7", k: "Front desk" },
                { v: "00:00", k: "Kitchen closes" },
                { v: `${bedrooms.length}`, k: "Room types" },
              ].map((f) => (
                <div key={f.k}>
                  <dt className="sr-only">{f.k}</dt>
                  <dd className="tabular display text-[1.75rem] leading-none text-ink">{f.v}</dd>
                  <dd className="mt-2 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-ink-3">
                    {f.k}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative pb-20 lg:col-span-7 lg:pb-0">
            <div className="aspect-4/5 overflow-hidden rounded-l-sm border border-ink/12 lg:aspect-16/12">
              <Plate
                src={picture(settings.heroImage, HERO_PHOTO, 1400)}
                alt="Inside Bliss Urban Hotels & Suites, Barnawa"
                seed="bliss-hero"
                priority
              />
            </div>

            {/* the rate card sits half off the plate, onto the paper */}
            {cheapest ? (
              <Link
                href="/rooms"
                className="plate group absolute bottom-0 left-0 flex w-[min(21rem,90%)] items-center gap-5 p-5 transition hover:border-ink/35 lg:-left-16 lg:bottom-12"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-gold-deep">
                    Rooms from
                  </p>
                  <p className="tabular display mt-2 text-[1.9rem] leading-none text-ink">
                    {naira(rate(cheapest))}
                  </p>
                  <p className="mt-2 truncate text-xs text-ink-3">
                    {cheapest.name}, {unitFor(cheapest)}
                  </p>
                </div>
                <Eyelet />
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════ trust strip */}
      <section className="mt-24 border-y border-ink/10 bg-paper-2/60">
        <div className="mx-auto grid max-w-380 gap-x-12 gap-y-9 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-12">
          {settings.amenities.slice(0, 4).map((a, i) => (
            <div key={a.title} className="flex gap-5">
              <span className="tabular display pt-0.5 text-sm text-gold">{`0${i + 1}`}</span>
              <div>
                <Icon name={a.icon} className="text-gold-deep" />
                <p className="mt-3 text-sm font-semibold text-ink">{a.title}</p>
                <p className="mt-1.5 text-[0.82rem] leading-[1.7] text-ink-2">{a.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════ five sections
          Medallions are staggered vertically rather than set in a row. */}
      <section className="mx-auto max-w-380 px-5 py-24 lg:px-12 lg:py-32">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <SectionHead
            index="01"
            eyebrow="Five reasons to come"
            title="Sleep here, eat here,"
            italic="stay a while."
            body="The rooms are upstairs, the kitchen is on the ground floor, and the lounge runs late. The laundry and the drivers work to the same front desk. You can use any one of them without booking the others."
            className="lg:col-span-3 lg:pt-8"
          />

          <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:col-span-9 lg:grid-cols-5 lg:gap-x-5">
            {SECTIONS.map((s) => (
              <Link key={s.href} href={s.href} className={`group ${s.offset}`}>
                {/* struck as a foil medallion: gold ring, then a hairline gap */}
                <div className="mx-auto aspect-square w-full max-w-72 overflow-hidden rounded-full border border-gold/40 p-1.5 transition duration-300 group-hover:border-gold/80">
                  <div className="size-full overflow-hidden rounded-full">
                    <Plate
                      src={s.photo ? unsplash(s.photo, 700) : null}
                      alt={s.label}
                      seed={s.label}
                    />
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="display text-lg text-ink lg:text-xl">{s.label}</p>
                  <p className="mx-auto mt-2 max-w-56 text-[0.8rem] leading-[1.65] text-ink-2">{s.note}</p>
                  <Eyelet className="mx-auto mt-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════ featured room, mirrored
          Image left and wide this time, so the page does not settle. */}
      {featured ? (
        <section className="mx-auto max-w-380 px-5 lg:pl-0 lg:pr-12">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="aspect-4/3 overflow-hidden rounded-r-sm border border-ink/12 lg:col-span-7 lg:aspect-16/11">
              <Plate
                src={picture(featured.image, featured.photo, 1200)}
                alt={featured.name}
                seed={`${featured.name}-feature`}
              />
            </div>

            <div className="lg:col-span-5">
              <div className="flex items-baseline gap-5">
                <span className="tabular display text-sm text-gold">02</span>
                <Eyebrow className="text-gold-deep">Most booked</Eyebrow>
              </div>

              <h2 className="display mt-6 text-[clamp(2.1rem,4.4vw,3.2rem)] leading-[1.03] text-ink">
                The room most people
                <em className="block font-normal italic text-gold-deep">come back to.</em>
              </h2>

              <p className="mt-6 max-w-md text-[0.95rem] leading-[1.8] text-ink-2">{featured.description}</p>

              <div className="foil-t mt-9 flex flex-wrap items-end justify-between gap-6 pt-7">
                <div>
                  <p className="display text-xl text-ink">{featured.name}</p>
                  <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                    {featured.amenities.slice(0, 4).map((a) => (
                      <li key={a} className="flex items-center gap-2 text-xs text-ink-2">
                        <span className="size-1 shrink-0 rotate-45 bg-gold" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-right">
                  <Rate room={featured} className="text-[2.4rem] text-ink" unit={unitFor(featured)} />
                </div>
              </div>

              <PillLink href="/rooms#request" className="mt-8">
                Request this room
                <ArrowRight />
              </PillLink>
            </div>
          </div>
        </section>
      ) : null}

      {/* ══════════════════════════════════════════════ the ink band */}
      <section className="on-ink mt-24 lg:mt-32">
        <div className="mx-auto grid max-w-380 items-center gap-12 px-5 py-20 lg:grid-cols-12 lg:gap-14 lg:py-24 lg:pl-12 lg:pr-0">
          <div className="lg:col-span-6">
            <p className="flex items-center gap-2.5 text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-gold-bright">
              {settings.promoEyebrow}
            </p>
            <h2 className="display mt-6 text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.02] text-ink">
              {settings.promoHeading}
            </h2>
            <p className="mt-7 max-w-md text-[0.98rem] leading-[1.8] text-ink-2">{settings.promoBody}</p>
            <PillLink href={settings.promoCtaHref} variant="onInk" className="mt-10">
              {settings.promoCtaLabel}
              <ArrowRight />
            </PillLink>
          </div>

          <div className="aspect-5/4 overflow-hidden rounded-l-sm border border-ink/15 lg:col-span-6 lg:aspect-4/3">
            <Plate src={unsplash(PROMO_PHOTO, 900)} alt="A tray from the kitchen" seed="room service tray" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ amenities, reversed */}
      <section className="mx-auto max-w-380 px-5 py-24 lg:px-12 lg:py-32">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="grid gap-x-12 gap-y-11 sm:grid-cols-2 lg:col-span-7 lg:order-1 lg:grid-cols-2">
            {settings.amenities.map((a) => (
              <div key={a.title}>
                <Icon name={a.icon} className="text-gold-deep" />
                <h3 className="mt-4 text-sm font-semibold text-ink">{a.title}</h3>
                <p className="mt-2 text-[0.85rem] leading-[1.75] text-ink-2">{a.body}</p>
              </div>
            ))}
          </div>

          <SectionHead
            index="03"
            eyebrow="What you get"
            title="The things people"
            italic="actually ask about."
            body="Every question the front desk fields twice a day, answered before you call."
            className="lg:order-2 lg:col-span-5 lg:pl-10 lg:pt-6"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ find us */}
      <section className="mx-auto max-w-380 px-5 lg:px-12">
        <div className="plate-sunk grid items-center gap-10 p-9 lg:grid-cols-12 lg:p-16">
          <div className="lg:col-span-7">
            <Eyebrow className="text-gold-deep">Find us</Eyebrow>
            <h2 className="display mt-6 text-[clamp(1.9rem,3.6vw,2.8rem)] leading-[1.06] text-ink">
              {settings.address.split(",")[0]},
              <em className="block font-normal italic text-gold-deep">
                {settings.address.split(",").slice(1).join(",").trim() || "Kaduna"}
              </em>
            </h2>
            <p className="mt-6 text-sm leading-[1.7] text-ink-2">{settings.hours}</p>
          </div>

          <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
            <PillLink href="/rooms#request">Request a room</PillLink>
            <a
              href={`tel:${settings.phone.replace(/\s/g, "")}`}
              className="press inline-flex items-center justify-center rounded-full border border-ink/25 px-7 py-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-ink hover:border-ink/60 hover:bg-paper"
            >
              Call the desk
            </a>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Hotel",
            name: "Bliss Urban Hotels & Suites",
            address: {
              "@type": "PostalAddress",
              streetAddress: "No 3 Kashim Ibrahim Street, Narayi High Cost",
              addressLocality: "Barnawa, Kaduna",
              addressRegion: "Kaduna",
              addressCountry: "NG",
            },
            telephone: settings.phone,
            email: settings.email,
          }),
        }}
      />
    </>
  );
}
