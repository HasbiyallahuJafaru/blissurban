import imageUrlBuilder from "@sanity/image-url";
import { dataset, projectId, sanityReady } from "../env";
import type { SanityImage } from "./types";

const builder = sanityReady ? imageUrlBuilder({ projectId, dataset }) : null;

/**
 * Sanity's CDN does the resizing, so next/image never has to. Returns null
 * when there is no asset, which is the signal to draw the tooled placeholder.
 */
export function imageUrl(source: SanityImage, width: number): string | null {
  if (!builder || !source?.asset?._ref) return null;
  return builder.image(source).width(width).auto("format").fit("crop").url();
}

/** Stand-in photography. Replace with real pictures of the hotel before launch. */
export const unsplash = (id: string, width: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=75`;

/**
 * A real Sanity asset wins. Otherwise fall back to the stand-in photo, and
 * failing that return null so Plate draws its foil panel.
 */
export function picture(image: SanityImage, photoId: string | undefined, width: number) {
  return imageUrl(image, width) ?? (photoId ? unsplash(photoId, width) : null);
}
