"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useToast } from "@/components/providers/toast-provider";
import { cn } from "@/lib/utils";

const LEN = 6;

export default function OtpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const isNew = params.get("new") === "1";
  const phone = params.get("phone") || "+91 90000 00000";
  const { toast } = useToast();
  const [digits, setDigits] = React.useState(Array(LEN).fill(""));
  const [loading, setLoading] = React.useState(false);
  const refs = React.useRef([]);

  const setAt = (i, v) => {
    const next = [...digits];
    next[i] = v.replace(/\D/g, "").slice(-1);
    setDigits(next);
    if (v && i < LEN - 1) refs.current[i + 1]?.focus();
  };

  const onKey = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const verify = () => {
    if (digits.join("").length < LEN) {
      toast({ variant: "error", title: "Enter the 6-digit code" });
      return;
    }
    setLoading(true);
    // TODO: Implement Firebase Phone Auth verification
    setTimeout(() => {
      setLoading(false);
      toast({ variant: "success", title: "Verified!" });
      router.push(isNew ? "/profile/edit" : "/");
    }, 900);
  };

  const resend = () => {
    // TODO: Implement Firebase Phone Auth resend
    toast({ variant: "info", title: "OTP sent", description: "Check your messages." });
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-[#FFF3E8] to-background">
      <div className="flex flex-1 flex-col justify-center px-6 py-10">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="mb-8 animate-fade-in">
          <Logo />
          <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF7A00]/10 text-[#FF7A00]">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Verify your number</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the 6-digit code sent to {phone}
          </p>
        </div>

        <div className="flex justify-between gap-2 animate-slide-up">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              value={d}
              onChange={(e) => setAt(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
              inputMode="numeric"
              maxLength={1}
              className={cn(
                "h-14 w-full rounded-2xl border border-input bg-card text-center text-xl font-bold shadow-sm outline-none transition focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/25"
              )}
            />
          ))}
        </div>

        <Button fullWidth size="lg" variant="gradient" disabled={loading} onClick={verify} className="mt-6 rounded-2xl">
          {loading ? "Verifying\u2026" : "Verify & Continue"} <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Didn&apos;t receive it?{" "}
          <button onClick={resend} className="font-semibold text-[#FF7A00]">
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  );
}
