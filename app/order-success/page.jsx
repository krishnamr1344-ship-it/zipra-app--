"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function OrderSuccessPage() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params.get("order");
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-10 text-center">
      <div className={`relative mb-6 transition-all duration-700 ${mounted ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
        <span className="absolute inset-0 animate-ping rounded-full bg-[#FF7A00]/20" />
        <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#FF7A00]/10">
          <CheckCircle2 className="h-14 w-14 text-[#FF7A00]" strokeWidth={1.8} />
        </span>
      </div>

      <h1 className="font-display text-2xl font-bold">Order Placed!</h1>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Your groceries are being packed. You&apos;ll get live updates until they reach your door.
      </p>

      <Card className="mt-6 w-full max-w-sm space-y-2 p-4 text-left">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Order ID</span>
          <span className="font-semibold">{orderId || `Z${cryptoRandom()}`}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">ETA</span>
          <span className="font-semibold text-[#FF7A00]">10 mins</span>
        </div>
      </Card>

      <div className="mt-8 flex w-full max-w-sm flex-col gap-2">
        <Button fullWidth variant="gradient" size="lg" onClick={() => router.push("/orders")} className="gap-2">
          <Package className="h-4 w-4" /> Track Order
        </Button>
        <Link href="/" className="w-full">
          <Button fullWidth variant="outline" size="lg">
            Continue Shopping <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function cryptoRandom() {
  return Math.floor(1000 + Math.random() * 9000);
}
