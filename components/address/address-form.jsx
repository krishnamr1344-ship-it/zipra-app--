"use client";

import * as React from "react";
import { Home, Briefcase, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { services } from "@/services/api";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { LocationPicker } from "@/components/map/location-picker";
import { useToast } from "@/components/providers/toast-provider";

const LABELS = [
  { value: "Home", icon: Home },
  { value: "Work", icon: Briefcase },
  { value: "Other", icon: MapPin },
];

const INITIAL = {
  label: "Home",
  address_type: "home",
  name: "",
  phone: "",
  address_line1: "",
  house_number: "",
  floor_number: "",
  landmark: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
  latitude: null,
  longitude: null,
  is_default: false,
};

export function AddressForm({ open, onOpenChange, editAddress, onSaved }) {
  const fetchAddresses = useStore((s) => s.fetchAddresses);
  const { toast } = useToast();
  const [form, setForm] = React.useState(INITIAL);
  const [saving, setSaving] = React.useState(false);
  const [zoneCheck, setZoneCheck] = React.useState(null);
  const [checkingZone, setCheckingZone] = React.useState(false);
  const isEdit = !!editAddress;

  React.useEffect(() => {
    if (editAddress) {
      setForm({
        label: editAddress.label,
        address_type: editAddress.label?.toLowerCase() || "home",
        name: editAddress.name,
        phone: editAddress.phone,
        address_line1: editAddress.line1,
        house_number: "",
        floor_number: "",
        landmark: "",
        address_line2: "",
        city: editAddress.city,
        state: editAddress.state,
        pincode: editAddress.pincode,
        latitude: editAddress.latitude,
        longitude: editAddress.longitude,
        is_default: editAddress.isDefault,
      });
    } else {
      setForm(INITIAL);
    }
    setZoneCheck(null);
  }, [editAddress, open]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const checkDeliveryZone = React.useCallback(async (lat, lng) => {
    if (lat == null || lng == null) return null;
    setCheckingZone(true);
    try {
      const res = await services.deliveryZones.check(lat, lng);
      const result = { inZone: !!res?.in_zone, zoneName: res?.zone?.name || null };
      setZoneCheck(result);
      return result;
    } catch {
      setZoneCheck(null);
      return null;
    } finally {
      setCheckingZone(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.address_line1 || !form.city || !form.pincode) return;
    setSaving(true);
    try {
      if (isEdit) {
        await services.addresses.update(editAddress.id, form);
      } else {
        await services.addresses.create(form);
      }
      await fetchAddresses();
      const result = await checkDeliveryZone(form.latitude, form.longitude);
      if (result) {
        toast({
          variant: result.inZone ? "success" : "error",
          title: result.inZone ? "Address saved" : "Address saved",
          description: result.inZone
            ? `Deliverable to this area${result.zoneName ? ` (${result.zoneName})` : ""}`
            : "We don't deliver to this area yet",
        });
      } else {
        toast({ variant: "success", title: "Address saved" });
      }
      onSaved?.();
      onOpenChange(false);
    } catch {
      alert("Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[95vh]">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit address" : "Add new address"}</SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon-sm">✕</Button>
          </SheetClose>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto px-5 pb-8 pt-4">
          <div className="flex gap-2">
            {LABELS.map((l) => {
              const Icon = l.icon;
              return (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => set("label", l.value)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition ${
                    form.label === l.value
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-input text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {l.value}
                </button>
              );
            })}
          </div>

          <Input
            placeholder="Full name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
          <Input
            placeholder="Phone number"
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          <Input
            placeholder="House / Flat / Door No."
            value={form.address_line1}
            onChange={(e) => set("address_line1", e.target.value)}
            required
          />
          <div className="flex gap-3">
            <Input
              placeholder="Floor"
              value={form.floor_number}
              onChange={(e) => set("floor_number", e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Landmark"
              value={form.landmark}
              onChange={(e) => set("landmark", e.target.value)}
              className="flex-1"
            />
          </div>
          <Input
            placeholder="Street / Area / Colony"
            value={form.address_line2}
            onChange={(e) => set("address_line2", e.target.value)}
          />
          <LocationPicker
            onConfirm={(lat, lng) => {
              setForm((f) => ({ ...f, latitude: lat, longitude: lng }));
              checkDeliveryZone(lat, lng);
            }}
          />
          {form.latitude && form.longitude && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Location pinned: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
              </p>
              {checkingZone && (
                <p className="text-xs text-muted-foreground">Checking delivery availability…</p>
              )}
              {!checkingZone && zoneCheck && (
                <p
                  className={
                    zoneCheck.inZone
                      ? "flex items-center gap-1 text-xs font-medium text-success"
                      : "flex items-center gap-1 text-xs font-semibold text-destructive"
                  }
                >
                  {zoneCheck.inZone ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  {zoneCheck.inZone
                    ? `Deliverable to this area${zoneCheck.zoneName ? ` (${zoneCheck.zoneName})` : ""}`
                    : "We don't deliver to this area yet"}
                </p>
              )}
            </div>
          )}
          <div className="flex gap-3">
            <Input
              placeholder="City"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              className="flex-[2]"
              required
            />
            <Input
              placeholder="State"
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
              className="flex-[2]"
            />
            <Input
              placeholder="Pincode"
              value={form.pincode}
              onChange={(e) => set("pincode", e.target.value)}
              className="flex-[1.5]"
              required
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => set("is_default", e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            Set as default address
          </label>

          <Button type="submit" variant="gradient" fullWidth size="lg" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Update address" : "Save address"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
