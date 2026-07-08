import * as React from "react";
import { cn } from "@/lib/utils";

export function Logo({ className, variant = "default", showWordmark = true }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight",
        className
      )}
      aria-label="Zipra"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF9A3D] to-[#F26400] shadow-sm">
        <svg viewBox="0 0 48 48" className="h-5 w-5" fill="none" aria-hidden>
          <path
            d="M24 8c8.8 0 16 6.3 16 14.1 0 8-7.2 14.6-16 19.9C15.2 36.7 8 30.1 8 22.1 8 14.3 15.2 8 24 8Z"
            fill="#fff"
          />
          <path
            d="M17 18.5h14L18.5 27h12.5v3.2H17L25.5 20.7H17V18.5Z"
            fill="#FF7A00"
          />
        </svg>
      </span>
      {showWordmark && (
        <span className={variant === "white" ? "text-white" : "text-foreground"}>
          Zip<span className="text-[#FF7A00]">ra</span>
        </span>
      )}
    </span>
  );
}
