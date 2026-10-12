import Image from "next/image";
import { cn } from "@/lib/utils";

function GridTileImage({
  isInteractive = true,
  active,
  label,
  ...props
}: {
  isInteractive?: boolean;
  active?: boolean;
  label?: {
    title: string;
    amount: string;
    currencyCode: string;
    position?: "bottom" | "center";
  };
} & React.ComponentProps<typeof Image>) {
  return (
    <div
      className={cn(
        "group relative flex aspect-square size-full items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl border bg-card transition-all duration-300 hover:border-emerald-500/50 hover:shadow-md",
        {
          "border-2 border-emerald-600": active,
          "border-border/70": !active,
        },
      )}
    >
      {props.src ? (
        <Image
          className={cn(
            "relative size-full object-cover transition duration-500 ease-out group-hover:scale-105",
            {
              "transition duration-300 ease-in-out group-hover:scale-105":
                isInteractive,
            },
          )}
          {...props}
        />
      ) : null}
      {label ? (
        <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 z-10 flex items-center justify-between gap-1.5 rounded-lg sm:rounded-xl border border-border/70 bg-background/85 p-1.5 sm:p-2 backdrop-blur-md transition-colors group-hover:border-emerald-500/40">
          <h3 className="line-clamp-1 text-[11px] sm:text-xs font-semibold text-foreground">
            {label.title}
          </h3>
          <span className="shrink-0 rounded-md bg-emerald-600 px-1.5 py-0.5 sm:px-2 text-[10px] sm:text-xs font-bold text-white shadow-xs">
            ৳{label.amount}
          </span>
        </div>
      ) : null}
    </div>
  );
}
