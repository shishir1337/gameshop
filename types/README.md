# Types Organization

This directory contains all TypeScript type definitions for the application, organized by domain for better maintainability.

## Structure

### `auth.ts` - Authentication Types
Better Auth inferred types and authentication-related types:
- `AuthSession` - Server-side session type (inferred from Better Auth)
- `AuthUser` - Server-side user type (inferred from Better Auth)
- `ClientSession` - Client-side session type (inferred from Better Auth client)
- `ClientUser` - Client-side user type (inferred from Better Auth client)
- Legacy types for backward compatibility (`UserProfile`, `SessionUser`, etc.)

### `admin.ts` - Admin Types
Types for admin dashboard and user management:
- `AdminUser` - Admin user type with all admin-specific fields
- `ListUsersParams` - Parameters for listing users
- `ListUsersResponse` - Response type for listing users
- `DashboardStats` - Dashboard statistics type
- Various operation parameter types

### `api.ts` - API Types
API request/response types:
- `RegisterRequest` / `RegisterResponse`
- `LoginRequest` / `LoginResponse`
- `UpdateProfileRequest` / `UpdateProfileResponse`
- `ErrorResponse` / `ValidationErrorResponse`

### `components.ts` - Component Types
React component prop types:
- Email template props (`EmailTemplateProps`, `EmailVerificationTemplateProps`, etc.)
- Auth component props (`EmailVerificationDialogProps`, `SocialLoginButtonsProps`)
- Layout component props (`PageProps`, `LayoutProps`)
- UI component props (`PasswordInputProps`)

### `database.ts` - Database Types
Prisma-generated types and database-related types:
- `UserWithAccounts`, `UserWithSessions`, `UserWithVerifications`
- `UserFull` - User with all relations
- `AccountWithUser`, `SessionWithUser`, `VerificationWithUser`

### `forms.ts` - Form Types
Form data types for validation and handling:
- `RegisterFormData`, `LoginFormData`
- `ForgotPasswordFormData`, `ResetPasswordFormData`
- `VerifyEmailFormData`, `ResendVerificationFormData`
- `UpdateProfileFormData`

### `index.ts` - Main Export File
Central export file that re-exports all types from the organized modules. This is the main entry point for importing types throughout the application.

## Usage

### Importing Types

Always import types from the main `@/types` entry point:

```typescript
import type { AuthUser, AuthSession } from "@/types";
import type { AdminUser, DashboardStats } from "@/types";
import type { RegisterRequest, LoginResponse } from "@/types";
```

### Better Auth Type Inference

The application uses Better Auth's type inference system to ensure type safety:

**Server-side (lib/auth.ts):**
```typescript
import type { auth } from "@/lib/auth";
export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;
```

**Client-side (lib/auth-client.ts):**
```typescript
import type { authClient } from "@/lib/auth-client";
export type ClientSession = typeof authClient.$Infer.Session;
export type ClientUser = typeof authClient.$Infer.Session.user;
```

The `inferAdditionalFields` plugin is used in the client configuration to automatically infer types from the server configuration.

## Best Practices

1. **Always use Better Auth inferred types** (`AuthUser`, `AuthSession`) instead of manually defining user types
2. **Organize types by domain** - Keep related types together in the same file
3. **Use descriptive names** - Type names should clearly indicate their purpose
4. **Export from index.ts** - All types should be re-exported from `index.ts` for easy importing
5. **Avoid inline types** - Move component prop types to `components.ts` instead of defining them inline
6. **Document complex types** - Add JSDoc comments for complex types

## Migration Notes

- Legacy types (`UserProfile`, `SessionUser`) are kept for backward compatibility but marked as deprecated
- New code should use `AuthUser` and `AuthSession` from Better Auth inference
- Component prop types have been moved from inline definitions to `components.ts`

