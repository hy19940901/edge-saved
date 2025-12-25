export type Article = {
  id: string;
  title: string;
  description: string;
};

export const ARTICLES: Article[] = [
  { id: "a1", title: "Edge SSR Basics", description: "How SSR works at the edge and why it matters." },
  { id: "a2", title: "Signed Cookies 101", description: "Protecting client state using HMAC signatures." },
  { id: "a3", title: "Cache-Control Gotchas", description: "Avoid leaking user-specific SSR responses." },
  { id: "a4", title: "Workers Runtime", description: "Differences between Node.js and Cloudflare Workers." },
  { id: "a5", title: "React Router v7 Loaders", description: "Server loaders and actions in a modern router." },
  { id: "a6", title: "Error Boundaries", description: "Building user-friendly error UIs for SSR apps." },
  { id: "a7", title: "Secure by Default", description: "Cookie attributes and practical security defaults." },
  { id: "a8", title: "No DB Required", description: "Building stateful experiences without databases." },
  { id: "a9", title: "HMAC vs JWT", description: "When to sign payloads and how to validate integrity." },
  { id: "a10", title: "SSR Debugging", description: "Tracing SSR issues in edge environments." },
];
