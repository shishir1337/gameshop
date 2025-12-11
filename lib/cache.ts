/**
 * Cache configuration and utilities
 * 
 * This file centralizes cache settings and provides reusable cache configurations
 */

/**
 * Cache revalidation times (in seconds)
 */
export const CACHE_REVALIDATE = {
  // Short cache for frequently changing data
  SHORT: 10, // 10 seconds
  
  // Medium cache for moderately changing data
  MEDIUM: 60, // 1 minute
  
  // Long cache for slowly changing data
  LONG: 300, // 5 minutes
  
  // Very long cache for rarely changing data
  VERY_LONG: 3600, // 1 hour
  
  // Static cache for public pages
  STATIC: 3600, // 1 hour (ISR)
} as const;

/**
 * Cache tags for revalidation
 */
export const CACHE_TAGS = {
  USER_PROFILE: "user-profile",
  ADMIN_STATS: "admin-stats",
  ADMIN_USERS: "admin-users",
  PRODUCTS: "products",
  ORDERS: "orders",
} as const;

// Note: revalidateTag is imported directly where needed
// This avoids issues with Next.js version compatibility

