import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";
import { sanityReady } from "@/sanity/env";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  if (!sanityReady) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24">
        <h1 className="display text-3xl text-bone">Studio is not connected yet</h1>
        <p className="mt-5 text-sm leading-relaxed text-bone-dim">
          Create a project at sanity.io/manage, then put its id in{" "}
          <code className="text-leaf">.env.local</code> and restart the dev server:
        </p>
        <pre className="plate mt-5 overflow-x-auto p-5 text-xs text-leaf">
          NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id{"\n"}
          NEXT_PUBLIC_SANITY_DATASET=production
        </pre>
        <p className="mt-5 text-sm leading-relaxed text-bone-dim">
          Until then the site runs on the seed content in{" "}
          <code className="text-leaf">src/sanity/lib/seed.ts</code>.
        </p>
      </main>
    );
  }

  return <NextStudio config={config} />;
}
