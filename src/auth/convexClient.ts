import { ConvexReactClient } from "convex/react";

const convexUrl =
  (import.meta.env.VITE_CONVEX_URL as string) ||
  "https://placeholder-deployment.convex.cloud";

export const convex = new ConvexReactClient(convexUrl);
