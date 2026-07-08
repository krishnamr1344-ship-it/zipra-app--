"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, Truck, Package, MapPin, FileText, RotateCcw, Bike } from "lucide-react";
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

export default function OrderDetailPage() {
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
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );

  if (error || !order)
    return <ErrorState onRetry={() => window.location.reload()} title="Order not found" />;

  const status = ORDER_STATUS[order.status];
  const currentStep = STEPS.indexOf(order.status);
  const delivered = order.status === "DELIVERED";
  const cancelled = order.status === "CANCELLED";
  const active = !delivered && !cancelled;

  return (
    <div className="space-y-4 pb-24">
      <Link href="/orders" className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-sm" aria-label="Back">
        <ChevronLeft className="h-5 w-5" />
      </Link>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-bold">{order.id}</p>
            <p className="text-xs text-muted-foreground">
              Placed {formatDateString(order.placedAt)}
            </p>
          </div>
          <Badge variant={status.color}>{status.label}</Badge>
        </div>

        {!cancelled && (
          <div className="mt-5">
            <div className="relative flex justify-between">
              <div className="absolute left-0 right-0 top-3 h-0.5 bg-border" />
              <div
                className="absolute left-0 top-3 h-0.5 bg-primary transition-all"
                style={{
                  width: `${(Math.min(currentStep, STEPS.length - 1) / (STEPS.length - 1)) * 100}%`,
                }}
              />
              {STEPS.map((s, i) => (
                <div key={s} className="relative z-10 flex flex-col items-center">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${
                      i <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i <= currentStep ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
              {STEPS.map((s) => (
                <span key={s} className="w-12 text-center">
                  {ORDER_STATUS[s].label.split(" ")[0]}
                </span>
              ))}
            </div>
          </div>
        )}

        {!delivered && !cancelled && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary-soft px-3 py-2.5 text-sm font-medium text-primary-soft-foreground">
            <Truck className="h-4 w-4" /> Arriving in {order.eta}
          </div>
        )}
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
        <MapPin className="mt-0.5 h-5 w-5 text-primary" />
        <div>
          <p className="font-semibold">{order.address.label}</p>
          <p className="text-sm text-muted-foreground">
            {order.address.line1}, {order.address.city} - {order.address.pincode}
          </p>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" fullWidth onClick={() => toast({ variant: "info", title: "Invoice", description: "Download started" })}>
          <FileText className="h-4 w-4" /> Invoice
        </Button>
        <Button variant="soft" fullWidth onClick={() => toast({ variant: "success", title: "Reorder placed" })}>
          <RotateCcw className="h-4 w-4" /> Reorder
        </Button>
      </div>

      {active && (
        <Button fullWidth variant="gradient" onClick={() => router.push(`/orders/${order.id}/tracking`)} className="gap-2">
          <Bike className="h-4 w-4" /> Track Order Live
        </Button>
      )}
    </div>
  );
}
