import { defineCliConfig } from "sanity/cli";

/**
 * Lets the Sanity CLI resolve the project without `-p <id>` on every command,
 * so `sanity cors add`, `sanity hooks create` and `sanity datasets` work from
 * the repo root. Reads the same variables the app does; the CLI loads
 * .env.local itself.
 */
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  },
});
