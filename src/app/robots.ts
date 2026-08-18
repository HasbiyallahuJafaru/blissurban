import type { MetadataRoute } from "next";

// `||` not `??`: an env var set to an empty string would otherwise produce
// relative URLs like "/rooms" in robots.txt.
const base = process.env.NEXT_PUBLIC_SITE_URL || "https://blissurban.example";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/studio", "/cart", "/api"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
