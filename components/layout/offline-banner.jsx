"use client";

import * as React from "react";
import { WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function OfflineBanner() {
  const [offline, setOffline] = React.useState(false);

  React.useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      className={cn(
        "sticky top-0 z-50 flex items-center justify-center gap-2 bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground"
      )}
    >
      <WifiOff className="h-4 w-4" />
      You are offline. Some features may be unavailable.
    </div>
  );
}
