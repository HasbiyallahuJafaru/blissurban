import type { MetadataRoute } from "next";

// `||` not `??`: an env var set to an empty string would otherwise produce
// relative URLs like "/rooms" in the sitemap.
const base = process.env.NEXT_PUBLIC_SITE_URL || "https://blissurban.example";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/rooms", "/restaurant", "/lounge", "/laundry", "/car-hire"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "daily",
    priority: path === "" ? 1 : 0.8,
  }));
}
