"use client";

import * as React from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, discountPercent } from "@/utils";
import { Image } from "@/components/ui/image";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useStore } from "@/store/useStore";

export function CartItem({ item }) {
  const setQty = useStore((s) => s.setQty);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const pct = discountPercent(item.price, item.mrp);

  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
      <Link href={`/product/${item.id}`} className="shrink-0">
        <Image src={item.image} alt={item.name} ratio="1/1" className="h-20 w-20 rounded-xl" />
      </Link>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/product/${item.id}`} className="min-w-0">
            <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
              {item.name}
            </h3>
            <p className="text-xs text-muted-foreground">{item.unit}</p>
          </Link>
          <button
            aria-label="Remove"
            onClick={() => removeFromCart(item.id)}
            className="rounded-full p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold">{formatPrice(item.price)}</span>
            {pct > 0 && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(item.mrp)}
              </span>
            )}
          </div>
          <QuantityStepper value={item.qty} onChange={(v) => setQty(item.id, v)} size="sm" />
        </div>
      </div>
    </div>
  );
}
