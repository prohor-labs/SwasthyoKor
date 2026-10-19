"use client";

import { X } from "@/components/icons";
import { Spinner } from "@/components/ui/spinner";
import { useCart } from "@/hooks/use-cart";
import type { CartItem } from "@/lib/types";

export function DeleteItemButton({ item }: { item: CartItem }) {
  const { updateCartItem } = useCart();

  return (
    <button
      type="button"
      onClick={() => {
        updateCartItem.mutate({
          merchandiseId: item.merchandise.id,
          type: "delete",
        });
      }}
      disabled={updateCartItem.isPending}
      aria-label="পণ্যটি মুছে ফেলুন"
      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
    >
      {updateCartItem.isPending ? (
        <Spinner className="size-3 text-current" />
      ) : (
        <X className="size-4" />
      )}
    </button>
  );
}
