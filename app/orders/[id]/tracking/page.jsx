"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, Phone, Store, Bike, CheckCircle2 } from "lucide-react";
import { services } from "@/services/api";
import { ORDER_STATUS, DELIVERY } from "@/constants/app";
import { formatPrice, formatDateString } from "@/utils";
import { Image } from "@/components/ui/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/empty-state";
import { useToast } from "@/components/providers/toast-provider";

const STEPS = ["PLACED", "CONFIRMED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED"];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const o = await services.orders.get(id);
        setOrder(o);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    );

  if (error || !order)
    return <ErrorState onRetry={() => window.location.reload()} title="Order not found" />;

  const status = ORDER_STATUS[order.status];
  const currentStep = STEPS.indexOf(order.status);
  const delivered = order.status === "DELIVERED";
  const active = !delivered && order.status !== "CANCELLED";

  return (
    <div className="space-y-4 pb-24">
      <Link href="/orders" className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-sm" aria-label="Back">
        <ChevronLeft className="h-5 w-5" />
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold">Track Order</h1>
        <p className="text-sm text-muted-foreground">{order.id} · Placed {formatDateString(order.placedAt)}</p>
      </div>

      <Card className="relative overflow-hidden p-0">
        <div className="h-40 w-full bg-gradient-to-br from-[#FFF3E8] to-[#FFE0C2]">
          <div className="flex h-full items-center justify-center gap-3">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
              <Store className="h-8 w-8 text-[#FF7A00]" />
            </span>
            <div className="relative h-0.5 w-16 bg-[#FF7A00]/40">
              <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 animate-pulse rounded-full bg-[#FF7A00]" />
            </div>
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
              <MapPin className="h-8 w-8 text-[#FF7A00]" />
            </span>
          </div>
        </div>
        {active && (
          <div className="flex items-center justify-between gap-3 bg-[#FF7A00] p-4 text-white">
            <div>
              <p className="text-xs text-white/85">Arriving in</p>
              <p className="font-display text-xl font-bold">{order.eta}</p>
            </div>
            <button
              onClick={() => toast({ variant: "info", title: "Calling partner…" })}
              className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur"
            >
              <Phone className="h-4 w-4" /> Call
            </button>
          </div>
        )}
        {delivered && (
          <div className="flex items-center gap-2 bg-success p-4 text-white">
            <CheckCircle2 className="h-5 w-5" /> Delivered successfully
          </div>
        )}
      </Card>

      <Card className="p-4">
        <div className="relative flex justify-between">
          <div className="absolute left-3 right-3 top-3 h-0.5 bg-border" />
          <div
            className="absolute left-3 top-3 h-0.5 bg-[#FF7A00] transition-all duration-500"
            style={{ width: `${(Math.min(currentStep, STEPS.length - 1) / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map((s, i) => (
            <div key={s} className="relative z-10 flex flex-col items-center">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${i <= currentStep ? "bg-[#FF7A00] text-white" : "bg-muted text-muted-foreground"}`}>
                {i <= currentStep ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className="mt-1 w-14 text-center text-[10px] text-muted-foreground">
                {ORDER_STATUS[s].label.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="mb-3 font-semibold">Items</h3>
        <div className="space-y-3">
          {order.items.map((it) => (
            <div key={it.id + it.name} className="flex items-center gap-3">
              <Image src={it.image} alt={it.name} ratio="1/1" className="h-14 w-14 rounded-xl" />
              <div className="flex-1">
                <p className="text-sm font-medium">{it.name}</p>
                <p className="text-xs text-muted-foreground">Qty: {it.qty}</p>
              </div>
              <span className="text-sm font-semibold">{formatPrice(it.price * it.qty)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-bold">{formatPrice(order.total)}</span>
        </div>
      </Card>

      <Card className="flex items-start gap-3 p-4">
        <MapPin className="mt-0.5 h-5 w-5 text-[#FF7A00]" />
        <div>
          <p className="font-semibold">{order.address.label}</p>
          <p className="text-sm text-muted-foreground">
            {order.address.line1}, {order.address.city} - {order.address.pincode}
          </p>
        </div>
      </Card>

      <Button fullWidth variant="soft" onClick={() => router.push(`/orders/${order.id}`)} className="gap-2">
        <Bike className="h-4 w-4" /> View order details
      </Button>
    </div>
  );
}
