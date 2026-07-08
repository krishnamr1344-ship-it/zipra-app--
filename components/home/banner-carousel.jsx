"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function BannerCarousel({ banners, className }) {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (paused || banners.length <= 1) return;
    const t = setInterval(
      () => setIndex((i) => (i + 1) % banners.length),
      4000
    );
    return () => clearInterval(t);
  }, [paused, banners.length]);

  const go = (dir) =>
    setIndex((i) => (i + dir + banners.length) % banners.length);

  return (
    <div
      className={cn("relative overflow-hidden rounded-3xl shadow-md", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((b) => (
        <Link
          key={b.id}
          href={b.href}
          className={cn(
            "relative flex h-44 w-full shrink-0 items-center justify-between overflow-hidden bg-gradient-to-r p-6 sm:h-52",
            b.gradient
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_55%)]" />
          <div className="relative max-w-[60%] text-white">
            <h3 className="font-display text-xl font-bold leading-tight drop-shadow sm:text-2xl">
              {b.title}
            </h3>
            <p className="mt-1 text-sm text-white/90">{b.subtitle}</p>
            <span className="mt-3 inline-block rounded-full bg-white px-4 py-1.5 text-sm font-bold text-[#FF7A00] shadow transition active:scale-95">
              {b.cta} →
            </span>
          </div>
          <span className="relative text-6xl drop-shadow-lg sm:text-7xl">{b.emoji}</span>
        </Link>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button
            aria-label="Previous"
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur transition hover:bg-white/50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="Next"
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur transition hover:bg-white/50"
          >
            <ChevronLeft className="h-5 w-5 rotate-180" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
