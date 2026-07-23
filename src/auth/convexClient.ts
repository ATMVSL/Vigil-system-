import { ConvexReactClient } from "convex/react";

const convexUrl =
  (import.meta.env.VITE_CONVEX_URL as string) ||
  "https://placeholder-deployment.convex.cloud";

/** True when no real VITE_CONVEX_URL was provided at build time */
export const isConvexPlaceholder =
  !import.meta.env.VITE_CONVEX_URL ||
  convexUrl.includes("placeholder-deployment");

export const convex = new ConvexReactClient(convexUrl, {
  // Suppress the global connection error overlay when backend is unreachable.
  // The Mirror page handles its own fallback to grounded doctrine reflections.
  unsavedChangesWarning: false,
});

// If the URL is a placeholder, disable verbose connection error logging
// that floods the console and may surface as UI errors.
if (isConvexPlaceholder) {
  console.info(
    "[VIGIL] No VITE_CONVEX_URL configured — Mirror will use grounded doctrine fallback mode.",
  );
}
