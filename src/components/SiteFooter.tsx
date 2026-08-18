import Link from "next/link";
import type { SiteSettings } from "@/sanity/lib/types";
import { Knot } from "./ui";

const COLUMNS = [
  {
    title: "Stay",
    links: [
      { href: "/rooms", label: "All rooms" },
      { href: "/rooms#request", label: "Request a booking" },
    ],
  },
  {
    title: "Eat",
    links: [
      { href: "/restaurant", label: "Restaurant menu" },
      { href: "/restaurant", label: "Room service" },
    ],
  },
  {
    title: "Drink",
    links: [
      { href: "/lounge", label: "Lounge menu" },
      { href: "/lounge", label: "Shisha" },
    ],
  },
];

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const tel = (n: string) => `tel:${n.replace(/\s/g, "")}`;

  return (
    <footer className="on-ink mt-28">
      {/* uneven columns: the mark takes nearly half, the rest crowds right */}
      <div className="mx-auto grid max-w-[95rem] gap-14 px-5 py-20 lg:grid-cols-[1.7fr_0.7fr_0.7fr_0.7fr_1.4fr] lg:px-12">
        <div>
          <p className="display text-3xl text-ink">Bliss Urban</p>
          <p className="mt-2 border-t border-gold-bright/50 pt-2 text-[0.55rem] font-semibold uppercase tracking-[0.32em] text-gold-bright">
            Hotels &amp; Suites
          </p>
          <p className="mt-8 max-w-xs text-sm leading-[1.8] text-ink-2">
            A business hotel in Barnawa with its own kitchen, its own lounge, and power that stays on.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-gold-bright">
              <Knot />
              {col.title}
            </h3>
            <ul className="mt-6 space-y-3">
              {col.links.map((l, i) => (
                <li key={i}>
                  <Link href={l.href} className="text-sm text-ink-2 transition hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-gold-bright">
            <Knot />
            Front desk
          </h3>
          <address className="mt-6 space-y-3 text-sm not-italic leading-[1.7] text-ink-2">
            <p>{settings.address}</p>
            <p className="tabular flex flex-wrap gap-x-3 text-ink">
              <a href={tel(settings.phone)} className="hover:text-gold-bright">
                {settings.phone}
              </a>
              {settings.phoneAlt ? (
                <a href={tel(settings.phoneAlt)} className="hover:text-gold-bright">
                  {settings.phoneAlt}
                </a>
              ) : null}
            </p>
            <p>
              <a href={`mailto:${settings.email}`} className="text-ink hover:text-gold-bright">
                {settings.email}
              </a>
            </p>
            <p className="text-xs text-ink-3">{settings.hours}</p>
          </address>

          <a
            href={`https://wa.me/${settings.whatsapp}`}
            className="press mt-7 inline-flex items-center gap-2 rounded-full border border-gold-bright/50 px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-gold-bright hover:bg-gold-bright hover:text-on-gold"
          >
            WhatsApp us
          </a>
        </div>
      </div>

      <div className="border-t border-ink/12">
        <div className="mx-auto flex max-w-[95rem] flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-ink-3 lg:px-12">
          <p>© {new Date().getFullYear()} Bliss Urban Hotels &amp; Suites Ltd, Barnawa, Kaduna.</p>
          <p>Bookings and orders are confirmed by a person, not automatically.</p>
        </div>
      </div>
    </footer>
  );
}
