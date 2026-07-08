"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, X, Mic, SlidersHorizontal, TrendingUp, History } from "lucide-react";
import { services } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/product-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterSheet } from "@/components/search/filter-sheet";
import { useToast } from "@/components/providers/toast-provider";
import { searchService } from "@/services/api";

const RECENT_KEY = "zipra-recent-searches";

export default function SearchPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = React.useState(params.get("q") || "");
  const [suggestions, setSuggestions] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [recent, setRecent] = React.useState([]);
  const [filters, setFilters] = React.useState({
    sort: params.get("sort") || "relevance",
    category: params.get("category") || null,
  });
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [trending, setTrending] = React.useState([]);
  const { toast } = useToast();

  React.useEffect(() => {
    setTrending(searchService.trending());
  }, []);

  React.useEffect(() => {
    const r = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    setRecent(r);
  }, []);

  React.useEffect(() => {
    const t = setTimeout(async () => {
      if (q.trim()) {
        const s = await services.search.suggest(q.trim());
        setSuggestions(s);
      } else {
        setSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  React.useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      try {
        const data = await services.products.list({
          q: q.trim() || undefined,
          category: filters.category,
          sort: filters.sort === "relevance" ? undefined : filters.sort,
        });
        if (active) setProducts(data);
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => (active = false);
  }, [q, filters]);

  const commitSearch = (term) => {
    const value = term.trim();
    if (!value) return;
    const r = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]").filter(
      (x) => x !== value
    );
    localStorage.setItem(RECENT_KEY, JSON.stringify([value, ...r].slice(0, 8)));
    setRecent([value, ...r].slice(0, 8));
    setSuggestions([]);
  };

  const showResults = q.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="sticky top-14 z-20 -mx-4 flex items-center gap-2 bg-background/90 px-4 py-3 backdrop-blur">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commitSearch(q)}
            placeholder="Search for groceries, brands…"
            className="pl-9 pr-9"
          />
          {q && (
            <button
              aria-label="Clear"
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant="soft"
          size="icon"
          aria-label="Voice search"
          onClick={() => toast({ variant: "info", title: "Voice search", description: "Listening… (demo)" })}
        >
          <Mic className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Filters"
          onClick={() => setSheetOpen(true)}
        >
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {!showResults ? (
        <div className="space-y-6">
          {recent.length > 0 && (
            <section>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <History className="h-4 w-4" /> Recent searches
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map((r) => (
                  <button
                    key={r}
                    onClick={() => setQ(r)}
                    className="rounded-full bg-muted px-3 py-1.5 text-sm text-foreground transition hover:bg-muted/70"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </section>
          )}
          <section>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-accent" /> Trending searches
            </div>
            <div className="flex flex-wrap gap-2">
              {trending.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setQ(t);
                    commitSearch(t);
                  }}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground transition hover:border-primary hover:text-primary"
                >
                  {t}
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div>
          {suggestions.length > 0 && loading === false && (
            <ul className="mb-3 overflow-hidden rounded-2xl border border-border bg-card">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => {
                      setQ(s.name);
                      commitSearch(s.name);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-muted"
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    {s.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {loading ? (
            <ProductGrid products={[]} loading skeletonCount={8} />
          ) : products.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No results found"
              description={`We couldn't find anything for "${q}". Try another keyword.`}
            />
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      )}

      <FilterSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        filters={filters}
        onChange={(f) => {
          setFilters(f);
          setSheetOpen(false);
        }}
      />
    </div>
  );
}
