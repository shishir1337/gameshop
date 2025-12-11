import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { genericOAuth } from "better-auth/plugins";
import { prisma } from "./prisma";
import { getSessionRedisClient, isRedisConnected } from "./redis";

// Get Redis client for session storage
const redisClient = getSessionRedisClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Allow login without verification, show dialog instead
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  // Use Redis for session storage if available
  ...(redisClient && isRedisConnected()
    ? {
        secondaryStorage: {
          get: async (key: string) => {
            try {
              const value = await redisClient.get(key);
              return value ? JSON.parse(value) : null;
            } catch (error) {
              console.error("Redis get error:", error);
              return null;
            }
          },
          set: async (key: string, value: unknown, ttl?: number) => {
            try {
              const serialized = JSON.stringify(value);
              if (ttl) {
                await redisClient.setex(key, ttl, serialized);
              } else {
                await redisClient.set(key, serialized);
              }
            } catch (error) {
              console.error("Redis set error:", error);
            }
          },
          delete: async (key: string) => {
            try {
              await redisClient.del(key);
            } catch (error) {
              console.error("Redis delete error:", error);
            }
          },
        },
        session: {
          cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 minutes cache
            refreshCache: false, // Disable stateless refresh
          },
        },
      }
    : {}),
  plugins: [
    nextCookies(),
    genericOAuth({
      config: [
        // Google OAuth
        {
          providerId: "google",
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
          tokenUrl: "https://oauth2.googleapis.com/token",
          userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
          scopes: ["openid", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"],
          mapProfileToUser: (profile) => {
            return {
              email: profile.email,
              name: profile.name,
              image: profile.picture,
              emailVerified: profile.verified_email ?? false,
            };
          },
        },
        // Facebook OAuth
        {
          providerId: "facebook",
          clientId: process.env.FACEBOOK_CLIENT_ID!,
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
          authorizationUrl: "https://www.facebook.com/v18.0/dialog/oauth",
          tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
          userInfoUrl: "https://graph.facebook.com/v18.0/me?fields=id,name,email,picture",
          scopes: ["email", "public_profile"],
          mapProfileToUser: (profile) => {
            return {
              email: profile.email,
              name: profile.name,
              image: profile.picture?.data?.url || null,
              emailVerified: true, // Facebook emails are verified
            };
          },
        },
      ],
    }),
  ],
});

