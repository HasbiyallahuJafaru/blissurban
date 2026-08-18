import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, sanityReady } from "../env";

export const client = sanityReady
  ? createClient({ projectId, dataset, apiVersion, useCdn: true })
  : null;
