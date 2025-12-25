import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("saved", "routes/saved.tsx"),
  route("toggle", "routes/toggle.tsx"),
] satisfies RouteConfig;
