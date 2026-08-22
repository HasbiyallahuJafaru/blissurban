import { createImageUrlBuilder } from "@sanity/image-url";
import { dataset, projectId, sanityReady } from "../env";
import type { SanityImage } from "./types";

const builder = sanityReady ? createImageUrlBuilder({ projectId, dataset }) : null;

/**
 * One image, ready for an <img>. `srcSet` lets the browser pick a size, so a
 * 360px phone stops downloading the 2000px hero. `width`/`height` are the
 * rendered box, present only when we know the source's real proportions.
 */
export type Source = {
  src: string;
  srcSet?: string;
  width?: number;
  height?: number;
};

/**
 * The ladder of widths we offer the browser, in device pixels. It has to run
 * *below* the rendered size as well as above it, or a 360px phone is left with
 * nothing to pick but the desktop render and srcSet buys nothing.
 */
const LADDER = [320, 480, 640, 768, 1024, 1280, 1536, 1920, 2560, 3200];

/**
 * A Sanity asset ref spells out its own dimensions: `image-<id>-1600x900-jpg`.
 * Reading them here means no GROQ projection has to expand `asset->metadata`,
 * so adding responsive images cost nothing at the query layer.
 */
function nativeSize(ref?: string) {
  const m = /-(\d+)x(\d+)-/.exec(ref ?? "");
  if (!m) return null;
  return { width: Number(m[1]), height: Number(m[2]) };
}

function widths(target: number, native?: number) {
  // Twice the rendered size covers retina; past the original the CDN would
  // only upscale, so the source's own width is the hard ceiling.
  const ceiling = Math.min(target * 2, native ?? Infinity);
  const out = LADDER.filter((w) => w <= ceiling);
  // Keep the ceiling itself so the largest screen gets an exact render.
  if (out[out.length - 1] !== ceiling) out.push(Math.round(ceiling));
  return [...new Set(out)];
}

/** Sanity's CDN does the resizing, so next/image never has to. */
export function imageUrl(source: SanityImage, width: number): Source | null {
  if (!builder || !source?.asset?._ref) return null;

  const native = nativeSize(source.asset._ref);
  const at = (w: number) => builder.image(source).width(w).auto("format").fit("crop").url();
  const sizes = widths(width, native?.width);

  return {
    src: at(width),
    srcSet: sizes.map((w) => `${at(w)} ${w}w`).join(", "),
    width,
    height: native ? Math.round((width * native.height) / native.width) : undefined,
  };
}

/** Stand-in photography. Replace with real pictures of the hotel before launch. */
export function unsplash(id: string, width: number): Source {
  const at = (w: number) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;
  return {
    src: at(width),
    srcSet: widths(width).map((w) => `${at(w)} ${w}w`).join(", "),
  };
}

/**
 * A real Sanity asset wins. Otherwise fall back to the stand-in photo, and
 * failing that return null so Plate draws its foil panel.
 */
export function picture(image: SanityImage, photoId: string | undefined, width: number) {
  return imageUrl(image, width) ?? (photoId ? unsplash(photoId, width) : null);
}
