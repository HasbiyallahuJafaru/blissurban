import type { MetadataRoute } from "next";
import { getLastModified } from "@/sanity/lib/fetch";
import { SITE } from "@/lib/seo";

const PAGES = ["", "/rooms", "/restaurant", "/lounge", "/laundry", "/car-hire"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const updated = await getLastModified();
  // Omitted rather than faked when there is no CMS to ask.
  const lastModified = updated ? new Date(updated) : undefined;

  return PAGES.map((path) => ({
    url: `${SITE}${path}`,
    ...(lastModified ? { lastModified } : {}),
    changeFrequency: path === "" ? "weekly" : "daily",
    priority: path === "" ? 1 : 0.8,
  }));
}
