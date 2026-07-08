"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Tag, ShoppingBag, Truck, Percent } from "lucide-react";
import { useStore } from "@/store/useStore";
import { DELIVERY } from "@/constants/app";
import { formatPrice } from "@/utils";
import { CartItem } from "@/components/cart/cart-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/providers/toast-provider";

export default function CartPage() {
  const router = useRouter();
  const cart = useStore((s) => s.cart);
  const subtotal = useStore((s) => s.cartTotal());
  const mrpTotal = useStore((s) => s.cartMrpTotal());
  const { toast } = useToast();
  const [coupon, setCoupon] = React.useState("");
  const [applied, setApplied] = React.useState(null);

  const savings = mrpTotal - subtotal;
  const deliveryFee = subtotal >= DELIVERY.freeAbove || subtotal === 0 ? 0 : DELIVERY.fee;
  const couponDiscount = applied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + deliveryFee - couponDiscount;

  const applyCoupon = () => {
    if (!coupon.trim()) return;
    setApplied(coupon.trim().toUpperCase());
    toast({ variant: "success", title: "Coupon applied", description: `10% off with ${coupon.trim().toUpperCase()}` });
  };

  if (cart.length === 0)
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Add items from the store to see them here."
        action={
          <Button variant="gradient" onClick={() => router.push("/")}>
            Start shopping
          </Button>
        }
      />
    );

  return (
    <div className="space-y-4 pb-32">
      <h1 className="font-display text-2xl font-bold">My Cart</h1>

      <div className="space-y-3">
        {cart.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 font-semibold">
          <Tag className="h-4 w-4 text-primary" /> Apply coupon
        </div>
        {applied ? (
          <div className="flex items-center justify-between rounded-xl bg-primary-soft px-3 py-2.5">
            <span className="text-sm font-semibold text-primary-soft-foreground">
              {applied} applied · 10% off
            </span>
            <button
              className="text-xs font-semibold text-destructive"
              onClick={() => setApplied(null)}
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Enter coupon code"
              className="uppercase"
            />
            <Button variant="outline" onClick={applyCoupon}>
              Apply
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <Row label="Item total" value={formatPrice(subtotal)} />
        {savings > 0 && (
          <Row label="You save" value={`-${formatPrice(savings)}`} accent="success" />
        )}
        <Row
          label={
            <span className="flex items-center gap-1">
              <Truck className="h-3.5 w-3.5" /> Delivery fee
            </span>
          }
          value={deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
          accent={deliveryFee === 0 ? "success" : undefined}
        />
        {couponDiscount > 0 && (
          <Row label={`Coupon (${applied})`} value={`-${formatPrice(couponDiscount)}`} accent="success" />
        )}
        <div className="my-1 border-t border-border" />
        <Row label="To pay" value={formatPrice(total)} bold />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:static lg:border-0 lg:bg-transparent">
        <div className="container-app flex items-center justify-between gap-3 py-3">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-bold">{formatPrice(total)}</p>
          </div>
          <Button
            variant="gradient"
            size="lg"
            className="px-10"
            onClick={() => router.push("/checkout")}
          >
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent, bold }) {
  const color =
    accent === "success" ? "text-success" : bold ? "text-foreground" : "text-muted-foreground";
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={color}>{label}</span>
      <span className={`${color} ${bold ? "text-lg font-bold" : "font-medium"}`}>
        {value}
      </span>
    </div>
  );
}
