"use client";

import * as React from "react";
import { MapPin } from "lucide-react";
import { useStore } from "@/store/useStore";
import { getWeather, DEFAULT_LOCATION } from "@/services/weather";
import { Skeleton } from "@/components/ui/skeleton";

export function WeatherWidget() {
  const currentLocation = useStore((s) => s.currentLocation);
  const deliveryAddress = useStore((s) => s.deliveryAddress);

  const [weather, setWeather] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const lat =
    currentLocation?.lat ??
    deliveryAddress?.latitude ??
    DEFAULT_LOCATION.lat;
  const lng =
    currentLocation?.lng ??
    deliveryAddress?.longitude ??
    DEFAULT_LOCATION.lng;

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    getWeather(lat, lng)
      .then((w) => {
        if (active) setWeather(w);
      })
      .catch(() => {
        if (active) setWeather(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [lat, lng]);

  if (loading) {
    return <Skeleton className="h-9 w-32 rounded-full" />;
  }

  if (!weather) return null;

  return (
    <div className="flex items-center gap-2 rounded-full bg-muted/60 px-3 py-1.5 text-sm">
      <span className="text-lg leading-none">{weather.emoji}</span>
      <span className="font-semibold">{weather.temperature}°C</span>
      <span className="hidden text-xs text-muted-foreground sm:inline">
        {weather.label}
      </span>
      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
  );
}
