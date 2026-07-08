"use client";

import * as React from "react";
import { RefreshCw, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

const THRESHOLD = 72;

export function PullToRefresh({ onRefresh, children, className }) {
  const startY = React.useRef(0);
  const [pull, setPull] = React.useState(0);
  const [refreshing, setRefreshing] = React.useState(false);

  const onTouchStart = (e) => {
    if (refreshing) return;
    if (window.scrollY <= 0) startY.current = e.touches[0].clientY;
    else startY.current = 0;
  };
  const onTouchMove = (e) => {
    if (!startY.current || refreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0 && window.scrollY <= 0) {
      setPull(Math.min(dy * 0.5, THRESHOLD + 24));
    }
  };
  const onTouchEnd = async () => {
    if (pull >= THRESHOLD) {
      setRefreshing(true);
      setPull(THRESHOLD);
      try {
        await onRefresh?.();
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    } else {
      setPull(0);
    }
    startY.current = 0;
  };

  return (
    <div
      className={cn(className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center justify-center text-[#FF7A00]"
        style={{ height: refreshing ? THRESHOLD : pull }}
      >
        {refreshing ? (
          <RefreshCw className="h-5 w-5 animate-spin" />
        ) : (
          <ArrowDown
            className={cn("h-5 w-5 transition-transform", pull >= THRESHOLD && "rotate-180")}
          />
        )}
      </div>
      {children}
    </div>
  );
}
