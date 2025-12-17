import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex max-w-md flex-col items-center gap-6 text-center px-4">
        <Package className="h-16 w-16 text-zinc-400" />
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
            Product Not Found
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            The product you are looking for doesn't exist or has been removed.
          </p>
        </div>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}

