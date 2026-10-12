import { BagShopping } from "@/components/icons";
import { cn } from "@/lib/utils";

export default function OpenCart({
  className,
  quantity,
}: {
  className?: string;
  quantity?: number;
}) {
  return (
    <div className="relative flex size-9 sm:size-10 md:size-11 items-center justify-center rounded-lg border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800">
      <BagShopping
        className={cn(
          "size-4 sm:size-5 transition-all ease-in-out hover:scale-110",
          className,
        )}
      />

      {quantity ? (
        <div className="absolute right-0 top-0 -mr-2 -mt-2 size-5 rounded-full bg-emerald-600 text-[11px] font-bold text-white flex items-center justify-center">
          {quantity}
        </div>
      ) : null}
    </div>
  );
}
