import Link from "next/link";
import type { SiteSettings } from "@/sanity/lib/types";
import { Knot } from "./ui";

const COLUMNS = [
  {
    title: "Stay",
    links: [
      { href: "/rooms", label: "All rooms" },
      { href: "/rooms#request", label: "Request a booking" },
      { href: "/rooms", label: "Rates" },
    ],
  },
  {
    title: "Eat",
    links: [
      { href: "/restaurant", label: "Restaurant menu" },
      { href: "/restaurant", label: "Room service" },
      { href: "/restaurant", label: "Breakfast" },
    ],
  },
  {
    title: "Drink",
    links: [
      { href: "/lounge", label: "Lounge menu" },
      { href: "/lounge", label: "Cocktails" },
      { href: "/lounge", label: "Shisha" },
    ],
  },
];

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-24 border-t border-leaf/15 bg-hide-2">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.4fr_repeat(3,1fr)_1.2fr] lg:px-10">
        <div>
          <p className="display text-2xl text-bone">Bliss Urban</p>
          <p className="mt-1.5 border-t border-leaf/30 pt-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.34em] text-leaf/80">
            Hotels &amp; Suites
          </p>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-bone-dim">
            A business hotel in Barnawa with its own kitchen, its own lounge, and power that stays on.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-leaf">
              <Knot />
              {col.title}
            </h3>
            <ul className="mt-5 space-y-3">
              {col.links.map((l, i) => (
                <li key={i}>
                  <Link href={l.href} className="text-sm text-bone-dim transition hover:text-bone">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-leaf">
            <Knot />
            Front desk
          </h3>
          <address className="mt-5 space-y-3 text-sm not-italic leading-relaxed text-bone-dim">
            <p className="whitespace-pre-line">{settings.address}</p>
            <p>
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="tabular text-bone hover:text-leaf">
                {settings.phone}
              </a>
            </p>
            <p className="text-xs">{settings.hours}</p>
          </address>
          <a
            href={`https://wa.me/${settings.whatsapp}`}
            className="press mt-6 inline-flex items-center gap-2 rounded-full border border-leaf/35 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-leaf hover:bg-leaf/10"
          >
            WhatsApp us
          </a>
        </div>
      </div>

      <div className="border-t border-leaf/12">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-bone-dim lg:px-10">
          <p>© {new Date().getFullYear()} Bliss Urban Hotels &amp; Suites, Barnawa, Kaduna.</p>
          <p>Bookings and orders are confirmed by a person, not automatically.</p>
        </div>
      </div>
    </footer>
  );
}
