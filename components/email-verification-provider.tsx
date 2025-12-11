"use client";

import { useState, useEffect } from "react";
import { EmailVerificationDialog } from "./email-verification-dialog";

export function EmailVerificationProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [hasOAuthAccount, setHasOAuthAccount] = useState(false);

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
        
        // Check if user has OAuth accounts (Google/Facebook)
        let userHasOAuth = false;
        try {
          const oAuthCheck = await fetch("/api/auth/check-oauth", {
            credentials: "include",
            cache: "no-store",
          });
          
          if (oAuthCheck.ok) {
            const oAuthData = await oAuthCheck.json();
            userHasOAuth = oAuthData.hasOAuthAccount || false;
            setHasOAuthAccount(userHasOAuth);
          }
        } catch (error) {
          // If OAuth check fails, assume no OAuth account
          userHasOAuth = false;
          setHasOAuthAccount(false);
        }
        
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
        setHasOAuthAccount(false);
      }
    } catch (error) {
      // User not logged in
      setUser(null);
      setShowDialog(false);
      setHasOAuthAccount(false);
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

