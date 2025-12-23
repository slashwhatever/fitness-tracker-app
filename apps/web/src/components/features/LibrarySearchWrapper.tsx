"use client";

import SearchFilters from "@/components/common/SearchFilters";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

interface LibrarySearchWrapperProps {
  children: React.ReactNode;
}

export default function LibrarySearchWrapper({
  children,
}: LibrarySearchWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearchChange = useCallback(
    (searchTerm: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (searchTerm) {
          params.set("search", searchTerm);
        } else {
          params.delete("search");
        }
        router.push(`?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  return (
    <>
      {/* Search */}
      <SearchFilters onSearchChange={handleSearchChange} />

      {/* Content with streaming */}
      <div className={isPending ? "opacity-50 transition-opacity" : ""}>
        {children}
      </div>
    </>
  );
}
