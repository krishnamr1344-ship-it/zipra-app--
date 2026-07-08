"use client";

import * as React from "react";
import { Sparkles, Timer } from "lucide-react";
import { services } from "@/services/api";
import { BannerCarousel } from "@/components/home/banner-carousel";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/layout/reveal";
import { PullToRefresh } from "@/components/layout/pull-to-refresh";

export default function HomePage() {
  const [banners, setBanners] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [b, p] = await Promise.all([
        services.banners.list(),
        services.products.list(),
      ]);
      setBanners(b);
      setProducts(p);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <PullToRefresh onRefresh={load}>
      <div className="space-y-7">
        <div className="animate-fade-in">
          <p className="text-sm text-muted-foreground">{greeting}, Mohan 👋</p>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            What are you cooking today?
          </h1>
        </div>

        {loading ? (
          <Skeleton className="h-44 w-full rounded-3xl sm:h-52" />
        ) : error ? (
          <ErrorState onRetry={load} description="Couldn't load the storefront." />
        ) : (
          <Reveal>
            <BannerCarousel banners={banners} />
          </Reveal>
        )}

        <section className="space-y-4">
          <SectionHeader
            title="All products"
            subtitle="Fresh picks for you"
            icon={Sparkles}
            actionHref="/search"
          />
          <ProductGrid products={products} loading={loading} skeletonCount={10} />
        </section>

        <div className="flex items-center justify-center gap-2 rounded-2xl bg-[#FF7A00]/10 px-4 py-3 text-sm font-medium text-[#C25300]">
          <Timer className="h-4 w-4 text-[#FF7A00]" /> Delivering in 10 minutes across Bengaluru
        </div>
      </div>
    </PullToRefresh>
  );
}
