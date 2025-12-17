"use client";

import { useState } from "react";
import { ProductSearch } from "./product-search";
import { ProductsList } from "./products-list";

interface ProductSearchWrapperProps {
  products: any[];
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

