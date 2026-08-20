import { AddToCart } from "./AddToCart";
import { Tag } from "./ui";
import { naira } from "@/lib/format";
import type { MenuItem } from "@/sanity/lib/types";

/**
 * One line of a printed menu: the dish hard left, a dotted leader carrying the
 * eye across, the price hard right. Shared by the stacked list and the category
 * modal so a dish looks the same wherever it is read.
 */
export function MenuRow({ item, orderable }: { item: MenuItem; orderable: boolean }) {
  return (
    <li className="rule-ink flex items-start gap-3 py-6 first:border-t-0 first:pt-0 sm:gap-5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <h3 className="display text-[1.15rem] leading-tight text-ink">{item.name}</h3>
          {item.tags?.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
        {item.description ? (
          <p className="mt-2 max-w-md text-[0.85rem] leading-[1.7] text-ink-2">{item.description}</p>
        ) : null}
      </div>

      {/* leader, the way a printed menu carries the eye to the price */}
      <div
        aria-hidden
        className="mt-3.5 hidden h-px flex-1 self-start border-b border-dotted border-ink/25 sm:block"
      />

      {/* the price column is only pinned from sm up; on a phone those 96px
          come off the dish name, which has nowhere else to go */}
      <p
        className={`tabular display mt-0.5 shrink-0 text-right text-ink sm:w-24 ${
          item.onRequest ? "text-[0.8rem] leading-6 text-ink-2" : "text-[1.15rem]"
        }`}
      >
        {item.onRequest ? "On request" : naira(item.price)}
      </p>

      {/* the spacer keeps an "On request" row's price in the same column as
          every priced row above it */}
      {orderable ? (
        item.onRequest ? <div aria-hidden className="w-20 shrink-0" /> : <AddToCart item={item} />
      ) : null}
    </li>
  );
}
