import * as React from "react";
import Link from "next/link";
import NextImage from "next/image";
import { cn } from "@/lib/utils";

export function CategoryCard({ category, className }) {
  const hasImage = category.image && !category.image.startsWith("data:");
  return (
    <Link
      href={`/search?category=${category.id}`}
      className={cn(
        "group flex w-[4.5rem] shrink-0 flex-col items-center gap-2 rounded-2xl p-1 text-center transition-transform active:scale-95",
        className
      )}
    >
      <span
        className={cn(
          "relative flex h-[4.25rem] w-[4.25rem] items-center justify-center overflow-hidden rounded-2xl text-2xl shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md",
          category.color || "bg-primary-soft"
        )}
      >
        {hasImage ? (
          <NextImage src={category.image} alt={category.name} fill className="object-cover" />
        ) : (
          category.emoji || "🛒"
        )}
      </span>
      <span className="line-clamp-1 text-xs font-semibold text-foreground">
        {category.name}
      </span>
    </Link>
  );
}
