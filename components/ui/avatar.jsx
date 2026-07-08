import * as React from "react";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef(
  ({ className, src, alt, fallback, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- avatar src is an arbitrary remote (Firebase/Google) URL
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
          {fallback}
        </span>
      )}
    </span>
  )
);
Avatar.displayName = "Avatar";

export { Avatar };
