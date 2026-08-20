import type { ReactNode } from "react";
import { CartBar } from "./CartBar";
import { MenuGroups } from "./MenuGroups";
import { MenuRow } from "./MenuRow";
import { Plate } from "./Plate";
import { Eyebrow } from "./ui";
import { step } from "@/lib/format";
import { unsplash } from "@/sanity/lib/image";
import { categoryOrder } from "@/sanity/lib/seed";
import type { MenuItem, Section } from "@/sanity/lib/types";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function group(items: MenuItem[], section: Section) {
  const preferred = categoryOrder[section] ?? [];
  const seen = new Set(preferred);
  const rest = [...new Set(items.map((i) => i.category))].filter((c) => !seen.has(c));

  return [...preferred, ...rest]
    .map((category) => ({ category, items: items.filter((i) => i.category === category) }))
    .filter((g) => g.items.length > 0);
}

export function MenuSection({
  section,
  items,
  eyebrow,
  title,
  italic,
  body,
  heroPhoto,
  orderable = true,
  layout = "list",
  noun,
  children,
}: {
  section: Section;
  items: MenuItem[];
  eyebrow: string;
  title: string;
  italic: string;
  body: string;
  /** Unsplash id, a stand-in until the hotel supplies its own photography. */
  heroPhoto?: string;
  /**
   * False turns the list into a published price table with no Add buttons and
   * no cart bar. Car hire uses it: a ride is booked through the form below,
   * because it needs a date and a time a cart line cannot carry.
   */
  orderable?: boolean;
  /**
   * "list" stacks every category down the page, which suits a short list you
   * can take in at a glance. "cards" shows the categories only and opens one
   * at a time in a dialog, which is the difference between a menu and a wall
   * once a section runs to ninety dishes.
   */
  layout?: "list" | "cards";
  /** Singular noun for the card counts, e.g. "dish". Cards layout only. */
  noun?: string;
  /** Rendered under the last category. The car hire booking form lives here. */
  children?: ReactNode;
}) {
  const groups = group(items, section);
  const cards = layout === "cards";

  return (
    <>
      {/* masthead: type hard left, plate running off the right edge */}
      <section className="mx-auto max-w-380 px-5 pt-14 lg:pl-12 lg:pr-0 lg:pt-20">
        <div className="grid items-end gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <Eyebrow className="text-gold-deep">{eyebrow}</Eyebrow>
            <h1 className="display mt-7 text-[clamp(2.4rem,4.4vw,3.85rem)] leading-none text-ink">
              {title}
              <em className="block font-normal italic text-gold-deep">{italic}</em>
            </h1>
            <p className="mt-8 max-w-lg text-[0.98rem] leading-[1.8] text-ink-2">{body}</p>
          </div>

          <div className="aspect-16/10 overflow-hidden rounded-l-sm border border-ink/12 lg:col-span-6 lg:aspect-5/3">
            <Plate
              src={heroPhoto ? unsplash(heroPhoto, 1100) : null}
              alt={`The ${section} at Bliss Urban`}
              seed={`${section}-hero`}
              priority
            />
          </div>
        </div>

        {/* In cards layout the cards below are the navigation, so a second
            list of the same category names would only repeat itself. */}
        {cards ? (
          <div className="foil-t mt-16 pt-7 lg:pr-12">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink-2">
              {groups.length} sections. Open one to see what is in it.
            </p>
          </div>
        ) : (
          <nav
            aria-label="Menu categories"
            className="foil-t mt-16 flex flex-wrap gap-x-8 gap-y-3 pt-7 lg:pr-12"
          >
            {groups.map((g, i) => (
              <a
                key={g.category}
                href={`#${slug(g.category)}`}
                className="group flex items-baseline gap-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink-2 transition hover:text-ink"
              >
                <span className="tabular text-[0.6rem] text-gold">{step(i)}</span>
                {g.category}
              </a>
            ))}
          </nav>
        )}
      </section>

      <div className="mx-auto max-w-380 px-5 lg:px-12">
        {cards ? (
          <div className="pt-14">
            <MenuGroups groups={groups} orderable={orderable} noun={noun} />
          </div>
        ) : (
          groups.map((g, gi) => (
            <section key={g.category} id={slug(g.category)} className="scroll-mt-28 pt-20">
              {/* category label hangs in the left margin on wide screens */}
              <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-3">
                  <span className="tabular text-[0.62rem] font-semibold text-gold">{step(gi)}</span>
                  <h2 className="display mt-2 text-[clamp(1.6rem,2.8vw,2.2rem)] leading-tight text-ink lg:sticky lg:top-28">
                    {g.category}
                  </h2>
                </div>

                <ul className="lg:col-span-9">
                  {g.items.map((item) => (
                    <MenuRow key={item._id} item={item} orderable={orderable} />
                  ))}
                </ul>
              </div>
            </section>
          ))
        )}

        {children}
      </div>

      {orderable ? <CartBar /> : null}
    </>
  );
}
