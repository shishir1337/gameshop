import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background font-sans">
      <div className="flex max-w-md flex-col items-center gap-6 text-center px-4">
        <FileQuestion className="h-16 w-16 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
            Page Not Found
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            The page you are looking for doesn&apos;t exist or has been removed.
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

