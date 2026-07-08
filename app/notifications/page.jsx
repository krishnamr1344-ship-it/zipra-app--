"use client";

import * as React from "react";
import { Bell, Tag, Info, Package, CheckCheck } from "lucide-react";
import { services } from "@/services/api";
import { groupByDate, timeAgo } from "@/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/empty-state";

const icons = {
  order: Package,
  offer: Tag,
  info: Info,
};

const dayLabel = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
};

export default function NotificationsPage() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await services.notifications.list();
      setItems(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const markAll = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  if (loading)
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );

  if (error) return <ErrorState onRetry={load} />;

  if (items.length === 0)
    return (
      <EmptyState icon={Bell} title="No notifications" description="We'll let you know when something happens." />
    );

  const groups = groupByDate(items, (n) => n.createdAt);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Notifications</h1>
        <button onClick={markAll} className="flex items-center gap-1 text-sm font-semibold text-primary">
          <CheckCheck className="h-4 w-4" /> Mark all read
        </button>
      </div>

      {Object.entries(groups).map(([date, list]) => (
        <div key={date} className="space-y-2">
          <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {dayLabel(date)}
          </p>
          {list.map((n) => {
            const Icon = icons[n.type] || Info;
            return (
              <Card
                key={n.id}
                className={`flex gap-3 p-4 transition ${n.read ? "opacity-70" : "border-primary/30 bg-primary-soft/20"}`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    n.type === "offer"
                      ? "bg-accent/15 text-accent-foreground"
                      : n.type === "order"
                      ? "bg-primary-soft text-primary-soft-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{n.title}</p>
                    {!n.read && <Badge variant="default" className="h-1.5 w-1.5 rounded-full p-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
                </div>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}
