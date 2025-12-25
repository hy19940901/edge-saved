import * as React from "react";
import { Form, Link, useLoaderData } from "react-router";
import { ARTICLES } from "../data/articles";
import {
  buildClearCookie,
  makeNoStoreHeaders,
  readVerifiedBookmarksFromRequest,
} from "../utils/signedCookie";

type LoaderData = {
  saved: { id: string; title: string; description: string }[];
  cookieInvalid: boolean;
};

function getEnvSecret(context: any): string {
  const secret = context?.cloudflare?.env?.APP_SECRET;
  return typeof secret === "string" ? secret : "";
}

export async function loader({ request, context }: { request: Request; context: any }) {
  const secret = getEnvSecret(context);
  if (!secret) {
    throw new Response("Missing APP_SECRET in environment.", { status: 500 });
  }

  const { ids, invalid } = await readVerifiedBookmarksFromRequest(request, secret);

  const headers = makeNoStoreHeaders();
  if (invalid) headers.append("Set-Cookie", buildClearCookie());

  const saved = ARTICLES.filter((a) => ids.has(a.id)).map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
  }));

  const data: LoaderData = { saved, cookieInvalid: invalid };
  return Response.json(data, { headers });
}

export default function Saved() {
  const data = useLoaderData() as LoaderData;

  if (data.saved.length === 0) {
    return (
      <div style={{ border: "1px dashed #bbb", borderRadius: 10, padding: 16 }}>
        <p style={{ marginTop: 0 }}>
          No bookmarked articles yet.
          {data.cookieInvalid ? <span style={{ marginLeft: 8 }}>(invalid cookie)</span> : null}
        </p>
        <Link to="/">← Back to article list</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Saved Articles</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
        {data.saved.map((a) => (
          <li key={a.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 6px 0" }}>{a.title}</h3>
                <p style={{ margin: 0 }}>{a.description}</p>
              </div>

              <Form method="post" action="/toggle" replace>
                <input type="hidden" name="articleId" value={a.id} />
                <input type="hidden" name="returnTo" value="/saved" />
                <button type="submit" style={{ minWidth: 130 }}>
                  Unbookmark
                </button>
              </Form>
            </div>
          </li>
        ))}
      </ul>

      <p style={{ marginTop: 16 }}>
        <Link to="/">← Back to article list</Link>
      </p>
    </div>
  );
}
