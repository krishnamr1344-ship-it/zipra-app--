"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Tag, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/categories", label: "Categories", icon: LayoutGrid },
  { href: "/offers", label: "Offers", icon: Tag },
  { href: "/cart", label: "Cart", icon: ShoppingCart, badge: "cart" },
  { href: "/profile", label: "Account", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const cartCount = useStore((s) => s.cart.reduce((n, i) => n + i.qty, 0));
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden">
      <ul className="mx-auto flex max-w-screen-xl items-stretch justify-around">
        {tabs.map((t) => {
          const active =
            t.href === "/"
              ? pathname === "/"
              : pathname.startsWith(t.href);
          const count = t.badge === "cart" ? cartCount : 0;
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors",
                  active ? "text-[#FF7A00]" : "text-muted-foreground"
                )}
              >
                <span className="relative">
                  <span
                    className={cn(
                      "flex h-9 w-12 items-center justify-center rounded-full transition-all",
                      active
                        ? "bg-[#FF7A00]/10 text-[#FF7A00] shadow-sm"
                        : "text-muted-foreground"
                    )}
                  >
                    <t.icon className={cn("h-5 w-5", active && "scale-110")} />
                  </span>
                  {mounted && count > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF7A00] px-1 text-[10px] font-bold text-white shadow">
                      {count}
                    </span>
                  )}
                </span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
