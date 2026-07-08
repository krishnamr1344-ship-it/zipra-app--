"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, Tag, Percent, Flame, Clock } from "lucide-react";
import { services } from "@/services/api";
import { ProductGrid } from "@/components/product/product-grid";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/layout/reveal";

const OFFERS = [
  { code: "FRESH20", title: "20% off on first order", sub: "New users only", icon: Flame, color: "from-[#FF9A3D] to-[#F26400]" },
  { code: "FREE499", title: "Free delivery above ₹499", sub: "All categories", icon: Tag, color: "from-[#FFB020] to-[#FF7A00]" },
  { code: "COMBO15", title: "15% off on combos", sub: "Festive hampers", icon: Percent, color: "from-[#FF7A00] to-[#E04E00]" },
  { code: "EXPRESS", title: "₹50 off express delivery", sub: "Today only", icon: Clock, color: "from-[#FF8A1F] to-[#FF5E3A]" },
];

export default function OffersPage() {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    services.products
      .list({ sort: "price_asc" })
      .then((r) => setProducts(r))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-sm" aria-label="Back">
        <ChevronLeft className="h-5 w-5" />
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold">Offers & Coupons</h1>
        <p className="text-sm text-muted-foreground">Save more on every order</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {OFFERS.map((o, i) => {
          const Icon = o.icon;
          return (
            <Reveal key={o.code} delay={i * 60}>
              <Card className={`flex items-center gap-3 overflow-hidden bg-gradient-to-br ${o.color} p-4 text-white shadow-md`}>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                  <Icon className="h-6 w-6" />
                </span>
                <div className="flex-1">
                  <p className="font-display text-base font-bold">{o.title}</p>
                  <p className="text-xs text-white/85">{o.sub}</p>
                  <span className="mt-1 inline-block rounded-md bg-white px-2 py-0.5 text-xs font-bold text-[#FF7A00]">
                    {o.code}
                  </span>
                </div>
              </Card>
            </Reveal>
          );
        })}
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Badge variant="accent">Best deals</Badge>
          <h2 className="font-display text-lg font-bold">Discounted products</h2>
        </div>
        <ProductGrid products={products} loading={loading} skeletonCount={8} />
      </section>
    </div>
  );
}
