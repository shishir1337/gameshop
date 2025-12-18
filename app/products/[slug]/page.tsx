import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProductBySlug } from "@/app/actions/product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import { ProductForm } from "./product-form";
import type { UserFormField } from "@/lib/validations/product";

interface ProductDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { slug } = await params;
  const result = await getProductBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const product = result.data;
  const userFormFields = (product.userFormFields as UserFormField[]) || [];

  // Calculate price range
  const prices = product.variants.map((v) => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceDisplay =
    minPrice === maxPrice ? `৳${minPrice}` : `৳${minPrice} - ৳${maxPrice}`;

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Product Image */}
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-24 w-24 text-zinc-400" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="secondary">{product.category.name}</Badge>
                  {product.isActive && (
                    <Badge variant="default">Active</Badge>
                  )}
                </div>
                <h1 className="text-4xl font-bold text-foreground">
                  {product.name}
                </h1>
                {product.description && (
                  <p className="mt-4 text-lg text-muted-foreground">
                    {product.description}
                  </p>
                )}
              </div>

              <Separator />

              {/* Price */}
              <div>
                <p className="text-sm text-muted-foreground">
                  Starting from
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {priceDisplay}
                </p>
              </div>

              <Separator />

              {/* Interactive Product Form */}
              <ProductForm
                productId={product.id}
                variants={product.variants}
                userFormFields={userFormFields}
              />

              {/* Product Meta */}
              <div className="rounded-lg border bg-card p-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Product ID:</span>
                    <span className="font-mono text-xs">{product.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Slug:</span>
                    <span className="font-mono text-xs">{product.slug}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Variants:</span>
                    <span>{product.variants.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

