/** The hotel's project. Public, like the dataset; override only to point at another one. */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "9225tb8w";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-03-01";
