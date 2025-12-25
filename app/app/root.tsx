import * as React from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
  isRouteErrorResponse,
  useRouteError,
} from "react-router";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body style={{ margin: 24, fontFamily: "Times New Roman, serif" }}>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      <header style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Edge Saved</h1>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link to="/">Home</Link>
          <Link to="/saved">Saved</Link>
        </nav>
      </header>

      <Outlet />
    </div>
  );
}

export function ErrorBoundary() {
  const err = useRouteError();

  let title = "Something went wrong";
  let detail = "An unexpected error occurred.";

  if (isRouteErrorResponse(err)) {
    title = `Error ${err.status}`;
    detail = typeof err.data === "string" ? err.data : err.statusText;
  } else if (err instanceof Error) {
    detail = err.message;
  }

  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 10, padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p style={{ whiteSpace: "pre-wrap" }}>{detail}</p>
      <p>
        <Link to="/">Back to Home</Link>
      </p>
    </div>
  );
}
