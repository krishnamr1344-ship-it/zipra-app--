"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, User, Mail, Smartphone, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useToast } from "@/components/providers/toast-provider";
import { authService } from "@/services/api";
import { useStore } from "@/store/useStore";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const syncFromBackend = useStore((s) => s.syncFromBackend);
  const [form, setForm] = React.useState({ name: "", phone: "", email: "", password: "" });
  const [loading, setLoading] = React.useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast({ variant: "error", title: "Name, email and password are required" });
      return;
    }
    setLoading(true);
    try {
      await authService.register({
        displayName: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      await syncFromBackend();
      toast({ variant: "success", title: "Account created!", description: "You're signed in." });
      router.push("/");
    } catch (err) {
      const msg = err?.response?.data?.detail || "Registration failed";
      toast({ variant: "error", title: "Registration failed", description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-[#FFF3E8] to-background">
      <div className="flex flex-1 flex-col justify-center px-6 py-10">
        <div className="mb-8 animate-fade-in">
          <Logo />
          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join Zipra for 10-minute grocery delivery.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4 animate-slide-up">
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={form.name} onChange={set("name")} placeholder="Full name" className="h-12 rounded-2xl pl-11" />
          </div>
          <div className="relative">
            <Smartphone className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={form.phone} onChange={set("phone")} placeholder="Phone number" inputMode="numeric" className="h-12 rounded-2xl pl-11" />
          </div>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={form.email} onChange={set("email")} placeholder="Email (optional)" className="h-12 rounded-2xl pl-11" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
            <Input type="password" value={form.password} onChange={set("password")} placeholder="Password" className="h-12 rounded-2xl pl-11" />
          </div>

          <Button type="submit" fullWidth size="lg" variant="gradient" disabled={loading} className="rounded-2xl">
            {loading ? "Creating…" : "Create Account"} <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-[#FF7A00]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
