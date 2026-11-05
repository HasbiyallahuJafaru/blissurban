import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export const dynamic = "force-static";

import { metadata as studioMetadata } from "next-sanity/studio";

export { viewport } from "next-sanity/studio";

/**
 * robots.txt already disallows /studio, but disallow only stops the crawl —
 * a URL linked from anywhere can still be indexed on the strength of that
 * link alone. noindex is the directive that actually keeps it out.
 */
export const metadata = { ...studioMetadata, robots: { index: false, follow: false } };

export default function StudioPage() {
  return <NextStudio config={config} />;
}
