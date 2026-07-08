"use client";

import * as React from "react";
import { ChevronLeft, Ticket, Copy, Check } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/providers/toast-provider";
import { Reveal } from "@/components/layout/reveal";

const COUPONS = [
  { code: "FRESH20", title: "20% off on first order", desc: "Max discount ₹100", min: 199, expiry: "Dec 31" },
  { code: "FREE499", title: "Free delivery", desc: "On orders above ₹499", min: 499, expiry: "Dec 31" },
  { code: "COMBO15", title: "15% off on combos", desc: "Festive hampers", min: 349, expiry: "Dec 25" },
  { code: "WELCOME50", title: "₹50 off", desc: "For new users", min: 149, expiry: "Dec 20" },
];

export default function CouponsPage() {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(null);

  const copy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopied(code);
    toast({ variant: "success", title: "Copied!", description: code });
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-5">
      <Link href="/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-sm" aria-label="Back">
        <ChevronLeft className="h-5 w-5" />
      </Link>
      <div>
        <h1 className="font-display text-2xl font-bold">My Coupons</h1>
        <p className="text-sm text-muted-foreground">Tap to copy and apply at checkout</p>
      </div>

      <div className="space-y-3">
        {COUPONS.map((c, i) => (
          <Reveal key={c.code} delay={i * 60}>
            <Card className="flex items-center gap-3 p-3 shadow-sm">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FF7A00]/10 text-[#FF7A00]">
                <Ticket className="h-7 w-7" />
              </span>
              <div className="flex-1">
                <p className="font-semibold">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.desc}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="soft">{c.code}</Badge>
                  <span>Min ₹{c.min}</span>
                  <span>·</span>
                  <span>Valid till {c.expiry}</span>
                </div>
              </div>
              <button
                onClick={() => copy(c.code)}
                className="flex h-9 items-center gap-1 rounded-full bg-[#FF7A00] px-3 text-xs font-semibold text-white transition active:scale-95"
              >
                {copied === c.code ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied === c.code ? "Copied" : "Copy"}
              </button>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
