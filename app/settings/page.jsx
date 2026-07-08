"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Bell,
  Moon,
  MapPin,
  ShieldCheck,
  HelpCircle,
  Info,
  Languages,
  CreditCard,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/providers/theme-provider";
import { useToast } from "@/components/providers/toast-provider";

const rows = [
  { href: "/profile/addresses", icon: MapPin, label: "Addresses" },
  { href: "/coupons", icon: CreditCard, label: "Coupons & offers" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/profile/help", icon: HelpCircle, label: "Help & support" },
  { href: "/profile/about", icon: Info, label: "About Zipra" },
];

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [notif, setNotif] = React.useState(true);
  const [location, setLocation] = React.useState(true);

  return (
    <div className="space-y-5">
      <Link href="/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-sm" aria-label="Back">
        <ChevronLeft className="h-5 w-5" />
      </Link>
      <h1 className="font-display text-2xl font-bold">Settings</h1>

      <Card className="divide-y divide-border p-0">
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            {theme === "dark" ? <Moon className="h-5 w-5 text-[#FF7A00]" /> : <Bell className="h-5 w-5 text-[#FF7A00]" />}
            <span className="text-sm font-medium">Dark mode</span>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
        </div>
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-[#FF7A00]" />
            <span className="text-sm font-medium">Push notifications</span>
          </div>
          <Switch checked={notif} onCheckedChange={setNotif} />
        </div>
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-[#FF7A00]" />
            <span className="text-sm font-medium">Location services</span>
          </div>
          <Switch checked={location} onCheckedChange={setLocation} />
        </div>
      </Card>

      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {rows.map((it) => (
          <Link key={it.href} href={it.href} className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-muted">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-foreground">
              <it.icon className="h-5 w-5" />
            </span>
            <span className="flex-1 text-sm font-medium">{it.label}</span>
            <ChevronLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <button
        onClick={() => toast({ variant: "info", title: "Cache cleared" })}
        className="w-full rounded-2xl border border-border bg-card py-3.5 text-sm font-semibold transition hover:bg-muted"
      >
        Clear app cache
      </button>
    </div>
  );
}
