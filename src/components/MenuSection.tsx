import { AddToCart } from "./AddToCart";
import { CartBar } from "./CartBar";
import { Plate } from "./Plate";
import { Eyebrow, Tag } from "./ui";
import { naira } from "@/lib/format";
import { categoryOrder } from "@/sanity/lib/seed";
import type { MenuItem, Section } from "@/sanity/lib/types";

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
}: {
  section: Section;
  items: MenuItem[];
  eyebrow: string;
  title: string;
  italic: string;
  body: string;
}) {
  const groups = group(items, section);

  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pt-12 lg:px-10 lg:pt-16">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
          <div>
            <Eyebrow className="text-leaf">{eyebrow}</Eyebrow>
            <h1 className="display mt-6 text-[clamp(2.6rem,6vw,4.4rem)] leading-[1] text-bone">
              {title}
              <em className="block font-normal italic text-leaf">{italic}</em>
            </h1>
            <p className="mt-7 max-w-lg text-[0.98rem] leading-[1.7] text-bone-dim">{body}</p>
          </div>
          <div className="plate aspect-16/10 overflow-hidden lg:aspect-4/3">
            <Plate src={null} alt={`The ${section}`} seed={`${section}-hero`} priority />
          </div>
        </div>

        <nav aria-label="Menu categories" className="tooled-t mt-14 flex flex-wrap gap-x-6 gap-y-3 pt-6">
          {groups.map((g) => (
            <a
              key={g.category}
              href={`#${slug(g.category)}`}
              className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-bone-dim transition hover:text-leaf"
            >
              {g.category}
            </a>
          ))}
        </nav>
      </section>

      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        {groups.map((g) => (
          <section key={g.category} id={slug(g.category)} className="scroll-mt-28 pt-16">
            <h2 className="display text-[clamp(1.5rem,2.6vw,2.1rem)] text-leaf">{g.category}</h2>

            <ul className="mt-6">
              {g.items.map((item) => (
                <li
                  key={item._id}
                  className="tooled-t flex items-start gap-5 py-5 first:border-t-0 first:shadow-none"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                      <h3 className="display text-lg leading-tight text-bone">{item.name}</h3>
                      {item.tags?.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </div>
                    {item.description ? (
                      <p className="mt-1.5 max-w-md text-[0.85rem] leading-relaxed text-bone-dim">
                        {item.description}
                      </p>
                    ) : null}
                  </div>

                  {/* leader rule, the way a printed menu carries the eye to the price */}
                  <div
                    aria-hidden
                    className="mt-3 hidden h-px flex-1 self-start border-b border-dotted border-leaf/25 sm:block"
                  />

                  <p className="tabular display mt-1 w-24 shrink-0 text-right text-lg text-leaf">
                    {naira(item.price)}
                  </p>
                  <AddToCart item={item} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <CartBar />
    </>
  );
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
