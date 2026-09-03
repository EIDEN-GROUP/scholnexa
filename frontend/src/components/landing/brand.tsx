import { cn } from "@/lib/utils";

/** Full horizontal lockup: never recolored, never stretched (brand book, p. Logo). */
export function EssorLockup({ className }: { className?: string }) {
  return (
    <img
      src="/brand/essor-logo.png"
      alt="Essor"
      width={1338}
      height={327}
      className={cn("h-7 w-auto select-none", className)}
    />
  );
}

/** Symbol only: three petals + coral dot. Minimum 24px in digital. */
export function EssorMark({ className }: { className?: string }) {
  return (
    <img
      src="/brand/essor-mark.png"
      alt=""
      aria-hidden
      width={347}
      height={323}
      className={cn("h-7 w-auto select-none", className)}
    />
  );
}

export function Overline({
  children,
  tone = "blue",
  className,
}: {
  children: React.ReactNode;
  tone?: "blue" | "sky" | "coral" | "muted";
  className?: string;
}) {
  const tones = {
    blue: "text-blue",
    sky: "text-sky",
    coral: "text-coral",
    muted: "text-muted-foreground",
  } as const;
  return <p className={cn("overline", tones[tone], className)}>{children}</p>;
}
