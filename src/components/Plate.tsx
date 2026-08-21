/* eslint-disable @next/next/no-img-element -- Sanity's CDN returns pre-sized
   URLs, so next/image would only add a second resize we already paid for.
   Plain <img loading="lazy"> covers the rest natively. */
import type { Source } from "@/sanity/lib/image";


/**
 * An image slot. With a Sanity asset it shows the photo. Without one it blocks
 * a foil panel onto the paper: a struck border, corner rules, and a rosette
 * whose geometry comes from the item's name, so no two match.
 *
 * These are placeholders. Replace them with real photography before launch.
 */

function hash(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function polygon(r: number, n: number, rot: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = (rot * Math.PI) / 180 + (i * 2 * Math.PI) / n;
    return `${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

function FoilPanel({ seed, alt }: { seed: string; alt: string }) {
  const h = hash(seed);
  const sides = [6, 8][h % 2];
  const rings = 3 + (h % 2);
  const spin = h % 30;
  const id = `f${(h % 100000).toString(36)}`;

  return (
    <div
      role="img"
      aria-label={`${alt} (placeholder artwork)`}
      className="relative size-full overflow-hidden bg-[linear-gradient(150deg,var(--color-paper-3)_0%,var(--color-paper-4)_60%,#2e2733_100%)] shadow-[inset_0_1px_6px_rgba(0,0,0,0.5)]"
    >
      <svg aria-hidden className="absolute inset-0 size-full text-gold/40">
        <defs>
          <pattern
            id={`${id}-lat`}
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <path d="M0 15h30M15 0v30" fill="none" stroke="currentColor" strokeWidth="0.7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id}-lat)`} />
      </svg>

      <div className="absolute inset-[5.5%] border border-gold/70" />
      <div className="absolute inset-[7.5%] border border-ink/15" />

      {[
        "left-[5.5%] top-[5.5%]",
        "right-[5.5%] top-[5.5%] rotate-90",
        "right-[5.5%] bottom-[5.5%] rotate-180",
        "left-[5.5%] bottom-[5.5%] -rotate-90",
      ].map((pos) => (
        <svg
          key={pos}
          viewBox="0 0 20 20"
          aria-hidden
          className={`absolute size-5 origin-center text-gold/70 ${pos}`}
          style={{ margin: "-1px" }}
        >
          <path d="M0 8h4a4 4 0 0 0 4-4V0" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      ))}

      <div className="absolute inset-0 grid place-items-center p-[12%]">
        <svg viewBox="0 0 100 100" aria-hidden className="aspect-square h-full max-h-56 w-auto text-gold-deep/85">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            {Array.from({ length: rings }, (_, i) => (
              <polygon key={i} points={polygon(40 - i * (26 / rings), sides, spin + i * (180 / sides))} />
            ))}
            <circle cx="50" cy="50" r="30" strokeWidth="0.55" />
            <circle cx="50" cy="50" r="3.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export function Plate({
  src,
  alt,
  seed,
  className = "",
  sizes,
  priority = false,
}: {
  src: Source | null;
  alt: string;
  seed: string;
  className?: string;
  /**
   * How wide this slot actually renders, as a CSS media condition. Without it
   * the browser assumes the image fills the viewport and picks the largest
   * candidate, which throws away most of what srcSet buys us.
   */
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) return <FoilPanel seed={seed} alt={alt} />;

  return (
    <img
      src={src.src}
      srcSet={src.srcSet}
      sizes={src.srcSet ? (sizes ?? "100vw") : undefined}
      width={src.width}
      height={src.height}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding={priority ? "sync" : "async"}
      className={`size-full object-cover ${className}`}
    />
  );
}
