"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, MapPin, Plus, Home, Briefcase, Check } from "lucide-react";
import { services } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const ICONS = { Home, Work: Briefcase };

export default function AddressesPage() {
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    services.addresses
      .list()
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <Link href="/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-sm" aria-label="Back">
        <ChevronLeft className="h-5 w-5" />
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Saved Addresses</h1>
          <p className="text-sm text-muted-foreground">Manage your delivery locations</p>
        </div>
        <Button variant="gradient" size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((a) => {
            const Icon = ICONS[a.label] || Home;
            return (
              <Card key={a.id} className={`flex gap-3 p-4 ${a.isDefault ? "border-[#FF7A00]/40 bg-[#FF7A00]/5" : ""}`}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{a.label}</span>
                    {a.isDefault && <Badge variant="soft">Default</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {a.name}, {a.line1}, {a.line2}
                  </p>
                  <p className="text-xs text-muted-foreground">{a.city} - {a.pincode}</p>
                </div>
                {a.isDefault && <Check className="h-5 w-5 self-center text-[#FF7A00]" />}
              </Card>
            );
          })}
          {list.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No saved addresses yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
