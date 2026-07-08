"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  MapPin,
  Package,
  Heart,
  Wallet,
  Bell,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Ticket,
  Settings,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/providers/theme-provider";
import { useToast } from "@/components/providers/toast-provider";
import { useAuth } from "@/lib/firebase";
import { authService } from "@/services/api";

const items = [
  { href: "/profile/addresses", icon: MapPin, label: "Saved addresses" },
  { href: "/orders", icon: Package, label: "My orders" },
  { href: "/wishlist", icon: Heart, label: "Wishlist" },
  { href: "/coupons", icon: Ticket, label: "Coupons" },
  { href: "/profile/wallet", icon: Wallet, label: "Wallet & refunds" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/profile/help", icon: HelpCircle, label: "Help & support" },
  { href: "/profile/about", icon: Info, label: "About Zipra" },
];

export default function ProfilePage() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.logout();
    } catch {
      // Proceed with local sign out even if API call fails
    }
    logout();
    toast({ variant: "success", title: "Signed out", description: "See you soon!" });
    router.push("/auth/login");
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : "2024";

  return (
    <div className="space-y-5">
      <Card className="flex items-center gap-4 bg-gradient-to-br from-[#FF8A1F] via-[#FF7A00] to-[#F26400] p-5 text-white shadow-md">
        <Avatar fallback={initials} className="h-16 w-16 border-2 border-white/40" />
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold">{displayName}</h1>
          <p className="text-sm text-primary-foreground/80">{user?.email || "No email"}</p>
          <p className="text-xs text-primary-foreground/70">member since {memberSince}</p>
        </div>
        <Link
          href="/profile/edit"
          className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur transition hover:bg-white/30"
        >
          Edit
        </Link>
      </Card>

      <Card className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {theme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-accent" />}
          <span className="font-medium">Dark mode</span>
        </div>
        <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
      </Card>

      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-muted"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-foreground">
              <it.icon className="h-4.5 w-4.5" />
            </span>
            <span className="flex-1 text-sm font-medium">{it.label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-card py-3.5 text-sm font-semibold text-destructive transition hover:bg-destructive/5 disabled:opacity-50"
      >
        <LogOut className="h-4 w-4" /> {loggingOut ? "Signing out\u2026" : "Logout"}
      </button>
    </div>
  );
}
