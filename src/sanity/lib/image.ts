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
