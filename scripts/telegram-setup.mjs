/**
 * Sets up the staff Telegram group from the command line.
 *
 *   TELEGRAM_BOT_TOKEN=123456:ABC... node scripts/telegram-setup.mjs
 *
 * What you still have to do by hand first, because no API can do it:
 *
 *   1. Message @BotFather, send /newbot, copy the token.
 *   2. Create a group, open its settings and turn Topics on.
 *   3. Add the bot to the group and make it an administrator, with the
 *      "Manage Topics" permission ticked.
 *   4. Send any message in the group.
 *
 * From there this script finds the group, creates the five topics, reads the
 * thread id straight out of each reply, and writes all six numbers into
 * .env.local. DEPLOYMENT.md used to tell you to right-click every topic and
 * copy the number off the end of its link; createForumTopic hands it back
 * directly, so that step does not need to exist.
 *
 * Flags:
 *   --chat-id=-100...  skip discovery and use this group
 *   --test             post one message into each topic to prove routing
 *   --dry-run          show what would happen, create nothing
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const args = process.argv.slice(2);
const flag = (name) => args.some((a) => a === `--${name}`);
const value = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");

const DRY = flag("dry-run");
const TEST = flag("test");

/** Topic name -> the environment variable the route handler reads. */
const TOPICS = [
  { name: "Reservations", env: "TELEGRAM_TOPIC_RESERVATIONS" },
  { name: "Restaurant", env: "TELEGRAM_TOPIC_RESTAURANT" },
  { name: "Lounge", env: "TELEGRAM_TOPIC_LOUNGE" },
  { name: "Laundry", env: "TELEGRAM_TOPIC_LAUNDRY" },
  { name: "Car Hire", env: "TELEGRAM_TOPIC_TRANSPORT" },
];

function die(message, hint) {
  console.error(`\n  ${message}`);
  if (hint) console.error(`  ${hint}`);
  process.exit(1);
}

// A rejected top-level await would otherwise print a stack trace, which tells
// nobody anything useful about a mistyped token.
const fail = (err) => {
  const message = err instanceof Error ? err.message : String(err);
  die(
    message,
    /401|Unauthorized/.test(message)
      ? "That token was rejected. Copy it again from @BotFather."
      : /ConnectTimeout|fetch failed|ENOTFOUND/.test(message)
        ? "Could not reach api.telegram.org. Check the connection and re-run."
        : undefined,
  );
};

// A rejected top-level await surfaces as an uncaught exception rather than an
// unhandled rejection, so both are covered.
process.on("uncaughtException", fail);
process.on("unhandledRejection", fail);

if (!TOKEN) {
  die(
    "TELEGRAM_BOT_TOKEN is not set.",
    "Run: TELEGRAM_BOT_TOKEN=123456:ABC... node scripts/telegram-setup.mjs",
  );
}

async function api(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const json = await res.json();
  if (!json.ok) {
    throw new Error(`${method}: ${json.description ?? "unknown error"} (${json.error_code})`);
  }
  return json.result;
}

// --- 1. the token itself -----------------------------------------------------

const me = await api("getMe");
console.log(`\n  Bot: @${me.username} (${me.first_name})`);

// --- 2. find the group -------------------------------------------------------

let chatId = value("chat-id");

