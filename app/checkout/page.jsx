"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, CreditCard, Banknote, Check, AlertTriangle } from "lucide-react";
import { useStore } from "@/store/useStore";
import { services, ordersService } from "@/services/api";
import { PAYMENT_METHODS } from "@/constants/app";
import { formatPrice } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Textarea } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { useToast } from "@/components/providers/toast-provider";

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useStore((s) => s.cart);
  const subtotal = useStore((s) => s.cartTotal());
  const { toast } = useToast();

  const [addrList, setAddrList] = React.useState([]);
  const [address, setAddress] = React.useState(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [payment, setPayment] = React.useState("razorpay");
  const [instructions, setInstructions] = React.useState("");
  const [placing, setPlacing] = React.useState(false);
  const [zoneInfo, setZoneInfo] = React.useState(null);
  const [zoneLoading, setZoneLoading] = React.useState(false);

  React.useEffect(() => {
    services.addresses.list().then((a) => {
      setAddrList(a);
      setAddress(a.find((x) => x.isDefault) || a[0]);
    });
  }, []);

  React.useEffect(() => {
    if (!address?.latitude || !address?.longitude) {
      setZoneInfo(null);
      return;
    }
    setZoneLoading(true);
    services.deliveryZones
      .check(address.latitude, address.longitude)
      .then((result) => setZoneInfo(result))
      .catch(() => setZoneInfo(null))
      .finally(() => setZoneLoading(false));
  }, [address]);

  if (cart.length === 0)
    return (
      <EmptyState
        icon={CreditCard}
        title="Nothing to checkout"
        description="Your cart is empty."
        action={<Button variant="gradient" onClick={() => router.push("/")}>Browse products</Button>}
      />
    );

  const zone = zoneInfo?.zone;
  const inZone = zoneInfo?.in_zone;
  const deliveryFee =
    zone && subtotal >= zone.free_delivery_above
      ? 0
      : zone
        ? zone.delivery_fee
        : 0;
  const total = subtotal + deliveryFee;

  const placeOrder = async () => {
    if (!address) {
      toast({ variant: "error", title: "Select a delivery address" });
      return;
    }
    if (!inZone) {
      toast({ variant: "error", title: "Delivery unavailable", description: "We don't deliver to this area yet." });
      return;
    }
    setPlacing(true);
    try {
      const order = await ordersService.create({
        addressId: address.id,
        paymentMethod: payment,
      });
      setPlacing(false);
      router.push(`/payment?order=${order.id}`);
    } catch (err) {
      setPlacing(false);
      const msg = err?.response?.data?.detail || "Could not place order";
      toast({ variant: "error", title: "Order failed", description: msg });
    }
  };

  return (
    <div className="space-y-4 pb-32">
      <h1 className="font-display text-2xl font-bold">Checkout</h1>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">Delivery address</h2>
          <button
            className="text-sm font-semibold text-primary"
            onClick={() => setSheetOpen(true)}
          >
            Change
          </button>
        </div>
        {address ? (
          <Card className="flex items-start gap-3 p-4">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{address.label}</span>
                {address.isDefault && <Badge variant="soft">Default</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                {address.name}, {address.line1}, {address.line2}, {address.city} -{" "}
                {address.pincode}
              </p>
              {zoneLoading && (
                <p className="mt-1 text-xs text-muted-foreground">Checking delivery availability…</p>
              )}
              {!zoneLoading && inZone === false && (
                <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                  <AlertTriangle className="h-3 w-3" /> We don&apos;t deliver to this area yet
                </p>
              )}
              {!zoneLoading && zone && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Delivery from {zone.name}
                </p>
              )}
            </div>
          </Card>
        ) : (
          <Button variant="outline" fullWidth onClick={() => setSheetOpen(true)}>
            <Plus className="h-4 w-4" /> Add address
          </Button>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Delivery instructions</h2>
        <Textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g. Leave at the door, call on arrival…"
        />
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Payment method</h2>
        <div className="space-y-2">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setPayment(m.id)}
              className={`flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left transition ${
                payment === m.id ? "border-primary ring-2 ring-primary/20" : "border-border"
              }`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-foreground">
                {m.icon === "cash" && <Banknote className="h-5 w-5" />}
                {m.icon === "card" && <CreditCard className="h-5 w-5" />}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{m.label}</span>
                <span className="block text-xs text-muted-foreground">{m.desc}</span>
              </span>
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                  payment === m.id ? "border-primary bg-primary text-primary-foreground" : "border-border"
                }`}
              >
                {payment === m.id && <Check className="h-3 w-3" />}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-border bg-card p-4">
        <h2 className="font-semibold">Order summary</h2>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Item total ({cart.reduce((n, i) => n + i.qty, 0)} items)</span>
          <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Delivery fee {zone ? `(${zone.name})` : ""}</span>
          <span className="font-medium text-foreground">
            {!inZone ? "—" : deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
          </span>
        </div>
        <div className="my-1 border-t border-border" />
        <div className="flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-bold">{formatPrice(total)}</span>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:static lg:border-0 lg:bg-transparent">
        <div className="container-app py-3">
          <Button
            fullWidth
            variant="gradient"
            size="lg"
            disabled={placing || inZone === false}
            onClick={placeOrder}
          >
            {placing ? "Placing order…" : `Place Order · ${formatPrice(total)}`}
          </Button>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[85vh]">
          <SheetHeader>
            <SheetTitle>Select address</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon-sm">✕</Button>
            </SheetClose>
          </SheetHeader>
          <div className="space-y-2 overflow-y-auto p-4">
            {addrList.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  setAddress(a);
                  setSheetOpen(false);
                }}
                className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
                  address?.id === a.id ? "border-primary bg-primary-soft/40" : "border-border"
                }`}
              >
                <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{a.label}</span>
                    {a.isDefault && <Badge variant="soft">Default</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {a.line1}, {a.city} - {a.pincode}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
