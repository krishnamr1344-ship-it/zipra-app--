"use client";

import * as React from "react";
import Link from "next/link";
import { MapPin, Search, Heart, Bell, ShoppingCart, ChevronDown, Mic } from "lucide-react";
import { useStore } from "@/store/useStore";
import { usePathname } from "next/navigation";
import { DELIVERY } from "@/constants/app";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function TopHeader() {
  const cartCount = useStore((s) => s.cart.reduce((n, i) => n + i.qty, 0));
  const wishlistCount = useStore((s) => s.wishlist.length);
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "relative z-40 px-2 pt-2 transition-all duration-300",
        scrolled ? "pb-2" : "pb-2"
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-screen-xl flex-col gap-3 rounded-3xl bg-gradient-to-br from-[#FF8A1F] via-[#FF7A00] to-[#F26400] px-4 py-3 text-white shadow-md transition-all duration-300",
          scrolled ? "shadow-lg shadow-orange-900/10" : ""
        )}
      >
        <div className="flex items-center gap-3">
          <Link href="/profile" aria-label="Profile" className="shrink-0">
            <Avatar
              fallback="M"
              className="h-10 w-10 border-2 border-white/40 bg-white/15 text-white shadow-sm"
            />
          </Link>

          <button className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full px-2 py-2 text-left transition hover:bg-white/15">
            <MapPin className="h-4.5 w-4.5 shrink-0 text-white drop-shadow" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold leading-tight drop-shadow-sm">
                Home · Bengaluru 560001
              </span>
              <span className="block text-[11px] leading-tight text-white/85">
                Deliver in {DELIVERY.etaMinutes} mins
              </span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-white/80" />
          </button>

          <div className="flex items-center gap-0.5">
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/20 active:scale-90"
            >
              <Heart className="h-5 w-5" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[#FF7A00] ring-2 ring-[#FF7A00]">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              href="/notifications"
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/20 active:scale-90"
            >
              <Bell className="h-5 w-5" />
            </Link>
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/20 active:scale-90"
            >
              <ShoppingCart className="h-5 w-5" />
              {mounted && cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[#FF7A00] ring-2 ring-[#FF7A00]">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <Link
          href="/search"
          aria-label="Search"
          className="flex items-center gap-2.5 rounded-full bg-white px-4 py-2.5 text-left shadow-lg shadow-orange-900/15 transition hover:shadow-xl"
        >
          <Search className="h-4.5 w-4.5 shrink-0 text-[#FF7A00]" />
          <span className="flex-1 text-sm text-muted-foreground">
            Search groceries, fruits, vegetables...
          </span>
          <Mic className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
        </Link>
      </div>
    </header>
  );
}
