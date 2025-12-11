# Migration Guide: Next.js Best Practices Implementation

## Overview

This guide explains how to migrate from the current implementation to use Next.js best practices including Server Actions, SSR, proper TypeScript types, and performance optimizations.

## Type System Migration

### Before (Using `any`)
```typescript
const [user, setUser] = useState<any>(null);
const [users, setUsers] = useState<any[]>([]);
```

### After (Using Proper Types)
```typescript
import type { UserProfile, AdminUser } from "@/types";

const [user, setUser] = useState<UserProfile | null>(null);
const [users, setUsers] = useState<AdminUser[]>([]);
```

## Server Actions Migration

### Before (API Route)
```typescript
// app/api/user/update-profile/route.ts
export async function PUT(req: NextRequest) {
  const body = await req.json();
  // ... validation and update logic
  return NextResponse.json({ user: updatedUser });
}

// Component
const response = await fetch("/api/user/update-profile", {
  method: "PUT",
  body: JSON.stringify({ name, image }),
});
```

### After (Server Action)
```typescript
// app/actions/user.ts
"use server";
export async function updateProfile(data: UpdateProfileRequest) {
  // ... validation and update logic
  return { user: updatedUser };
}

// Component
import { updateProfile } from "@/app/actions/user";
const result = await updateProfile({ name, image });
```

## SSR Migration

### Before (Client Component)
```typescript
"use client";
export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetch("/api/admin/users").then(res => res.json()).then(setUsers);
  }, []);
  
  return <div>{/* render users */}</div>;
}
```

### After (Server Component)
```typescript
import { getAdminUsers } from "@/app/actions/admin";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const { users, pagination } = await getAdminUsers({
    search: searchParams.search,
    page: parseInt(searchParams.page || "1"),
  });
  
  return <div>{/* render users */}</div>;
}
```

## Component Structure

### Recommended Pattern

1. **Server Component** (default) - For data fetching and initial render
2. **Client Component** - Only when needed for interactivity
3. **Server Actions** - For mutations and form submissions

### Example Structure

```
app/
  actions/
    user.ts          # Server Actions for user operations
    admin.ts         # Server Actions for admin operations
    auth.ts           # Server Actions for auth operations
  (admin)/
    admin/
      users/
        page.tsx     # Server Component (SSR)
        client.tsx   # Client Component (if needed for interactivity)
```

## Type Definitions

All types are centralized in the `types/` folder:

- `types/index.ts` - Main type exports
- `types/database.ts` - Prisma-related types
- `types/api.ts` - API request/response types

### Usage

```typescript
import type { UserProfile, AdminUser } from "@/types";
import type { UpdateProfileRequest, AdminUsersResponse } from "@/types/api";
```

## Performance Optimizations

### 1. Use Server Components by Default
- Reduces JavaScript bundle size
- Faster initial page load
- Better SEO

### 2. Implement ISR for Public Pages
```typescript
export const revalidate = 3600; // Revalidate every hour

export default async function ProductsPage() {
  const products = await getProducts();
  return <div>{/* render products */}</div>;
}
```

### 3. Add Proper Caching
```typescript
// In Server Actions
import { unstable_cache } from "next/cache";

export const getCachedUsers = unstable_cache(
  async () => getAdminUsers(),
  ["admin-users"],
  { revalidate: 60 } // Cache for 60 seconds
);
```

## Security Improvements

### Server Actions Benefits
- Automatic CSRF protection
- Type-safe by default
- Better error handling
- No exposed API endpoints

### Rate Limiting
- Keep rate limiting in API routes for external access
- Server Actions can use middleware for rate limiting

## Migration Checklist

- [ ] Replace all `any` types with proper TypeScript types
- [ ] Convert form submissions to Server Actions
- [ ] Convert data fetching pages to Server Components
- [ ] Add proper error boundaries
- [ ] Implement ISR for public pages
- [ ] Add caching strategies
- [ ] Update all components to use types from `types/` folder
- [ ] Remove unnecessary `"use client"` directives
- [ ] Add proper loading and error states

## Examples

See the following files for reference:
- `app/actions/user.ts` - Server Action example
- `app/actions/admin.ts` - Server Action with SSR example
- `types/index.ts` - Type definitions example

