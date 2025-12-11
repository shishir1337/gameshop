"use client";

import { useState, useEffect } from "react";
import { EmailVerificationDialog } from "./email-verification-dialog";

export function EmailVerificationProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
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
        
        // Show dialog if user is logged in but email is not verified
        if (data.user && !data.user.emailVerified) {
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
      {user && !user.emailVerified && (
        <EmailVerificationDialog
          email={user.email}
          open={showDialog}
          onVerified={handleVerified}
        />
      )}
    </>
  );
}

