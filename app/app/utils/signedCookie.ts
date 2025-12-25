export type BookmarkPayload = {
  ids: string[];
  iat: number; // issued-at unix seconds
};

export const BOOKMARK_COOKIE_NAME = "edge_saved";
const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

// ---- helpers: base64 (standard) ----
function base64EncodeBytes(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64DecodeToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function utf8Encode(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function utf8Decode(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

export function makeNoStoreHeaders(init?: HeadersInit): Headers {
  const h = new Headers(init);
  h.set("Cache-Control", "private, no-store");
  return h;
}

function parseCookieHeader(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  const out: Record<string, string> = {};
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 0) continue;
    const k = trimmed.slice(0, idx);
    const v = trimmed.slice(idx + 1);
    out[k] = v;
  }
  return out;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  const keyData = utf8Encode(secret);
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function hmacSign(secret: string, messageBytes: Uint8Array): Promise<Uint8Array> {
  const key = await importHmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, messageBytes);
  return new Uint8Array(sig);
}

async function hmacVerify(secret: string, messageBytes: Uint8Array, signatureBytes: Uint8Array): Promise<boolean> {
  const key = await importHmacKey(secret);
  return crypto.subtle.verify("HMAC", key, signatureBytes, messageBytes);
}

// Cookie format: base64(payload).base64(signature)
export async function encodeSignedBookmarksCookie(ids: string[], secret: string): Promise<string> {
  const payload: BookmarkPayload = {
    ids: Array.from(new Set(ids)).sort(),
    iat: Math.floor(Date.now() / 1000),
  };

  const payloadJson = JSON.stringify(payload);
  const payloadBytes = utf8Encode(payloadJson);

  const payloadB64 = base64EncodeBytes(payloadBytes);
  const sigBytes = await hmacSign(secret, payloadBytes);
  const sigB64 = base64EncodeBytes(sigBytes);

  return `${payloadB64}.${sigB64}`;
}

export async function readVerifiedBookmarksFromRequest(
  request: Request,
  secret: string
): Promise<{ ids: Set<string>; invalid: boolean }> {
  const cookies = parseCookieHeader(request.headers.get("Cookie"));
  const raw = cookies[BOOKMARK_COOKIE_NAME];
  if (!raw) return { ids: new Set(), invalid: false };

  const [payloadB64, sigB64] = raw.split(".");
  if (!payloadB64 || !sigB64) return { ids: new Set(), invalid: true };

  try {
    const payloadBytes = base64DecodeToBytes(payloadB64);
    const sigBytes = base64DecodeToBytes(sigB64);

    const ok = await hmacVerify(secret, payloadBytes, sigBytes);
    if (!ok) return { ids: new Set(), invalid: true };

    const payloadJson = utf8Decode(payloadBytes);
    const parsed = JSON.parse(payloadJson) as BookmarkPayload;

    if (!parsed || !Array.isArray(parsed.ids)) return { ids: new Set(), invalid: true };

    const ids = new Set<string>();
    for (const id of parsed.ids) {
      if (typeof id === "string" && id.length > 0) ids.add(id);
    }
    return { ids, invalid: false };
  } catch {
    return { ids: new Set(), invalid: true };
  }
}

export function buildSetCookie(value: string, maxAgeSeconds = DEFAULT_MAX_AGE_SECONDS): string {
  // Required attributes in task: HttpOnly, Secure, SameSite=Lax, Path=/
  return `${BOOKMARK_COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

export function buildClearCookie(): string {
  return `${BOOKMARK_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
