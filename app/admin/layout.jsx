"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  LayoutGrid,
  ShoppingCart,
  Users,
  Bell,
  Ticket,
  Image as ImageIcon,
  Settings,
  MapPin,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: LayoutGrid },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/delivery-zones", label: "Delivery Zones", icon: MapPin },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-[#FF7A00] text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-5 w-5" /> Back to Store
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
          <Logo className="scale-90" />
        </header>
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-border bg-card px-4 py-2 lg:hidden">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  active ? "bg-[#FF7A00] text-white" : "bg-muted text-muted-foreground"
                )}
              >
                <item.icon className="h-3.5 w-3.5" /> {item.label}
              </Link>
            );
          })}
        </div>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
