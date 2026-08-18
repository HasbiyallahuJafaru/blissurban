/**
 * The particle field behind everything: gold dust with a sparser scatter of
 * soft white droplets, softly blurred so nothing reads as a hard dot.
 *
 * It scrolls with the page rather than sitting fixed, so it is drawn as a
 * repeating tile rather than one stretched SVG. A single 900px tile repeated
 * down the document keeps the density even however long the page gets, which
 * a `slice`-scaled SVG would not.
 *
 * Positions come from a seeded PRNG, so the tile is identical on the server
 * and the client and hydration never mismatches.
 */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TILE = 900;

function circles(
  count: number,
  seed: number,
  fill: string,
  rMin: number,
  rMax: number,
  oMin: number,
  oMax: number,
) {
  const rand = mulberry32(seed);
  let out = "";
  for (let i = 0; i < count; i++) {
    const cx = (rand() * TILE).toFixed(1);
    const cy = (rand() * TILE).toFixed(1);
    const r = (rMin + rand() * (rMax - rMin)).toFixed(2);
    const o = (oMin + rand() * (oMax - oMin)).toFixed(3);
    out += `<circle cx='${cx}' cy='${cy}' r='${r}' fill='${fill}' opacity='${o}'/>`;
  }
  return out;
}

const tile =
  `<svg xmlns='http://www.w3.org/2000/svg' width='${TILE}' height='${TILE}' viewBox='0 0 ${TILE} ${TILE}'>` +
  circles(130, 20260818, "%23f0e0b0", 0.5, 1.9, 0.14, 0.55) +
  circles(36, 77345, "%23ffffff", 1, 3, 0.05, 0.16) +
  `</svg>`;

export function Dust() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 blur-[1.1px]"
      style={{
        backgroundImage: `url("data:image/svg+xml,${tile}")`,
        backgroundRepeat: "repeat",
        backgroundSize: `${TILE}px ${TILE}px`,
      }}
    />
  );
}
