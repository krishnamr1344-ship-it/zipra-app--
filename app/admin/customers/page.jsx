"use client";

import * as React from "react";
import { services } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/utils";

export default function AdminCustomersPage() {
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    services.adminUsers
      .list()
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Customers</h1>
        <p className="text-sm text-muted-foreground">{list.length} customers</p>
      </div>

      {loading ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-none" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Orders</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Spent</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((c) => (
                <tr key={c.id} className="transition hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar fallback={(c.name || "U")[0]} className="h-9 w-9" />
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email || c.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">{c.orders ?? 0}</td>
                  <td className="hidden px-4 py-3 md:table-cell font-semibold">
                    {formatPrice(c.spent ?? 0)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={c.status === "VIP" ? "accent" : c.status === "Inactive" ? "muted" : "success"}>
                      {c.status || "Active"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
