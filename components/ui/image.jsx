import * as React from "react";
import NextImage from "next/image";
import { cn } from "@/lib/utils";

export function Image({
  src,
  alt = "",
  className,
  imgClassName,
  ratio = "1/1",
  fallbackIcon: FallbackIcon,
}) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  return (
    <div
      className={cn("relative overflow-hidden bg-muted", className)}
      style={{ aspectRatio: ratio }}
    >
      {!loaded && !error && (
        <div className="absolute inset-0 animate-shimmer bg-muted" />
      )}
      {error ? (
        <div className="flex h-full w-full items-center justify-center bg-primary-soft text-primary-soft-foreground">
          {FallbackIcon ? (
            <FallbackIcon className="h-8 w-8" />
          ) : (
            <span className="text-xs font-medium">No image</span>
          )}
        </div>
      ) : (
        <NextImage
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={cn(
            "object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}
