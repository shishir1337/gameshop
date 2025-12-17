import { createAuthClient } from "better-auth/react";
import { genericOAuthClient, adminClient } from "better-auth/client/plugins";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

/**
 * Better Auth client instance
 * 
 * Uses inferAdditionalFields plugin to automatically infer types
 * from the server auth configuration for type safety.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    genericOAuthClient(),
    adminClient(),
    // Infer additional fields from server config for type safety
    inferAdditionalFields<typeof auth>(),
  ],
});

