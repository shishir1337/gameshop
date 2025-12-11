/**
 * Database-specific types and Prisma helpers
 */

import { Prisma } from "@prisma/client";

// Prisma User type with all relations
export type UserWithAccounts = Prisma.UserGetPayload<{
  include: {
    accounts: true;
  };
}>;

export type UserWithSessions = Prisma.UserGetPayload<{
  include: {
    sessions: true;
  };
}>;

export type UserWithVerifications = Prisma.UserGetPayload<{
  include: {
    verifications: true;
  };
}>;

export type UserFull = Prisma.UserGetPayload<{
  include: {
    accounts: true;
    sessions: true;
    verifications: true;
  };
}>;

// Account types
export type AccountWithUser = Prisma.AccountGetPayload<{
  include: {
    user: true;
  };
}>;

// Session types
export type SessionWithUser = Prisma.SessionGetPayload<{
  include: {
    user: true;
  };
}>;

// Verification types
export type VerificationWithUser = Prisma.VerificationGetPayload<{
  include: {
    user: true;
  };
}>;

