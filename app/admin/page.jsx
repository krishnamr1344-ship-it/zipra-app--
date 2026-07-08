"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Receipt,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { services } from "@/services/api";
import { formatPrice } from "@/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["#FF7A00", "#FFB020", "#3b82f6", "#ec4899", "#14b8a6"];

export default function AdminPage() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    services.analytics.get().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading || !data)
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );

  const d = data || {};
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueSeries = d.revenueSeries || d.revenue_series || [];
  const ordersSeries = d.ordersSeries || d.orders_series || [];
  const revenueData = revenueSeries.map((v, i) => ({ name: months[i], value: v * 1000 }));
  const ordersData = ordersSeries.map((v, i) => ({ name: months[i], value: v }));
  const num = (v) => (typeof v === "number" ? v : Number(v) || 0);

  const stats = [
    { label: "Revenue", value: formatPrice(num(d.revenue)), icon: IndianRupee, delta: d.revenueDelta || "+12.4%" },
    { label: "Orders", value: num(d.orders).toLocaleString(), icon: ShoppingBag, delta: d.ordersDelta || "+8.1%" },
    { label: "Customers", value: num(d.customers).toLocaleString(), icon: Users, delta: d.customersDelta || "+5.3%" },
    { label: "Avg Order", value: formatPrice(num(d.avgOrder)), icon: Receipt, delta: d.avgOrderDelta || "+2.0%" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Business overview · live metrics</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-foreground">
                <s.icon className="h-5 w-5" />
              </span>
              <span className="flex items-center gap-0.5 text-xs font-semibold text-success">
                <ArrowUpRight className="h-3 w-3" /> {s.delta}
              </span>
            </div>
            <p className="mt-3 font-display text-xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <h3 className="mb-3 font-semibold">Revenue trend</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#FF7A00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }}
              formatter={(v) => [formatPrice(v), "Revenue"]}
            />
            <Area type="monotone" dataKey="value" stroke="#FF7A00" strokeWidth={2.5} fill="url(#rev)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-3 font-semibold">Orders / month</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#FF7A00" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 font-semibold">Sales by category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={d.categorySales || []} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {(d.categorySales || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="mb-3 font-semibold">Top products</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium">Units</th>
                <th className="pb-2 text-right font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(d.topProducts || []).map((p) => (
                <tr key={p.name}>
                  <td className="py-2.5 font-medium">{p.name}</td>
                  <td className="py-2.5 text-muted-foreground">{num(p.sold).toLocaleString()}</td>
                  <td className="py-2.5 text-right font-semibold">{formatPrice(num(p.revenue))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
