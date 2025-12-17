"use client";

import { useState, useEffect } from "react";
import { EmailVerificationDialog } from "./email-verification-dialog";
import type { UserProfile } from "@/types";

export function EmailVerificationProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    checkUserVerification();
  }, []);

  const checkUserVerification = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Check if user has OAuth accounts (Google/Discord)
        // This is now included in the /api/auth/me response
        const userHasOAuth = data.hasOAuthAccount || false;
        
        // Show dialog only if:
        // 1. User is logged in
        // 2. Email is not verified
        // 3. User does NOT have OAuth account (social login users don't need verification)
        if (data.user && !data.user.emailVerified && !userHasOAuth) {
          setShowDialog(true);
        } else {
          setShowDialog(false);
        }
      } else {
        setUser(null);
        setShowDialog(false);
      }
    } catch (error) {
      // User not logged in
      setUser(null);
      setShowDialog(false);
    } finally {
      setLoading(false);
    }
  };

  const handleVerified = () => {
    setShowDialog(false);
    // Refresh user data
    checkUserVerification();
  };

  if (loading) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      {user && !user.emailVerified && showDialog && (
        <EmailVerificationDialog
          email={user.email}
          open={showDialog}
          onVerified={handleVerified}
        />
      )}
    </>
  );
}

