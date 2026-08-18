/* eslint-disable @next/next/no-img-element -- Sanity's CDN returns pre-sized
   URLs, so next/image would only add a second resize we already paid for.
   Plain <img loading="lazy"> covers the rest natively. */

/**
 * An image slot. With a Sanity asset it shows the photo. Without one it draws
 * a blind-tooled leather panel: an all-over diaper lattice, a double fillet
 * border, corner fleurons, and a rosette whose geometry comes from the item's
 * name, so every room and dish gets a different one.
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

function TooledPanel({ seed, alt }: { seed: string; alt: string }) {
  const h = hash(seed);
  // Only 6 and 8: squares read as scribble when nested, and 12 sides collapse
  // into wobbly concentric circles.
  const sides = [6, 8][h % 2];
  const rings = 3 + (h % 2);
  const spin = h % 30;
  const id = `t${(h % 100000).toString(36)}`;

  return (
    <div
      role="img"
      aria-label={`${alt} (placeholder artwork)`}
      className="relative size-full overflow-hidden bg-[radial-gradient(125%_100%_at_28%_15%,var(--color-hide-4),var(--color-hide-2)_58%,var(--color-hide)_100%)]"
    >
      {/* all-over diaper lattice, the ground tooling on a bound cover */}
      <svg aria-hidden className="absolute inset-0 size-full text-leaf/22">
        <defs>
          <pattern
            id={`${id}-lat`}
            width="26"
            height="26"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <path d="M0 13h26M13 0v26" fill="none" stroke="currentColor" strokeWidth="0.7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id}-lat)`} />
      </svg>

      {/* double fillet */}
      <div className="absolute inset-[5.5%] border border-leaf/35" />
      <div className="absolute inset-[7.5%] border border-leaf/18" />

      {/* corner fleurons on the inner fillet */}
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
          className={`absolute size-5 origin-center text-leaf/45 ${pos}`}
          style={{ margin: "-1px" }}
        >
          <path d="M0 8h4a4 4 0 0 0 4-4V0" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      ))}

      {/* centre rosette */}
      <div className="absolute inset-0 grid place-items-center p-[12%]">
        <svg viewBox="0 0 100 100" aria-hidden className="aspect-square h-full max-h-56 w-auto text-leaf/55">
          <g fill="none" stroke="currentColor" strokeWidth="1.1">
            {/* half-step rotation per ring, so the points interleave into a
                star the way a tooled rosette actually sits */}
            {Array.from({ length: rings }, (_, i) => (
              <polygon key={i} points={polygon(40 - i * (26 / rings), sides, spin + i * (180 / sides))} />
            ))}
            <circle cx="50" cy="50" r="30" strokeWidth="0.6" />
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
  priority = false,
}: {
  src: string | null;
  alt: string;
  seed: string;
  className?: string;
  priority?: boolean;
}) {
  if (!src) return <TooledPanel seed={seed} alt={alt} />;

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      className={`size-full object-cover ${className}`}
    />
  );
}
