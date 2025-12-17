import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { genericOAuth, admin } from "better-auth/plugins";
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
  rateLimit: {
    enabled: true, // Enable in all environments
    window: 60, // 60 seconds
    max: 100, // 100 requests per window
    storage: "database", // Use database storage (works without Redis)
    customRules: {
      "/sign-in/email": {
        window: 900, // 15 minutes
        max: 5, // 5 login attempts per 15 minutes
      },
      "/sign-up/email": {
        window: 3600, // 1 hour
        max: 3, // 3 registration attempts per hour
      },
      "/forgot-password": {
        window: 3600, // 1 hour
        max: 3, // 3 password reset attempts per hour
      },
      "/verify-email": {
        window: 3600, // 1 hour
        max: 5, // 5 verification attempts per hour
      },
      "/resend-verification": {
        window: 3600, // 1 hour
        max: 5, // 5 resend attempts per hour
      },
    },
  },
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
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
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
        // Discord OAuth
        {
          providerId: "discord",
          clientId: process.env.DISCORD_CLIENT_ID!,
          clientSecret: process.env.DISCORD_CLIENT_SECRET!,
          authorizationUrl: "https://discord.com/api/oauth2/authorize",
          tokenUrl: "https://discord.com/api/oauth2/token",
          userInfoUrl: "https://discord.com/api/users/@me",
          scopes: ["identify", "email"],
          mapProfileToUser: (profile) => {
            // Discord avatar URL format: https://cdn.discordapp.com/avatars/{user_id}/{avatar}.png
            const avatarUrl = profile.avatar
              ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
              : null;
            
            return {
              email: profile.email,
              name: profile.username || profile.global_name || null,
              image: avatarUrl,
              emailVerified: profile.verified ?? false,
            };
          },
        },
      ],
    }),
  ],
});

