import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./src/sanity/env";

/**
 * Lets the Sanity CLI resolve the project without `-p <id>` on every command,
 * so `sanity cors add`, `sanity hooks create` and `sanity datasets` work from
 * the repo root. Same project and dataset as the app, defaults included.
 */
export default defineCliConfig({ api: { projectId, dataset } });
