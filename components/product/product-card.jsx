"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, discountPercent } from "@/utils";
import { Image } from "@/components/ui/image";
import { Badge } from "@/components/ui/badge";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useStore } from "@/store/useStore";
import { useToast } from "@/components/providers/toast-provider";

export function ProductCard({ product, className }) {
  const addToCart = useStore((s) => s.addToCart);
  const setQty = useStore((s) => s.setQty);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const isWishlisted = useStore((s) =>
    s.wishlist.some((i) => i.id === product.id)
  );
  const qty = useStore((s) => s.cart.find((i) => i.id === product.id)?.qty || 0);
  const { toast } = useToast();

  const pct = discountPercent(product.price, product.mrp);

  const handleQty = (v) => {
    if (v === 0) {
      setQty(product.id, 0);
    } else if (qty === 0) {
      addToCart(product, v);
      toast({ variant: "success", title: "Added to cart", description: product.name });
    } else {
      setQty(product.id, v);
    }
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        !product.inStock && "opacity-95",
        className
      )}
    >
      <div className="relative">
        <Image
          src={product.image}
          alt={product.name}
          ratio="1/1"
          className="bg-muted"
          imgClassName="transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {pct > 0 && (
            <span className="rounded-full bg-[#FF7A00] px-2 py-0.5 text-[10px] font-bold text-white shadow">
              {pct}% OFF
            </span>
          )}
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/55 backdrop-blur-[1px]">
            <span className="rounded-full bg-foreground/85 px-3 py-1 text-xs font-semibold text-background">
              Out of stock
            </span>
          </div>
        )}
        <button
          aria-label="Toggle wishlist"
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition active:scale-90 hover:bg-white"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition",
              isWishlisted ? "fill-[#FF3B5C] text-[#FF3B5C]" : "text-muted-foreground"
            )}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {product.badge && (
          <span className="w-fit rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-soft-foreground">
            {product.badge}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground">{product.unit}</p>

        <div className="mt-auto flex items-center gap-1 text-xs">
          <Star className="h-3.5 w-3.5 fill-[#FFB020] text-[#FFB020]" />
          <span className="font-semibold">{product.rating?.toFixed(1)}</span>
          <span className="text-muted-foreground">({product.reviews})</span>
        </div>

        <div className="flex items-end justify-between gap-2 pt-1">
          <div className="flex flex-col">
            <span className="text-base font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {pct > 0 && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>
          <div onClick={(e) => e.preventDefault()}>
            {product.inStock ? (
              <QuantityStepper
                value={qty}
                onChange={handleQty}
                size="sm"
              />
            ) : (
              <span className="text-xs font-semibold text-muted-foreground">—</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
