import type { ReactNode } from "react";
import { AddToCart } from "./AddToCart";
import { CartBar } from "./CartBar";
import { Plate } from "./Plate";
import { Eyebrow, Tag } from "./ui";
import { naira } from "@/lib/format";
import { unsplash } from "@/sanity/lib/image";
import { categoryOrder } from "@/sanity/lib/seed";
import type { MenuItem, Section } from "@/sanity/lib/types";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* Two digits, because the lounge runs to ten categories and "010" is not a
   number anyone writes. */
const index = (i: number) => String(i + 1).padStart(2, "0");

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
  /** Rendered under the last category. The car hire booking form lives here. */
  children?: ReactNode;
}) {
  const groups = group(items, section);

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
              <span className="tabular text-[0.6rem] text-gold">{index(i)}</span>
              {g.category}
            </a>
          ))}
        </nav>
      </section>

      <div className="mx-auto max-w-380 px-5 lg:px-12">
        {groups.map((g, gi) => (
          <section key={g.category} id={slug(g.category)} className="scroll-mt-28 pt-20">
            {/* category label hangs in the left margin on wide screens */}
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <span className="tabular text-[0.62rem] font-semibold text-gold">{index(gi)}</span>
                <h2 className="display mt-2 text-[clamp(1.6rem,2.8vw,2.2rem)] leading-tight text-ink lg:sticky lg:top-28">
                  {g.category}
                </h2>
              </div>

              <ul className="lg:col-span-9">
                {g.items.map((item) => (
                  <li
                    key={item._id}
                    className="rule-ink flex items-start gap-5 py-6 first:border-t-0 first:pt-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                        <h3 className="display text-[1.15rem] leading-tight text-ink">{item.name}</h3>
                        {item.tags?.map((t) => (
                          <Tag key={t}>{t}</Tag>
                        ))}
                      </div>
                      {item.description ? (
                        <p className="mt-2 max-w-md text-[0.85rem] leading-[1.7] text-ink-2">
                          {item.description}
                        </p>
                      ) : null}
                    </div>

                    {/* leader, the way a printed menu carries the eye to the price */}
                    <div
                      aria-hidden
                      className="mt-3.5 hidden h-px flex-1 self-start border-b border-dotted border-ink/25 sm:block"
                    />

                    <p
                      className={`tabular display mt-0.5 w-24 shrink-0 text-right text-ink ${
                        item.onRequest ? "text-[0.8rem] leading-6 text-ink-2" : "text-[1.15rem]"
                      }`}
                    >
                      {item.onRequest ? "On request" : naira(item.price)}
                    </p>
                    {/* the spacer keeps an "On request" row's price in the same
                        column as every priced row above it */}
                    {orderable ? (
                      item.onRequest ? (
                        <div aria-hidden className="w-20 shrink-0" />
                      ) : (
                        <AddToCart item={item} />
                      )
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}

        {children}
      </div>

      {orderable ? <CartBar /> : null}
    </>
  );
}
