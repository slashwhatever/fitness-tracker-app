import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ContextualNavigation from "@/components/common/ContextualNavigation";
import { Typography } from "@/components/common/Typography";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Link from "next/link";

export default function LibrarySearchNotFound() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <ContextualNavigation context={{ type: "library" }} />
        <main className="p-2 sm:p-4 lg:p-6">
          <div className="max-w-4xl mx-auto mt-4">
            <div className="text-center py-16">
              <div className="text-muted-foreground mb-6">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <Typography variant="title1" className="mb-2">
                No movements found
              </Typography>
              <Typography variant="caption" className="mb-6">
                We couldn&apos;t find any movements matching your search. Try a
                different term or browse all movements.
              </Typography>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link href="/library">Browse All Movements</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Back to Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
