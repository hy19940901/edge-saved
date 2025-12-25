# Edge Saved – Cloudflare Workers SSR Demo

Edge Saved is a demo application built with **Cloudflare Workers** and **React Router v7 (SSR)**.
It demonstrates how to implement **user-specific bookmarking** at the edge using **signed cookies**,
without relying on a database or REST APIs.

This project is designed as an **interview task demo**, focusing on correctness, clarity, and modern Edge SSR best practices.

---

## Features

- Server-Side Rendering (SSR) on Cloudflare Workers
- Article list with bookmark / unbookmark support
- Signed cookies (HMAC-SHA256) to prevent client-side tampering
- No database required
- No REST API endpoints
- Proper cache isolation using `Cache-Control: private, no-store`

---

## Tech Stack

- Cloudflare Workers
- React Router v7 (Loaders & Actions)
- TypeScript
- Web Crypto API (`crypto.subtle`)
- Wrangler (local development)

---

## Project Structure

```
app/
├── app/
│   ├── routes/
│   │   ├── _index.tsx       # Home page (SSR article list)
│   │   ├── saved.tsx        # Saved articles page
│   │   └── toggle.tsx       # POST action to toggle bookmark
│   ├── data/
│   │   └── articles.ts      # Demo article data
│   └── utils/
│       └── signedCookie.ts  # Cookie signing & verification
├── workers/
│   └── app.ts               # Cloudflare Worker entry
├── package.json
└── wrangler.jsonc
```

---

## Getting Started

### Prerequisites

- Node.js **>= 20**
- npm **>= 10**
- Wrangler installed globally

```bash
npm install -g wrangler
```

---

### Install Dependencies

After cloning the repository, install dependencies once:

```bash
cd app
npm install
```

---

### Configure Environment Variables

The application uses a secret to sign cookies.

Edit `wrangler.jsonc`:

```jsonc
"vars": {
  "APP_SECRET": "replace-with-a-long-random-string"
}
```

> This secret is for demo purposes only. In production, it should be securely managed and rotated.

---

### Run Locally

```bash
npm run dev
```

Then open:

```
http://localhost:5173/
```

---

## How It Works (High-Level)

- Bookmark state is stored in a **signed, HttpOnly cookie**
- React Router **loaders** read and verify the cookie during SSR
- React Router **actions** handle POST requests to update bookmark state
- Responses explicitly disable shared caching to avoid cross-user data leaks
- No client-side persistence (e.g. localStorage) is used

---

## Design Notes

- The project intentionally avoids databases and authentication to keep the focus on SSR behavior
- State changes are handled using framework-native mechanisms instead of custom APIs
- All cryptographic operations are compatible with the Cloudflare Workers runtime

---

## Notes

- This project is intended for evaluation and demonstration purposes
- Detailed design and testing documentation is provided separately
- Error handling and edge cases are implemented conservatively for clarity
