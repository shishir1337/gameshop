"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";

type ProductWithRelations = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  variants: Array<{
    id: string;
    name: string;
    price: number;
    isActive: boolean;
  }>;
};

interface ProductsListProps {
  products: ProductWithRelations[];
  searchQuery?: string;
}

export function ProductsList({ products, searchQuery = "" }: ProductsListProps) {
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }

    const query = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category.name.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  if (filteredProducts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <ImageIcon className="mx-auto mb-4 h-12 w-12 text-zinc-400" />
        <p className="text-zinc-600 dark:text-zinc-400">
          {searchQuery ? "No products found matching your search." : "No products available yet."}
        </p>
      </div>
    );
  }

  return (
    <>
      {searchQuery && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center mb-6">
          Found {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
        </p>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => {
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
    </>
  );
}

