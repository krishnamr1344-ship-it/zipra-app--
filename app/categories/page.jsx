"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { services } from "@/services/api";
import { CategoryCard } from "@/components/category/category-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/empty-state";

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    services.categories
      .list()
      .then((c) => setCategories(c))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-sm" aria-label="Back">
        <ChevronLeft className="h-5 w-5" />
      </Link>
      <div>
        <h1 className="font-display text-2xl font-bold">All Categories</h1>
        <p className="text-sm text-muted-foreground">Pick a category to start shopping</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} className="w-full" />
          ))}
        </div>
      )}
    </div>
  );
}
