import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, Package } from "lucide-react";
import { getActiveCategories } from "@/app/actions/category";
import { getActiveProducts } from "@/app/actions/product";
import { ProductSearchWrapper } from "@/components/products/product-search-wrapper";

export default async function Home() {
  const categoriesResult = await getActiveCategories();
  const categories = categoriesResult.success ? categoriesResult.data || [] : [];
  
  const productsResult = await getActiveProducts();
  const products = productsResult.success ? productsResult.data || [] : [];

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="flex-1">
        {/* Hero Section */}
        <div className="flex min-h-[60vh] items-center justify-center py-16 px-4">
          <div className="flex max-w-3xl flex-col items-center gap-8 text-center">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-black dark:text-zinc-50 sm:text-5xl">
              GameShop
            </h1>
            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Your one-stop shop for digital game top-ups and gift cards.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/register">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="border-t bg-white py-16 dark:bg-zinc-950">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-black dark:text-zinc-50">
                Categories
              </h2>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Browse our product categories
              </p>
            </div>

            {categories.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-zinc-400" />
                <p className="text-zinc-600 dark:text-zinc-400">
                  No categories available yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="group rounded-lg border bg-white p-6 transition-shadow hover:shadow-lg dark:bg-zinc-900 dark:border-zinc-800"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-black dark:text-zinc-50">
                          {category.name}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          {category.slug}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <Package className="h-4 w-4" />
                      <span>
                        {category._count.products} product
                        {category._count.products !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Products Section */}
        <div className="border-t bg-zinc-50 py-16 dark:bg-black">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-8">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-black dark:text-zinc-50">
                  Featured Products
                </h2>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                  Browse our latest digital products and top-ups
                </p>
              </div>
              <ProductSearchWrapper products={products} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
