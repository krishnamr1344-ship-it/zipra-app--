"use client";

import * as React from "react";
import { Store, Bell, Globe, CreditCard, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  const [storeOpen, setStoreOpen] = React.useState(true);
  const [push, setPush] = React.useState(true);

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold">Settings</h1>

      <Card className="divide-y divide-border p-0">
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <Store className="h-5 w-5 text-[#FF7A00]" />
            <div>
              <p className="text-sm font-medium">Store open</p>
              <p className="text-xs text-muted-foreground">Accept new orders</p>
            </div>
          </div>
          <Switch checked={storeOpen} onCheckedChange={setStoreOpen} />
        </div>
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-[#FF7A00]" />
            <div>
              <p className="text-sm font-medium">Push notifications</p>
              <p className="text-xs text-muted-foreground">Alert staff on new orders</p>
            </div>
          </div>
          <Switch checked={push} onCheckedChange={setPush} />
        </div>
      </Card>

      <Card className="space-y-4 p-4">
        <div className="flex items-center gap-2 font-semibold">
          <Globe className="h-4 w-4 text-[#FF7A00]" /> Store details
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Store name</label>
          <Input defaultValue="Zipra — Bengaluru" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Support phone</label>
          <Input defaultValue="+91 90000 00000" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Support email</label>
          <Input defaultValue="support@zipra.app" />
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="flex items-center gap-3 p-4">
          <CreditCard className="h-5 w-5 text-[#FF7A00]" />
          <div><p className="font-medium">Payments</p><p className="text-xs text-muted-foreground">Razorpay configured</p></div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <ShieldCheck className="h-5 w-5 text-[#FF7A00]" />
          <div><p className="font-medium">Security</p><p className="text-xs text-muted-foreground">2FA enabled</p></div>
        </Card>
      </div>

      <Button fullWidth variant="gradient">Save changes</Button>
    </div>
  );
}
