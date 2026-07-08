"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, MapPin, Plus, Home, Briefcase, Check, Pencil, Trash2 } from "lucide-react";
import { services } from "@/services/api";
import { useStore } from "@/store/useStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressForm } from "@/components/address/address-form";
import { useToast } from "@/components/providers/toast-provider";

const ICONS = { Home, Work: Briefcase };

export default function AddressesPage() {
  const setDeliveryAddress = useStore((s) => s.setDeliveryAddress);
  const fetchAddresses = useStore((s) => s.fetchAddresses);
  const { toast } = useToast();
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editAddress, setEditAddress] = React.useState(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await services.addresses.list();
      setList(data);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleAdd = () => {
    setEditAddress(null);
    setFormOpen(true);
  };

  const handleEdit = (addr) => {
    setEditAddress(addr);
    setFormOpen(true);
  };

  const handleDelete = async (addr) => {
    if (!confirm(`Delete address "${addr.label}"?`)) return;
    try {
      await services.addresses.remove(addr.id);
      await fetchAddresses();
      setList((prev) => prev.filter((a) => a.id !== addr.id));
      toast({ title: "Address deleted" });
    } catch {
      toast({ variant: "error", title: "Failed to delete address" });
    }
  };

  const handleSetDefault = async (addr) => {
    try {
      await services.addresses.setDefault(addr.id);
      await fetchAddresses();
      await load();
      setDeliveryAddress(addr);
      toast({ title: "Default address updated" });
    } catch {
      toast({ variant: "error", title: "Failed to set default" });
    }
  };

  const onSaved = async () => {
    await load();
    await fetchAddresses();
  };

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
        <Button variant="gradient" size="sm" className="gap-1.5" onClick={handleAdd}>
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
              <Card
                key={a.id}
                className={`flex gap-3 p-4 ${a.isDefault ? "border-[#FF7A00]/40 bg-[#FF7A00]/5" : ""}`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{a.label}</span>
                    {a.isDefault && <Badge variant="soft">Default</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {a.name}, {a.line1}, {a.line2}
                  </p>
                  <p className="text-xs text-muted-foreground">{a.city} - {a.pincode}</p>
                </div>
                <div className="flex flex-col gap-1 self-center">
                  {!a.isDefault && (
                    <button
                      onClick={() => handleSetDefault(a)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-primary"
                      title="Set as default"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(a)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-primary"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(a)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
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

      <AddressForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editAddress={editAddress}
        onSaved={onSaved}
      />
    </div>
  );
}
