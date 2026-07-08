"use client";

import * as React from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { useStore } from "@/store/useStore";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function WishlistPage() {
  const wishlist = useStore((s) => s.wishlist);

  if (wishlist.length === 0)
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Tap the heart on any product to save it here."
        action={<Button variant="gradient" onClick={() => (window.location.href = "/")}>Explore products</Button>}
      />
    );

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Wishlist</h1>
      <ProductGrid products={wishlist} />
    </div>
  );
}
