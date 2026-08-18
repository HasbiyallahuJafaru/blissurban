import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

/** Sanity type -> the fetch tag it invalidates. */
const TAGS: Record<string, string> = {
  siteSettings: "settings",
  room: "rooms",
  menuItem: "menu",
};

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "SANITY_REVALIDATE_SECRET is not set" }, { status: 503 });
  }

  const { isValidSignature, body } = await parseBody<{ _type: string }>(request, secret);

  if (!isValidSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const tag = body?._type ? TAGS[body._type] : undefined;
  if (!tag) {
    return NextResponse.json({ revalidated: false, reason: `Unhandled type: ${body?._type}` });
  }

  // "max" expires the tag immediately, so a published price is live on the
  // next request rather than after the 60s window.
  revalidateTag(tag, "max");
  return NextResponse.json({ revalidated: true, tag });
}
