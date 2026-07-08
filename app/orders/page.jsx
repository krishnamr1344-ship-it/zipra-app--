"use client";

import * as React from "react";
import Link from "next/link";
import { Package, ChevronRight, RotateCcw } from "lucide-react";
import { services } from "@/services/api";
import { ORDER_STATUS, DELIVERY } from "@/constants/app";
import { formatPrice, formatDateString } from "@/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/empty-state";
import { Image } from "@/components/ui/image";
import { useToast } from "@/components/providers/toast-provider";

export default function OrdersPage() {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const { toast } = useToast();

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await services.orders.list();
      setOrders(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  if (loading)
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    );

  if (error)
    return <ErrorState onRetry={load} title="Couldn't load orders" />;

  if (orders.length === 0)
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="Your order history will appear here."
        action={<Button variant="gradient" onClick={() => (window.location.href = "/")}>Shop now</Button>}
      />
    );

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">My Orders</h1>
      <div className="space-y-3">
        {orders.map((o) => {
          const status = ORDER_STATUS[o.status];
          return (
            <Link key={o.id} href={`/orders/${o.id}`}>
              <Card className="p-4 transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{o.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateString(o.placedAt)} · {o.items.length} items
                    </p>
                  </div>
                  <Badge variant={status.color}>{status.label}</Badge>
                </div>
                  <div className="mt-3 flex items-center gap-2">
                  {o.items.slice(0, 4).map((it) => (
                    <Image
                      key={it.id + it.name}
                      src={it.image}
                      alt=""
                      ratio="1/1"
                      className="h-12 w-12 rounded-xl border border-border"
                    />
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-bold">{formatPrice(o.total)}</span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-primary">
                    View details <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
