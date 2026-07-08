"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Mail, Lock, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useToast } from "@/components/providers/toast-provider";
import { authService } from "@/services/api";
import { useStore } from "@/store/useStore";
import { signInWithGoogle } from "@/lib/firebase";
import api from "@/services/api";

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { toast } = useToast();
  const syncFromBackend = useStore((s) => s.syncFromBackend);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ variant: "error", title: "Enter email and password" });
      return;
    }
    setLoading(true);
    try {
      await authService.login(email.trim(), password);
      await syncFromBackend();
      toast({ variant: "success", title: "Welcome back to Zipra!" });
      router.push(redirect);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.detail || err.message || "Login failed";
      toast({ variant: "error", title: "Login failed", description: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { credential } = await signInWithGoogle();

      // Send the Google ID token to the backend API to set session cookie
      await api.post("/auth/google", { idToken: credential.token });

      await syncFromBackend();
      toast({ variant: "success", title: "Signed in with Google!" });
      router.push(redirect);
    } catch (err) {
      if (err.message !== "Popup closed" && err.message !== "Sign-in popup was closed.") {
        toast({ variant: "error", title: "Google sign-in failed", description: err.message });
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-[#FFF3E8] to-background">
      <div className="flex flex-1 flex-col justify-center px-6 py-10">
        <div className="mb-8 animate-fade-in">
          <Logo />
          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight">
            Sign in to Zipra
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fresh groceries delivered in minutes.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4 animate-slide-up">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              type="email"
              autoComplete="email"
              className="h-12 rounded-2xl pl-11"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="h-12 rounded-2xl pl-11"
            />
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            variant="gradient"
            disabled={loading}
            className="rounded-2xl"
          >
            {loading ? "Signing in\u2026" : "Sign In"} <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gradient-to-b from-[#FFF3E8] to-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card py-3.5 text-sm font-semibold shadow-sm transition hover:bg-muted disabled:opacity-50"
        >
          {googleLoading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-[#FF7A00]" />
          ) : (
            <GoogleIcon />
          )}
          {googleLoading ? "Signing in\u2026" : "Continue with Google"}
        </button>

        <button
          onClick={() => router.push("/auth/otp")}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-semibold transition hover:bg-muted"
        >
          <Smartphone className="h-4 w-4 text-[#FF7A00]" /> Continue with OTP
        </button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to Zipra?{" "}
          <Link href="/auth/register" className="font-semibold text-[#FF7A00]">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
