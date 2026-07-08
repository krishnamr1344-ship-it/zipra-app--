"use client";

import * as React from "react";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
import { services } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminBannersPage() {
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    services.adminBanners
      .list()
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Banners</h1>
          <p className="text-sm text-muted-foreground">{list.length} banners</p>
        </div>
        <Button variant="gradient" size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((b) => (
            <Card key={b.id} className="flex items-center gap-4 p-3">
              <div className={`flex h-16 w-28 items-center justify-center rounded-xl bg-gradient-to-r ${b.gradient} text-xs font-bold text-white`}>
                {b.title}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{b.title}</p>
                <p className="text-xs text-muted-foreground">CTA: {b.cta}</p>
              </div>
              <Badge variant={b.status === "Live" ? "success" : "warning"}>{b.status}</Badge>
              <div className="flex gap-1">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-primary-soft hover:text-primary-soft-foreground">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-primary-soft hover:text-primary-soft-foreground">
                  <Pencil className="h-4 w-4" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
