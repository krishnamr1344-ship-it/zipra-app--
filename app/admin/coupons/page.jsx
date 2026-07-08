"use client";

import * as React from "react";
import { Pencil, Trash2, Plus, Ticket } from "lucide-react";
import { services } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCouponsPage() {
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    api_list()
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  async function api_list() {
    const { data } = await (await import("@/services/api")).default.get("/admin/combo-packs");
    const arr = Array.isArray(data) ? data : data?.items || data?.data || [];
    return arr.map((c) => ({
      id: c.id,
      code: c.code || c.name || "COMBO",
      title: c.name || "Combo Pack",
      desc: c.description || "Curated combo",
      discount: c.discount_percent ? `${c.discount_percent}%` : "Offer",
      status: c.is_active ? "Active" : "Expired",
    }));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Coupons & Combos</h1>
          <p className="text-sm text-muted-foreground">{list.length} offers</p>
        </div>
        <Button variant="gradient" size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Add
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
          {list.map((c) => (
            <Card key={c.id} className="flex items-center justify-between p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-base font-bold">{c.code}</span>
                  <Badge variant={c.status === "Active" ? "success" : "muted"}>{c.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{c.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">Discount {c.discount} · {c.desc}</p>
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
          {list.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border p-8 text-center">
              <Ticket className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No combo offers yet. Create one from the backend.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
