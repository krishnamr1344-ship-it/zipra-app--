"use client";

import * as React from "react";
import Link from "next/link";
import { services } from "@/services/api";
import { ORDER_STATUS } from "@/constants/app";
import { Image } from "@/components/ui/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDateString } from "@/utils";

export default function AdminOrdersPage() {
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    services.orders
      .list()
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">{list.length} recent orders</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((o) => {
            const status = ORDER_STATUS[o.status] || { label: o.status, color: "muted" };
            return (
              <Card key={o.id} className="p-4">
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
                  {o.items.slice(0, 5).map((it) => (
                    <Image key={it.id + it.name} src={it.image} alt="" ratio="1/1" className="h-12 w-12 rounded-xl border border-border" />
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-bold">{formatPrice(o.total)}</span>
                  <Link href={`/orders/${o.id}`} className="text-sm font-semibold text-[#FF7A00]">
                    View
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
