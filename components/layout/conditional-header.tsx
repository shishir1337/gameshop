"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";

export function ConditionalHeader() {
  const pathname = usePathname();
  
  // Hide header and footer on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <Header />;
}

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide header and footer on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <Footer />;
}

