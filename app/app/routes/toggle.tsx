import * as React from "react";
import {
  buildClearCookie,
  buildSetCookie,
  encodeSignedBookmarksCookie,
  makeNoStoreHeaders,
  readVerifiedBookmarksFromRequest,
} from "../utils/signedCookie";

function getEnvSecret(context: any): string {
  const secret = context?.cloudflare?.env?.APP_SECRET;
  return typeof secret === "string" ? secret : "";
}

function safeReturnTo(value: FormDataEntryValue | null): string {
  const s = typeof value === "string" ? value : "";
  // prevent open redirect
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  return "/";
}

export async function action({ request, context }: { request: Request; context: any }) {
  const secret = getEnvSecret(context);
  if (!secret) {
    throw new Response("Missing APP_SECRET in environment.", { status: 500 });
  }

  const form = await request.formData();
  const articleId = form.get("articleId");
  const returnTo = safeReturnTo(form.get("returnTo"));

  if (typeof articleId !== "string" || articleId.length === 0) {
    throw new Response("Invalid articleId.", { status: 400 });
  }

  const { ids, invalid } = await readVerifiedBookmarksFromRequest(request, secret);

  // fail closed: if invalid cookie, start from empty set
  const next = new Set<string>(invalid ? [] : Array.from(ids));
  if (next.has(articleId)) next.delete(articleId);
  else next.add(articleId);

  const headers = makeNoStoreHeaders();

  try {
    const cookieValue = await encodeSignedBookmarksCookie(Array.from(next), secret);
    headers.append("Set-Cookie", buildSetCookie(cookieValue));
  } catch {
    headers.append("Set-Cookie", buildClearCookie());
  }

  headers.set("Location", returnTo);
  return new Response(null, { status: 302, headers });
}

export default function Toggle() {
  return null;
}
