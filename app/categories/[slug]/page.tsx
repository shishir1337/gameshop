import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Package, Image as ImageIcon } from "lucide-react";
import { getCategoryBySlug } from "@/app/actions/category";
import { getActiveProducts } from "@/app/actions/product";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categoryResult = await getCategoryBySlug(slug);

  if (!categoryResult.success || !categoryResult.data) {
    notFound();
  }

  const category = categoryResult.data;

  // Get products for this category
  const productsResult = await getActiveProducts(category.id);
  const products = productsResult.success ? productsResult.data || [] : [];

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          {/* Category Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {category.name}
              </Badge>
              {category.isActive && (
                <Badge variant="default">Active</Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold text-black dark:text-zinc-50 mb-2">
              {category.name}
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              {products.length} product{products.length !== 1 ? "s" : ""} available
            </p>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="h-16 w-16 text-zinc-400 mb-4" />
                <h3 className="text-xl font-semibold text-black dark:text-zinc-50 mb-2">
                  No Products Available
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-center">
                  There are no products in this category yet.
                </p>
                <Button asChild>
                  <Link href="/">Browse All Products</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const minPrice = product.variants.length > 0
                  ? Math.min(...product.variants.map((v) => v.price))
                  : 0;
                const maxPrice = product.variants.length > 0
                  ? Math.max(...product.variants.map((v) => v.price))
                  : 0;
                const priceDisplay =
                  minPrice === maxPrice
                    ? `৳${minPrice}`
                    : `৳${minPrice} - ৳${maxPrice}`;

                return (
                  <Card
                    key={product.id}
                    className="group overflow-hidden transition-shadow hover:shadow-lg"
                  >
                    <Link href={`/products/${product.slug}`}>
                      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-zinc-400" />
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="line-clamp-2 text-lg">
                            {product.name}
                          </CardTitle>
                          <Badge variant="secondary" className="shrink-0">
                            {product.category.name}
                          </Badge>
                        </div>
                        {product.description && (
                          <CardDescription className="line-clamp-2">
                            {product.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              Starting from
                            </p>
                            <p className="text-xl font-bold text-black dark:text-zinc-50">
                              {priceDisplay}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              {product.variants.length} variant
                              {product.variants.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <Button className="mt-4 w-full" variant="outline">
                          View Details
                        </Button>
                      </CardContent>
                    </Link>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

