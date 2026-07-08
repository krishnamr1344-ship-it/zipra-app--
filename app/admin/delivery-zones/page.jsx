"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { services } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/utils";

export default function AdminDeliveryZonesPage() {
  const [zones, setZones] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    services.deliveryZones
      .list()
      .then(setZones)
      .catch(() => setZones([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Delivery Zones</h1>
          <p className="text-sm text-muted-foreground">{zones.length} zones</p>
        </div>
        <Button variant="gradient" size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Zone
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {zones.map((z) => (
            <Card key={z.id} className="flex items-center justify-between p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-foreground">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{z.name}</span>
                    <Badge variant={z.is_active ? "success" : "muted"}>
                      {z.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Fee: {formatPrice(z.delivery_fee)} · Free above {formatPrice(z.free_delivery_above)} · {z.coordinates?.length || 0} points
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-primary-soft hover:text-primary-soft-foreground">
                  <Pencil className="h-4 w-4" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
          {zones.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border p-8 text-center">
              <MapPin className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No delivery zones yet. Create one to start serving areas.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
