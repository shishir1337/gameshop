"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface AdminUsersSearchProps {
  initialSearch?: string;
}

export function AdminUsersSearch({ initialSearch = "" }: AdminUsersSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    setSearch(value);
    
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("search", value);
        params.set("page", "1"); // Reset to first page on new search
      } else {
        params.delete("search");
      }
      router.push(`/admin/users?${params.toString()}`);
    });
  };

  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search users..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-8 w-64"
        disabled={isPending}
      />
    </div>
  );
}

