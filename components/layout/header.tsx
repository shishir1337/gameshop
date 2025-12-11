"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, ShoppingCart, User, LogOut, LogIn, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    // Re-check session when pathname changes (e.g., after login)
    checkSession();
  }, [pathname]);

  // Also check session periodically to catch OAuth profile updates
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        checkSession();
      }, 5000); // Check every 5 seconds when user is logged in

      return () => clearInterval(interval);
    }
  }, [user]);

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      // User not logged in
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-[1320px] flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <ShoppingCart className="h-6 w-6" />
          <span className="text-xl font-bold">GameShop</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(link.href)
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

          {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center space-x-4">
          <ModeToggle />
          {loading ? (
            <Skeleton className="h-9 w-9 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  {user.image ? (
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.image} alt={user.name || "User"} />
                      <AvatarFallback>
                        {user.name
                          ? user.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : user.email?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <>
                      <User className="h-4 w-4" />
                      <span className="sr-only">User menu</span>
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/orders" className="cursor-pointer">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" asChild size="sm">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col space-y-4 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-medium transition-colors hover:text-primary ${
                    isActive(link.href)
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t">
                <div className="mb-4">
                  <ModeToggle />
                </div>
                {loading ? (
                  <div className="space-y-2">
                    <div className="px-2 py-1.5 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ) : user ? (
                  <div className="space-y-2">
                    <div className="px-2 py-1.5 text-sm flex items-center gap-3">
                      {user.image ? (
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.image} alt={user.name || "User"} />
                          <AvatarFallback>
                            {user.name
                              ? user.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)
                              : user.email?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{user.name || "User"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center px-2 py-1.5 text-sm hover:text-primary"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-2 py-1.5 text-sm hover:text-primary"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-2 py-1.5 text-sm hover:text-primary"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Orders
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </Link>
                  </Button>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

