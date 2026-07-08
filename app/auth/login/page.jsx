"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Cloud, Sun, CloudRain, Snowflake, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useToast } from "@/components/providers/toast-provider";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/lib/firebase";
import api from "@/services/api";

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

function WeatherWidget() {
  const [weather, setWeather] = React.useState(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current_weather=true`
            );
            const data = await res.json();
            setWeather(data.current_weather);
          } catch {
            setError(true);
          }
        },
        () => {
          fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=19.076&longitude=72.8777&current_weather=true"
          )
            .then((r) => r.json())
            .then((d) => setWeather(d.current_weather))
            .catch(() => setError(true));
        },
        { timeout: 5000 }
      );
    } else {
      setError(true);
    }
  }, []);

  if (error) return null;
  if (!weather) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;

  const code = weather.weathercode || 0;
  const temp = Math.round(weather.temperature);
  let Icon = Sun;
  if (code >= 61 && code <= 67) Icon = CloudRain;
  else if (code >= 71 && code <= 77) Icon = Snowflake;
  else if (code >= 51 && code <= 55) Icon = CloudRain;
  else if (code >= 80 && code <= 82) Icon = CloudRain;
  else if (code >= 95) Icon = CloudRain;
  else if (code >= 2 && code <= 48) Icon = Cloud;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="h-5 w-5 text-[#FF7A00]" />
      <span>{temp}°C right now</span>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { toast } = useToast();
  const syncFromBackend = useStore((s) => s.syncFromBackend);
  const { loginWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      const token = result?.credential?.token;
      if (token) {
        await api.post("/auth/verify-firebase", { id_token: token });
      }
      await syncFromBackend();
      toast({ variant: "success", title: "Welcome to Zipra!" });
      router.push(redirect);
    } catch (err) {
      if (err.message !== "Popup closed" && err.message !== "Sign-in popup was closed.") {
        toast({ variant: "error", title: "Sign-in failed", description: err.message });
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
          <div className="mt-6">
            <WeatherWidget />
          </div>
        </div>

        <div className="animate-slide-up space-y-4">
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
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="font-medium text-[#FF7A00] underline underline-offset-2">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium text-[#FF7A00] underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
