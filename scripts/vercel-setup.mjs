/**
 * Pushes .env.local to Vercel and deploys, without a browser.
 *
 *   VERCEL_TOKEN=... node scripts/vercel-setup.mjs
 *
 * Get the token from vercel.com/account/tokens. Everything the Vercel CLI does
 * accepts --token, so nothing here needs an interactive login.
 *
 * Steps, in order:
 *   1. link the directory to a Vercel project (creates it if absent)
 *   2. push every non-empty variable in .env.local to production
 *   3. deploy to production
 *   4. attach the domain, if --domain is given
 *   5. report whether Deployment Protection would block Googlebot
 *
 * Flags:
 *   --domain=blissurbanhotels.com   attach this domain after deploying
 *   --project=blissurban            project name to link (default: blissurban)
 *   --skip-deploy                   set the variables but do not build
 *   --dry-run                       print the plan, change nothing
 */
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const TOKEN = process.env.VERCEL_TOKEN ?? "";
const args = process.argv.slice(2);
const flag = (n) => args.some((a) => a === `--${n}`);
const value = (n) => args.find((a) => a.startsWith(`--${n}=`))?.split("=").slice(1).join("=");

const DRY = flag("dry-run");
const PROJECT = value("project") ?? "blissurban";
const DOMAIN = value("domain");

// A token is optional: `vercel login` leaves a session the CLI picks up by
// itself. It is only needed for the REST calls at the end, which have no CLI
// equivalent.
if (!TOKEN) {
  console.log("\n  No VERCEL_TOKEN — using the logged-in CLI session.");
  console.log("  (The Deployment Protection check needs a token and is skipped.)");
}

if (!existsSync(".env.local")) {
  console.error("\n  .env.local not found. Nothing to push.");
  process.exit(1);
}

/**
 * Anything prefixed NEXT_PUBLIC_ is compiled into the JavaScript at build time
 * rather than read per request, so setting one changes nothing until the next
 * deploy. That is why the deploy in step 3 comes after the variables.
 */
const env = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (!m) continue;
  const [, key, raw] = m;
  const val = raw.trim();
  // Blank is meaningful locally (Telegram falls back to WhatsApp), but an
  // empty variable on Vercel is just noise, so those are skipped.
  if (!val) continue;
  // VERCEL_* are the platform's own. next build writes VERCEL_OIDC_TOKEN into
  // .env.local by itself; it is short-lived and Vercel-managed, so setting it
  // as a project variable would both leak a credential and break the rotation.
  if (key.startsWith("VERCEL_")) continue;
  env[key] = val;
}

const secret = (k) => /TOKEN|SECRET/.test(k);
console.log(`\n  ${Object.keys(env).length} variables to push:`);
for (const k of Object.keys(env)) console.log(`    ${k}=${secret(k) ? "<hidden>" : env[k]}`);

// On Windows the CLI is a .cmd shim, which execFileSync cannot spawn by the
// bare name. Naming it explicitly avoids needing shell: true.
const BIN = process.platform === "win32" ? "vercel.cmd" : "vercel";

const vercel = (argv, input) => {
  if (DRY) {
    console.log(`    would run: vercel ${argv.join(" ")}`);
    return "";
  }
  return execFileSync(BIN, TOKEN ? [...argv, "--token", TOKEN] : argv, {
    input,
    encoding: "utf8",
    // Node 24 refuses to spawn a .cmd without a shell. Variable *values* are
    // piped through stdin rather than argv, so nothing user-supplied is ever
    // parsed by the shell.
    shell: process.platform === "win32",
    stdio: input === undefined ? ["ignore", "pipe", "pipe"] : ["pipe", "pipe", "pipe"],
  });
};

// --- 1. link -----------------------------------------------------------------

console.log("\n  Linking project...");
try {
  vercel(["link", "--yes", "--project", PROJECT]);
  console.log(`    linked to ${PROJECT}`);
} catch (err) {
  console.error(`    link failed: ${err.stderr || err.message}`);
  process.exit(1);
}

// --- 2. environment variables ------------------------------------------------

console.log("\n  Pushing variables to production...");
for (const [key, val] of Object.entries(env)) {
  // `env add` refuses to overwrite, so remove first. A missing variable makes
  // the remove fail, which is fine and expected on a first run.
  try {
    vercel(["env", "rm", key, "production", "--yes"]);
  } catch {
    /* not there yet */
  }
  try {
    vercel(["env", "add", key, "production"], val);
    console.log(`    ${key}`);
  } catch (err) {
    console.error(`    ${key} FAILED: ${err.stderr || err.message}`);
  }
}

// --- 3. deploy ---------------------------------------------------------------

let deployUrl = "";
if (flag("skip-deploy")) {
  console.log("\n  --skip-deploy, so nothing was built.");
} else {
  console.log("\n  Deploying to production (this takes a minute)...");
  try {
    const out = vercel(["--prod", "--yes"]);
    deployUrl = (out.match(/https:\/\/[^\s]+\.vercel\.app/g) ?? []).pop() ?? "";
    console.log(`    ${deployUrl || "deployed"}`);
  } catch (err) {
    console.error(`    deploy failed: ${err.stderr || err.message}`);
    process.exit(1);
  }
}

// --- 4. domain ---------------------------------------------------------------

if (DOMAIN) {
  console.log(`\n  Attaching ${DOMAIN}...`);
  try {
    vercel(["domains", "add", DOMAIN, PROJECT]);
    console.log(`    added — follow any DNS instructions Vercel printed above`);
  } catch (err) {
    console.error(`    ${err.stderr || err.message}`);
  }
}

// --- 5. the thing that silently blocks Google --------------------------------

if (!DRY && !TOKEN) {
  console.log("\n  Deployment Protection: not checked (no VERCEL_TOKEN).");
  console.log("    Check by hand: Project -> Settings -> Deployment Protection.");
  console.log("    If it is on, every request returns 401 — Googlebot included.");
} else if (!DRY) {
  console.log("\n  Checking Deployment Protection...");
  const res = await fetch(`https://api.vercel.com/v9/projects/${PROJECT}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (res.ok) {
    const p = await res.json();
    const on = p.ssoProtection || p.passwordProtection;
    if (on) {
      console.log("    ON — every request returns 401, Googlebot included.");
      console.log("    Turn it off: Project -> Settings -> Deployment Protection,");
      console.log("    or with the API:");
      console.log(
        `      curl -X PATCH https://api.vercel.com/v9/projects/${PROJECT} -H "Authorization: Bearer $VERCEL_TOKEN" -H "Content-Type: application/json" -d '{"ssoProtection":null,"passwordProtection":null}'`,
      );
    } else {
      console.log("    off — the site is reachable by crawlers.");
    }
  } else {
    console.log(`    could not read project settings (${res.status})`);
  }
}

console.log("\n  Remaining, and not scriptable:");
console.log("    - Sanity webhook: see DEPLOYMENT.md step 5");
console.log("    - Search Console: verify and submit /sitemap.xml");
if (deployUrl) {
  console.log(`\n  Add the deployed origin to Sanity CORS:`);
  console.log(`    npx sanity cors add ${deployUrl.replace(/\/$/, "")} --credentials`);
}
