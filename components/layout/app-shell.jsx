"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { TopHeader } from "@/components/layout/top-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { OfflineBanner } from "@/components/layout/offline-banner";
import { cn } from "@/lib/utils";

export function AppShell({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isAuth = pathname?.startsWith("/auth");

  if (isAdmin || isAuth) {
    return (
      <div className="min-h-screen bg-background">
        <OfflineBanner />
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <OfflineBanner />
      <TopHeader />
      <main className={cn("container-app pb-24 pt-4 lg:pb-12")}>{children}</main>
      <BottomNav />
    </div>
  );
}
