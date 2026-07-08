"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CreditCard, Banknote, Check, Lock, ShieldCheck } from "lucide-react";
import { useStore } from "@/store/useStore";
import { PAYMENT_METHODS } from "@/constants/app";
import { paymentsService, ordersService } from "@/services/api";
import { formatPrice } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/providers/toast-provider";
import { useSearchParams } from "next/navigation";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentPage() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params.get("order");
  const cart = useStore((s) => s.cart);
  const subtotal = useStore((s) => s.cartTotal());
  const clearCart = useStore((s) => s.clearCart);
  const { toast } = useToast();
  const [payment, setPayment] = React.useState("razorpay");
  const [paying, setPaying] = React.useState(false);
  const [order, setOrder] = React.useState(null);

  React.useEffect(() => {
    if (orderId) {
      ordersService.getById(orderId).then(setOrder).catch(() => {});
    }
  }, [orderId]);

  if (cart.length === 0)
    return (
      <EmptyState
        icon={CreditCard}
        title="Nothing to pay"
        description="Your cart is empty."
        action={<Button variant="gradient" onClick={() => router.push("/")}>Browse products</Button>}
      />
    );

  const total = order?.total || subtotal;

  const pay = async () => {
    if (!orderId) {
      toast({ variant: "error", title: "No order found", description: "Start checkout again." });
      router.push("/cart");
      return;
    }

    if (payment === "cod") {
      await clearCart();
      router.push(`/order-success?order=${orderId}`);
      return;
    }

    setPaying(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast({ variant: "error", title: "Payment gateway unavailable", description: "Please try again or choose COD." });
        setPaying(false);
        return;
      }

      const cfg = await paymentsService.config();
      const razorpayOrder = await paymentsService.createRazorpay(total);

      const options = {
        key: cfg.razorpay_key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Zipra",
        description: `Order #${orderId.slice(0, 8)}`,
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            await ordersService.verifyPayment(orderId, {
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            await clearCart();
            router.push(`/order-success?order=${orderId}`);
          } catch {
            toast({ variant: "error", title: "Payment verification failed", description: "Contact support if amount was deducted." });
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
        theme: {
          color: "#FF7A00",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        toast({ variant: "error", title: "Payment failed", description: resp.error?.description || "Transaction failed" });
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      setPaying(false);
      const msg = err?.response?.data?.detail || "Payment could not be initiated";
      toast({ variant: "error", title: "Payment failed", description: msg });
    }
  };

  return (
    <div className="space-y-4 pb-32">
      <Link href="/checkout" className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-sm" aria-label="Back">
        <ChevronLeft className="h-5 w-5" />
      </Link>
      <div>
        <h1 className="font-display text-2xl font-bold">Payment</h1>
        <p className="text-sm text-muted-foreground">Choose how you want to pay</p>
      </div>

      <Card className="flex items-center gap-3 bg-[#FF7A00]/5 p-4">
        <ShieldCheck className="h-5 w-5 text-[#FF7A00]" />
        <p className="text-sm text-foreground">Payments are secure and encrypted</p>
      </Card>

      <section className="space-y-2">
        {PAYMENT_METHODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setPayment(m.id)}
            className={`flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left transition ${
              payment === m.id ? "border-[#FF7A00] ring-2 ring-[#FF7A00]/20" : "border-border"
            }`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-foreground">
              {m.icon === "cash" && <Banknote className="h-5 w-5" />}
              {m.icon === "card" && <CreditCard className="h-5 w-5" />}
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold">{m.label}</span>
              <span className="block text-xs text-muted-foreground">{m.desc}</span>
            </span>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${payment === m.id ? "border-[#FF7A00] bg-[#FF7A00] text-white" : "border-border"}`}>
              {payment === m.id && <Check className="h-3 w-3" />}
            </span>
          </button>
        ))}
      </section>

      <Card className="space-y-1 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Amount payable</span>
          <span className="font-semibold">{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Items ({cart.reduce((n, i) => n + i.qty, 0)}) + delivery</span>
        </div>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:static lg:border-0 lg:bg-transparent">
        <div className="container-app py-3">
          <Button fullWidth variant="gradient" size="lg" disabled={paying} onClick={pay} className="gap-2">
            <Lock className="h-4 w-4" /> {paying ? "Processing…" : payment === "cod" ? "Place Order" : `Pay ${formatPrice(total)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
