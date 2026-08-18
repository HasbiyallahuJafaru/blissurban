import Link from "next/link";
import { Plate } from "@/components/Plate";
import { ArrowRight, Eyebrow, Eyelet, Icon, PillLink, SectionHead } from "@/components/ui";
import { naira } from "@/lib/format";
import { getRooms, getSettings } from "@/sanity/lib/fetch";
import { imageUrl } from "@/sanity/lib/image";

export const revalidate = 60;

const SECTIONS = [
  { href: "/rooms", label: "Rooms & Suites", note: "Four types, from single to a suite that seats six." },
  { href: "/restaurant", label: "Restaurant", note: "Northern kitchen and continental, served to your room." },
  { href: "/lounge", label: "Lounge", note: "Cocktails, zobo, shisha, and somewhere to sit." },
];

export default async function HomePage() {
  const [settings, rooms] = await Promise.all([getSettings(), getRooms()]);
  const featured = rooms.find((r) => r.featured) ?? rooms[1] ?? rooms[0];
  const cheapest = rooms.reduce((a, b) => (b.price < a.price ? b : a), rooms[0]);

  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="mx-auto max-w-7xl px-5 pb-8 pt-12 lg:px-10 lg:pb-16 lg:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.02fr] lg:gap-16">
          <div>
            <Eyebrow className="text-leaf">{settings.heroEyebrow}</Eyebrow>

            <h1 className="display mt-7 text-[clamp(2.9rem,7.4vw,5.4rem)] leading-[0.97] text-bone">
              {settings.heroHeadline}
              <em className="block font-normal not-italic">
                <span className="italic text-leaf">{settings.heroHeadlineItalic}</span>
              </em>
            </h1>

            <p className="mt-8 max-w-md text-[1.02rem] leading-[1.7] text-bone-dim">{settings.heroBody}</p>

            <div className="mt-9 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <PillLink href="/rooms#request">Request a room</PillLink>
              <PillLink href="/restaurant" variant="ghost">
                See the menu
              </PillLink>
            </div>

            <dl className="tooled-t mt-11 grid grid-cols-3 gap-x-6 gap-y-5 pt-7 sm:flex sm:flex-wrap sm:gap-x-10">
              {[
                { v: "24/7", k: "Front desk" },
                { v: "00:00", k: "Kitchen closes" },
                { v: `${rooms.length}`, k: "Room types" },
              ].map((f) => (
                <div key={f.k}>
                  <dt className="sr-only">{f.k}</dt>
                  <dd className="tabular display text-2xl text-leaf">{f.v}</dd>
                  <dd className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-bone-dim">
                    {f.k}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative pb-16 lg:pb-0">
            <div className="plate aspect-4/5 overflow-hidden lg:aspect-4/4.1">
              <Plate
                src={imageUrl(featured?.image ?? null, 1100)}
                alt={`${featured?.name ?? "Room"} at Bliss Urban`}
                seed={featured?.name ?? "bliss"}
                priority
              />
            </div>

            {/* the reference's overlapping card, here as a rate plate */}
            {cheapest ? (
              <Link
                href="/rooms"
                className="plate group absolute bottom-0 left-0 flex w-[min(20rem,88%)] items-center gap-4 p-4 transition hover:border-leaf/45 lg:-left-8"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-leaf/80">
                    Rooms from
                  </p>
                  <p className="tabular display mt-1.5 text-2xl text-bone">{naira(cheapest.price)}</p>
                  <p className="mt-1 truncate text-xs text-bone-dim">{cheapest.name}, per night</p>
                </div>
                <Eyelet />
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- trust strip */}
      <section className="tooled-t tooled-b bg-hide-2/70">
        <div className="mx-auto grid max-w-7xl gap-x-10 gap-y-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
          {settings.amenities.slice(0, 4).map((a) => (
            <div key={a.title} className="flex gap-4">
              <Icon name={a.icon} className="mt-0.5 shrink-0 text-leaf" />
              <div>
                <p className="text-sm font-semibold text-bone">{a.title}</p>
                <p className="mt-1 text-[0.8rem] leading-relaxed text-bone-dim">{a.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ three sections */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,19rem)_1fr] lg:gap-16">
          <SectionHead
            eyebrow="Three reasons to come"
            title="Sleep here, eat here,"
            italic="stay a while."
            body="The rooms are upstairs, the kitchen is on the ground floor, and the lounge runs late. You can use one without booking the others."
          />

          <div className="grid gap-5 sm:grid-cols-3">
            {SECTIONS.map((s) => (
              <Link key={s.href} href={s.href} className="group">
                <div className="plate aspect-16/10 overflow-hidden transition duration-300 group-hover:border-leaf/40 sm:aspect-3/4">
                  <Plate src={null} alt={s.label} seed={s.label} />
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="display text-lg text-bone transition group-hover:text-leaf-hi">{s.label}</p>
                    <p className="mt-1.5 text-[0.8rem] leading-relaxed text-bone-dim">{s.note}</p>
                  </div>
                  <Eyelet className="mt-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- featured room */}
      {featured ? (
        <section className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="plate grid items-center gap-8 p-6 lg:grid-cols-[0.95fr_1fr_0.85fr] lg:gap-10 lg:p-10">
            <div>
              <Eyebrow className="text-leaf">Most booked</Eyebrow>
              <h2 className="display mt-5 text-[clamp(1.9rem,3.4vw,2.7rem)] leading-[1.08] text-bone">
                The room most people
                <em className="block font-normal italic text-leaf">come back to.</em>
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-bone-dim">{featured.description}</p>
            </div>

            <div className="aspect-4/3 overflow-hidden rounded-plate border border-leaf/12 lg:aspect-square">
              <Plate
                src={imageUrl(featured.image, 900)}
                alt={featured.name}
                seed={`${featured.name}-feature`}
              />
            </div>

            <div>
              <p className="display text-2xl text-bone">{featured.name}</p>
              <p className="tabular display mt-2 text-3xl text-leaf">{naira(featured.price)}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-bone-dim">per night</p>

              <ul className="tooled-t mt-6 space-y-2.5 pt-5 text-sm text-bone-dim">
                {featured.amenities.slice(0, 5).map((a) => (
                  <li key={a} className="flex items-center gap-2.5">
                    <span className="size-1 shrink-0 rotate-45 bg-leaf" />
                    {a}
                  </li>
                ))}
              </ul>

              <PillLink href="/rooms#request" className="mt-7 w-full">
                Request this room
              </PillLink>
            </div>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------------ gold band */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-28">
        <div className="leaf-field grid items-center gap-8 overflow-hidden rounded-plate p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-14">
          <div>
            <p className="flex items-center gap-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-hide/70">
              {settings.promoEyebrow}
            </p>
            <h2 className="display mt-5 text-[clamp(2rem,4vw,3.2rem)] leading-[1.03] text-hide">
              {settings.promoHeading}
            </h2>
            <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-hide/80">{settings.promoBody}</p>
            <PillLink href={settings.promoCtaHref} variant="onLeaf" className="mt-8">
              {settings.promoCtaLabel}
              <ArrowRight />
            </PillLink>
          </div>

          <div className="aspect-5/4 overflow-hidden rounded-plate border border-hide/25 bg-hide/90">
            <Plate src={null} alt="A tray from the kitchen" seed="room service tray" />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ amenities */}
      <section className="mx-auto max-w-7xl px-5 pb-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,19rem)_1fr] lg:gap-16">
          <SectionHead
            eyebrow="What you get"
            title="The things people"
            italic="actually ask about."
            body="Every question the front desk fields twice a day, answered before you call."
          />
          <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {settings.amenities.map((a) => (
              <div key={a.title}>
                <Icon name={a.icon} className="text-leaf" />
                <h3 className="mt-4 text-sm font-semibold text-bone">{a.title}</h3>
                <p className="mt-2 text-[0.82rem] leading-relaxed text-bone-dim">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- closing CTA */}
      <section className="mx-auto max-w-7xl px-5 pt-20 lg:px-10 lg:pt-28">
        <div className="plate grid items-center gap-8 overflow-hidden p-8 lg:grid-cols-[1fr_auto] lg:p-14">
          <div>
            <Eyebrow className="text-leaf">Find us</Eyebrow>
            <h2 className="display mt-5 text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.05] text-bone">
              {settings.address.split(",")[0]},
              <em className="block font-normal italic text-leaf">
                {settings.address.split(",").slice(1).join(",").trim() || "Kaduna"}
              </em>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-bone-dim">{settings.hours}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <PillLink href="/rooms#request">Request a room</PillLink>
            <a
              href={`tel:${settings.phone.replace(/\s/g, "")}`}
              className="press inline-flex items-center justify-center rounded-full border border-leaf/40 px-6 py-3.5 text-[0.82rem] font-semibold uppercase tracking-[0.12em] text-leaf hover:bg-leaf/10"
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
            address: { "@type": "PostalAddress", addressLocality: "Barnawa", addressRegion: "Kaduna", addressCountry: "NG" },
            telephone: settings.phone,
          }),
        }}
      />
    </>
  );
}