if (!chatId) {
  // my_chat_member fires when the bot is added or promoted, and arrives even
  // with privacy mode on, so it is a more reliable signal than a plain message.
  const updates = await api("getUpdates", { timeout: 0, limit: 100 });
  const chats = new Map();
  const channels = new Map();
  for (const u of updates) {
    const chat =
      u.message?.chat ?? u.my_chat_member?.chat ?? u.channel_post?.chat ?? u.edited_message?.chat;
    if (!chat) continue;
    if (chat.type === "supergroup" || chat.type === "group") chats.set(chat.id, chat);
    // Worth calling out by name: a channel looks like the right thing until you
    // go looking for topics, which channels simply do not have.
    if (chat.type === "channel") channels.set(chat.id, chat);
  }

  if (chats.size === 0 && channels.size > 0) {
    const names = [...channels.values()].map((c) => `"${c.title}"`).join(", ");
    die(
      `Found ${names}, but that is a channel, not a group.`,
      [
        "Channels have no Topics, so the five department threads cannot exist",
        "  there, and a channel cannot be converted into a group. Create a new",
        "  Group, turn Topics on in its settings, add the bot as an administrator",
        "  with Manage Topics, send a message in the group, then re-run.",
      ].join("\n"),
    );
  }

  if (chats.size === 0) {
    die(
      "No group found in the bot's recent updates.",
      "Add the bot to the group as an administrator, send a message there, then re-run.\n" +
        "  Or pass it directly: --chat-id=-1001234567890",
    );
  }
  if (chats.size > 1) {
    console.error("\n  More than one group found. Re-run with one of:");
    for (const c of chats.values()) console.error(`    --chat-id=${c.id}   (${c.title})`);
    process.exit(1);
  }

  const chat = [...chats.values()][0];
  chatId = String(chat.id);
  console.log(`  Group: ${chat.title} (${chatId})`);

  if (!chat.is_forum) {
    die(
      "That group does not have Topics turned on.",
      "Open the group's settings, enable Topics, then re-run.",
    );
  }
}

// --- 3. check the bot can actually manage topics -----------------------------

const member = await api("getChatMember", { chat_id: chatId, user_id: me.id });
if (member.status !== "administrator" && member.status !== "creator") {
  die(
    `The bot is "${member.status}" in that group, not an administrator.`,
    "Promote it in the group's settings, then re-run.",
  );
}
if (member.status === "administrator" && member.can_manage_topics === false) {
  die(
    "The bot is an administrator but cannot manage topics.",
    'Tick "Manage Topics" on its admin permissions, then re-run.',
  );
}

// --- 4. create the topics ----------------------------------------------------

// There is no API to list existing topics, so anything already recorded in
// .env.local is left alone rather than created a second time.
const envPath = ".env.local";
const envText = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
const existing = (key) => new RegExp(`^${key}=(.+)$`, "m").exec(envText)?.[1]?.trim();

const results = [];
for (const topic of TOPICS) {
  const already = existing(topic.env);
  if (already) {
    console.log(`  ${topic.name.padEnd(13)} ${already}  (already in .env.local, left alone)`);
    results.push({ ...topic, id: already, reused: true });
    continue;
  }
  if (DRY) {
    console.log(`  ${topic.name.padEnd(13)} would be created`);
    results.push({ ...topic, id: "", reused: false });
    continue;
  }
  const created = await api("createForumTopic", { chat_id: chatId, name: topic.name });
  console.log(`  ${topic.name.padEnd(13)} ${created.message_thread_id}`);
  results.push({ ...topic, id: String(created.message_thread_id), reused: false });
}

// --- 5. optional delivery test ----------------------------------------------

if (TEST && !DRY) {
  console.log("\n  Posting a test message into each topic...");
  for (const r of results) {
    await api("sendMessage", {
      chat_id: chatId,
      message_thread_id: Number(r.id),
      text: `Setup check — this thread receives ${r.name.toLowerCase()}.`,
    });
  }
  console.log("  Sent. Check each thread in the group.");
}

// --- 6. write it down --------------------------------------------------------

const values = { TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_CHAT_ID: chatId };
for (const r of results) values[r.env] = r.id;

if (DRY) {
  console.log("\n  --dry-run, so .env.local was not touched. Would have written:");
  for (const [k, v] of Object.entries(values)) {
    console.log(`    ${k}=${k === "TELEGRAM_BOT_TOKEN" ? "<token>" : v}`);
  }
} else {
  let next = envText;
  for (const [k, v] of Object.entries(values)) {
    const line = `${k}=${v}`;
    next = new RegExp(`^${k}=.*$`, "m").test(next)
      ? next.replace(new RegExp(`^${k}=.*$`, "m"), line)
      : `${next.trimEnd()}\n${line}\n`;
  }
  writeFileSync(envPath, next, "utf8");
  console.log(`\n  Written to ${envPath}.`);
  console.log("  Push the same values to Vercel with: node scripts/vercel-setup.mjs");
}
