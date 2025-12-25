import * as React from "react";
import { Form, Link, useLoaderData } from "react-router";
import { ARTICLES } from "../data/articles";
import {
  buildClearCookie,
  makeNoStoreHeaders,
  readVerifiedBookmarksFromRequest,
} from "../utils/signedCookie";

type LoaderData = {
  bookmarkedIds: string[];
  bookmarkedCount: number;
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
  // If cookie invalid, treat as empty and optionally clear it
  if (invalid) headers.append("Set-Cookie", buildClearCookie());

  const data: LoaderData = {
    bookmarkedIds: Array.from(ids),
    bookmarkedCount: ids.size,
    cookieInvalid: invalid,
  };

  return Response.json(data, { headers });
}

export default function Index() {
  const data = useLoaderData() as LoaderData;
  const bookmarkedSet = React.useMemo(() => new Set(data.bookmarkedIds), [data.bookmarkedIds]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <strong>Bookmarked:</strong> {data.bookmarkedCount} articles
          {data.cookieInvalid ? (
            <span style={{ marginLeft: 8 }}>(invalid cookie → treated as empty)</span>
          ) : null}
        </div>
        <Link to="/saved">View saved</Link>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
        {ARTICLES.map((a) => {
          const isSaved = bookmarkedSet.has(a.id);

          return (
            <li key={a.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 6px 0" }}>{a.title}</h3>
                  <p style={{ margin: 0 }}>{a.description}</p>
                </div>

                <Form method="post" action="/toggle" replace>
                  <input type="hidden" name="articleId" value={a.id} />
                  <input type="hidden" name="returnTo" value="/" />
                  <button type="submit" style={{ minWidth: 130 }}>
                    {isSaved ? "Unbookmark" : "Bookmark"}
                  </button>
                </Form>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
