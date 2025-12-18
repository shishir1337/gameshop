"use client";

import { useState } from "react";
import { ProductSearch } from "./product-search";
import { ProductsList } from "./products-list";
import type { Prisma } from "@prisma/client";

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: {
      select: {
        id: true;
        name: true;
        slug: true;
      };
    };
    variants: true;
  };
}>;

interface ProductSearchWrapperProps {
  products: ProductWithRelations[];
}

export function ProductSearchWrapper({ products }: ProductSearchWrapperProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <ProductSearch onSearchChange={setSearchQuery} />
      <ProductsList products={products} searchQuery={searchQuery} />
    </>
  );
}

