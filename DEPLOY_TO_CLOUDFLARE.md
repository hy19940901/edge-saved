# Deploy to Cloudflare (Workers + SSR)

This document describes **how to deploy Edge Saved to Cloudflare Workers** using **Wrangler**.

The deployment targets **Cloudflare Workers with full Server-Side Rendering (SSR)**,
including static asset handling and environment bindings.

---

## Prerequisites

Before deploying, make sure you have:

- A **Cloudflare account**
- Node.js **>= 20**
- npm **>= 10**
- Wrangler **>= 4**

Install Wrangler globally if not already installed:

```bash
npm install -g wrangler
```

Authenticate Wrangler with your Cloudflare account:

```bash
wrangler login
```

This will open a browser window to complete OAuth authentication.

---

## Build the Project

From the project root:

```bash
cd app
npm install
npm run build
```

This command performs **two builds**:

1. **Client build**
   - Outputs static assets to:
     ```
     build/client/
     ```

2. **Server (SSR) build**
   - Outputs Worker-compatible SSR bundle to:
     ```
     build/server/
     ```

During the build, React Router generates a **Cloudflare Workers–specific configuration**
inside `build/server/wrangler.json`.

---

## Environment Variables

### Demo Configuration (Local / Interview Task)

For demo purposes, environment variables can be defined in `wrangler.jsonc`:

```jsonc
{
  "vars": {
    "VALUE_FROM_CLOUDFLARE": "Hello from Cloudflare",
    "APP_SECRET": "replace-with-a-long-random-string"
  }
}
```

> ⚠️ **Security Note**  
> For real production deployments, secrets **should not** be stored as plain text.
> Use Cloudflare Secrets instead (see below).

---

### Production-Grade Secret Management (Recommended)

Store sensitive values using Cloudflare Secrets:

```bash
wrangler secret put APP_SECRET
```

After doing this:

- Remove `APP_SECRET` from `vars` in `wrangler.jsonc`
- Keep only non-sensitive configuration values

Wrangler will inject secrets securely at runtime.

---

## Deploy to Cloudflare Workers

Run the deployment command:

```bash
npx wrangler deploy
```

### What Happens During Deployment

- Wrangler automatically switches to:
  ```
  build/server/wrangler.json
  ```
- The SSR Worker entry and server bundle are uploaded
- Static assets from `build/client/` are uploaded and bound
- A new Worker version is published globally

On first deployment, Wrangler will prompt you to:

- Register a **workers.dev subdomain**
- Choose a unique subdomain name

Example:

```
https://app.your-subdomain.workers.dev
```

---

## Verify the Deployment

After deployment, open the Worker URL in your browser.

Verify the following:

1. **Home page loads successfully (HTTP 200)**
2. **Refreshing sub-routes works correctly**
   - e.g. `/saved`
   - No 404 errors on refresh
3. **Static assets load correctly**
   - `entry.client-*.js`
   - `chunk-*.js`
   - `manifest-*.js`

If all checks pass, the deployment is complete.

---

## Local Development vs Production

| Aspect            | Local (`npm run dev`) | Cloudflare Workers |
|------------------|-----------------------|--------------------|
| Runtime          | Node.js               | Edge Runtime       |
| SSR              | Yes                   | Yes                |
| Environment Vars | Local `.env` / vars   | Worker bindings    |
| Cookies          | HttpOnly              | HttpOnly           |
| Cache Isolation  | Simulated             | Enforced at edge   |

---

## Common Notes

- The Worker explicitly disables shared caching for user-specific responses
- Signed cookies are validated on every SSR request
- No database or external API is required
- The same codebase runs locally and on Cloudflare without changes

---

## Summary

This deployment setup demonstrates:

- **Modern Edge SSR** using Cloudflare Workers
- **Framework-native routing and data mutations**
- **Secure per-user state handling without a database**
- A clean and reproducible deployment pipeline

The project is intentionally minimal, focusing on correctness,
clarity, and real-world Cloudflare Workers best practices.


---

## Example Deployment Output (Reference)

The following is a **real deployment output** from this project,
included here to help readers understand what a **successful Cloudflare Workers SSR deployment** looks like.

```text
$ npx wrangler deploy

⛅️ wrangler 4.54.0
───────────────────
Using redirected Wrangler configuration.
 - Configuration being used: "build/server/wrangler.json"
 - Original user's configuration: "wrangler.jsonc"
 - Deploy configuration file: ".wrangler/deploy/config.json"

Attaching additional modules:
┌─────────────────────────────────┬──────┬────────────┐
│ Name                            │ Type │ Size       │
├─────────────────────────────────┼──────┼────────────┤
│ assets/server-build-*.js        │ esm  │ ~512 KiB   │
│ assets/worker-entry-*.js        │ esm  │ ~245 KiB   │
├─────────────────────────────────┼──────┼────────────┤
│ Total (2 modules)               │      │ ~757 KiB   │
└─────────────────────────────────┴──────┴────────────┘

🌀 Building list of assets...
✨ Read static assets from build/client
🌀 Starting asset upload...
No updated asset files to upload. Proceeding with deployment...

Your Worker has access to the following bindings:
- env.VALUE_FROM_CLOUDFLARE
- env.APP_SECRET

Uploaded app
Deployed app triggers
  https://app.yanhuang-edge-saved.workers.dev

Current Version ID:
  f4d9b8d7-274e-4d71-b313-a12604b8f4f1
```

### How to Interpret This Output

- **Redirected Wrangler configuration**  
  Confirms that the SSR build generated its own Worker configuration.

- **Attached modules**  
  Indicates that the server-side React Router bundle and Worker entry
  have been uploaded as ESM modules.

- **Static assets detected**  
  Assets under `build/client/` are correctly bound for edge delivery.

- **Worker bindings listed**  
  Confirms that environment variables and secrets are available at runtime.

- **workers.dev URL printed**  
  Indicates that the Worker has been successfully deployed and is publicly accessible.

If your deployment output looks similar to the above,
your Cloudflare Workers SSR deployment is complete.
