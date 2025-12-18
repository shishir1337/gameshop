"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, CheckCircle2, LogIn } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { ProductVariant } from "@prisma/client";
import type { UserFormField } from "@/lib/validations/product";
import { createOrder } from "@/app/actions/order";

interface ProductFormProps {
  productId: string;
  variants: ProductVariant[];
  userFormFields: UserFormField[];
}

export function ProductForm({
  productId,
  variants,
  userFormFields,
}: ProductFormProps) {
  const router = useRouter();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [email, setEmail] = useState<string>("");
  const [paymentProvider] = useState<string>("uddoktapay"); // Default to uddoktapay (only one provider)
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in and get their email
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user?.email) {
            setUserEmail(data.user.email);
            setEmail(data.user.email);
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        // User not logged in
        setIsLoggedIn(false);
      } finally {
        setIsCheckingUser(false);
      }
    };
    checkUser();
  }, []);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariantId(variantId);
  };

  const handleFormFieldChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Check if each step is completed
  const isStep1Complete = userFormFields.length === 0 || 
    userFormFields
      .filter((field) => field.required)
      .every((field) => formData[field.name]?.trim());

  const isStep2Complete = selectedVariantId !== null;

  const isStep3Complete = email.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Payment provider is optional if only one is available (default to uddoktapay)
  const isStep4Complete = true; // Always complete since we default to uddoktapay

  const canPlaceOrder = isStep1Complete && isStep2Complete && isStep3Complete;

  const handlePayNow = async () => {
    if (!canPlaceOrder) {
      toast.error("Please complete all required fields before placing your order");
      return;
    }

    if (!selectedVariant) {
      toast.error("Please select a variant");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createOrder({
        productId,
        variantId: selectedVariant.id,
        email: email.trim(),
        userFormData: formData,
        paymentProvider: paymentProvider || "uddoktapay",
      });

      if (result.success && result.data) {
        // If payment URL is available, redirect to payment gateway
        if (result.data.paymentUrl) {
          toast.success("Redirecting to payment...", {
            description: `Order Number: ${result.data.orderNumber}`,
          });
          window.location.href = result.data.paymentUrl;
        } else {
          toast.success("Order placed successfully!", {
            description: `Order Number: ${result.data.orderNumber}`,
          });
          setTimeout(() => {
            router.refresh();
          }, 2000);
        }
      } else {
        toast.error(result.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error("An error occurred while placing your order");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingUser) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const currentStepNumber = 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Checkout
        </h2>
      </div>

      <Separator />

      {/* Step 1: User Form Fields */}
      {userFormFields.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
              isStep1Complete
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border"
            }`}>
              {isStep1Complete ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <span className="text-sm font-semibold">{currentStepNumber}</span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Step {currentStepNumber}: Additional Information Required
              </h3>
              <p className="text-sm text-muted-foreground">
                Please provide the following information to complete your order.
              </p>
            </div>
          </div>

          <div className="ml-11 space-y-4">
            {userFormFields.map((field, index) => (
              <div key={index} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </Label>
                {field.type === "text" ? (
                  <Input
                    id={field.name}
                    type="text"
                    placeholder={field.placeholder || ""}
                    value={formData[field.name] || ""}
                    onChange={(e) =>
                      handleFormFieldChange(field.name, e.target.value)
                    }
                    required={field.required}
                  />
                ) : field.type === "select" && field.options ? (
                  <Select
                    value={formData[field.name] || ""}
                    onValueChange={(value) =>
                      handleFormFieldChange(field.name, value)
                    }
                    required={field.required}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue
                        placeholder={
                          field.placeholder || "Select an option"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((option, optIndex) => (
                        <SelectItem key={optIndex} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {userFormFields.length > 0 && <Separator />}

      {/* Step 2: Variants Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
            isStep2Complete
              ? "border-primary bg-primary text-primary-foreground"
              : "border-zinc-300 dark:border-zinc-700"
          }`}>
            {isStep2Complete ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <span className="text-sm font-semibold">
                {userFormFields.length > 0 ? currentStepNumber + 1 : currentStepNumber}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
              Step {userFormFields.length > 0 ? currentStepNumber + 1 : currentStepNumber}: Select Variant
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Choose the amount you want to purchase.
            </p>
          </div>
        </div>

        <div className="ml-11 grid gap-3 sm:grid-cols-2">
          {variants.map((variant) => {
            const isSelected = selectedVariantId === variant.id;
            return (
              <Card
                key={variant.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : ""
                }`}
                onClick={() => handleVariantSelect(variant.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`font-semibold ${
                          isSelected
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {variant.name}
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        ৳{variant.price}
                      </p>
                    </div>
                    {isSelected && (
                      <Badge variant="default">Selected</Badge>
                    )}
                    {!variant.isActive && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Step 3: Email */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
            isStep3Complete
              ? "border-primary bg-primary text-primary-foreground"
              : "border-zinc-300 dark:border-zinc-700"
          }`}>
            {isStep3Complete ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <span className="text-sm font-semibold">
                {userFormFields.length > 0 ? currentStepNumber + 2 : currentStepNumber + 1}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
              Step {userFormFields.length > 0 ? currentStepNumber + 2 : currentStepNumber + 1}: Contact Information
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {userEmail
                ? "Your email address (you can change it if needed)"
                : "Please enter your email address for order confirmation"}
            </p>
          </div>
        </div>

        <div className="ml-11 space-y-2">
          <Label htmlFor="email">
            Email Address <span className="ml-1 text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={!!userEmail}
            className="max-w-md"
          />
          {userEmail && (
            <p className="text-xs text-muted-foreground">
              Logged in as {userEmail}
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* Step 4: Payment Provider & Order Summary */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
            isStep4Complete
              ? "border-primary bg-primary text-primary-foreground"
              : "border-zinc-300 dark:border-zinc-700"
          }`}>
            {isStep4Complete ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <span className="text-sm font-semibold">
                {userFormFields.length > 0 ? currentStepNumber + 3 : currentStepNumber + 2}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
              Step {userFormFields.length > 0 ? currentStepNumber + 3 : currentStepNumber + 2}: Payment
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Payment will be processed via UddoktaPay (bKash, Nagad, Rocket, Upay).
            </p>
          </div>
        </div>

        <div className="ml-11 space-y-4">
          {/* Order Summary */}
          {selectedVariant && (
            <div className="rounded-lg border bg-card p-4 max-w-md">
              <h4 className="font-semibold text-foreground mb-3">
                Order Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Variant:
                  </span>
                  <span className="font-medium text-foreground">
                    {selectedVariant.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Amount:
                  </span>
                  <span className="font-bold text-lg text-foreground">
                    ৳{selectedVariant.price}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">
                    Payment Method:
                  </span>
                  <span className="font-medium text-foreground">
                    UddoktaPay
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Pay Now Button or Login Prompt */}
      {!isLoggedIn ? (
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-dashed border-border bg-card p-6 text-center">
            <LogIn className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Login Required
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              You must be logged in to place an order. Please log in or create an account to continue.
            </p>
            <Button asChild size="lg" className="w-full">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login to Place Order
              </Link>
            </Button>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <Button
            onClick={handlePayNow}
            disabled={!canPlaceOrder || isLoading}
            size="lg"
            className="min-w-[200px]"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isLoading
              ? "Processing..."
              : `Pay Now - ৳${selectedVariant?.price || 0}`}
          </Button>
        </div>
      )}
    </div>
  );
}
