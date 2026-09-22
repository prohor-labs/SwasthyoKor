"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import {
  addItem,
  getCartFromCookie,
  removeItem,
  updateItemQuantity,
} from "@/lib/actions/cart";
import { MESSAGES } from "@/lib/messages";
import type { Cart, CartItem, Product, ProductVariant } from "@/lib/types";

type UpdateType = "plus" | "minus" | "delete";

type CartAction =
  | {
      type: "UPDATE_ITEM";
      payload: { merchandiseId: string; updateType: UpdateType };
    }
  | {
      type: "ADD_ITEM";
      payload: { variant: ProductVariant; product: Product };
    };

const CART_KEY = ["cart"] as const;

function calculateItemCost(quantity: number, price: string): string {
  return (Number(price) * quantity).toString();
}

function updateCartItem(
  item: CartItem,
  updateType: UpdateType,
): CartItem | null {
  if (updateType === "delete") return null;

  const newQuantity =
    updateType === "plus" ? item.quantity + 1 : item.quantity - 1;
  if (newQuantity === 0) return null;

  const singleItemAmount = Number(item.cost.totalAmount.amount) / item.quantity;
  const newTotalAmount = calculateItemCost(
    newQuantity,
    singleItemAmount.toString(),
  );

  return {
    ...item,
    quantity: newQuantity,
    cost: {
      ...item.cost,
      totalAmount: {
        ...item.cost.totalAmount,
        amount: newTotalAmount,
      },
    },
  };
}

function createOrUpdateCartItem(
  existingItem: CartItem | undefined,
  variant: ProductVariant,
  product: Product,
): CartItem {
  const quantity = existingItem ? existingItem.quantity + 1 : 1;
  const totalAmount = calculateItemCost(quantity, variant.price.amount);

  return {
    id: existingItem?.id ?? "",
    quantity,
    cost: {
      totalAmount: {
        amount: totalAmount,
        currencyCode: variant.price.currencyCode,
      },
    },
    merchandise: {
      id: variant.id,
      title: variant.title,
      selectedOptions: variant.selectedOptions,
      product: {
        id: product.id,
        handle: product.handle,
        title: product.title,
        featuredImage: product.featuredImage,
      },
    },
  };
}

function updateCartTotals(
  lines: CartItem[],
): Pick<Cart, "totalQuantity" | "cost"> {
  const totalQuantity = lines.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = lines.reduce(
    (sum, item) => sum + Number(item.cost.totalAmount.amount),
    0,
  );
  const currencyCode = lines[0]?.cost.totalAmount.currencyCode ?? "USD";

  return {
    totalQuantity,
    cost: {
      subtotalAmount: { amount: totalAmount.toString(), currencyCode },
      totalAmount: { amount: totalAmount.toString(), currencyCode },
      totalTaxAmount: { amount: "0", currencyCode },
    },
  };
}

function createEmptyCart(): Cart {
  return {
    id: "",
    totalQuantity: 0,
    lines: [],
    cost: {
      subtotalAmount: { amount: "0", currencyCode: "USD" },
      totalAmount: { amount: "0", currencyCode: "USD" },
      totalTaxAmount: { amount: "0", currencyCode: "USD" },
    },
  };
}

function cartReducer(state: Cart | undefined, action: CartAction): Cart {
  const currentCart = state || createEmptyCart();

  switch (action.type) {
    case "UPDATE_ITEM": {
      const { merchandiseId, updateType } = action.payload;
      const updatedLines = currentCart.lines
        .map((item) =>
          item.merchandise.id === merchandiseId
            ? updateCartItem(item, updateType)
            : item,
        )
        .filter(Boolean) as CartItem[];

      if (updatedLines.length === 0) {
        return {
          ...currentCart,
          lines: [],
          totalQuantity: 0,
          cost: {
            ...currentCart.cost,
            totalAmount: { ...currentCart.cost.totalAmount, amount: "0" },
          },
        };
      }

      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines,
      };
    }
    case "ADD_ITEM": {
      const { variant, product } = action.payload;
      const existingItem = currentCart.lines.find(
        (item) => item.merchandise.id === variant.id,
      );
      const updatedItem = createOrUpdateCartItem(
        existingItem,
        variant,
        product,
      );

      const updatedLines = existingItem
        ? currentCart.lines.map((item) =>
            item.merchandise.id === variant.id ? updatedItem : item,
          )
        : [...currentCart.lines, updatedItem];

      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines,
      };
    }
    default:
      return currentCart;
  }
}

export function useCart() {
  const queryClient = useQueryClient();

  const { data: cart, isPending: isLoading } = useQuery({
    queryKey: CART_KEY,
    queryFn: getCartFromCookie,
  });

  const invalidateCart = () =>
    queryClient.invalidateQueries({ queryKey: CART_KEY });

  const addCartItem = useMutation({
    mutationFn: ({ variant }: { variant: ProductVariant; product: Product }) =>
      addItem(variant.id, 1),
    onMutate: async ({ variant, product }) => {
      await queryClient.cancelQueries({ queryKey: CART_KEY });
      const previous = queryClient.getQueryData<Cart>(CART_KEY);
      queryClient.setQueryData<Cart>(CART_KEY, (current) =>
        cartReducer(current, {
          type: "ADD_ITEM",
          payload: { variant, product },
        }),
      );
      return { previous };
    },
    onSuccess: () => {
      toast.add({
        type: "success",
        title: MESSAGES.cart.addedSuccess,
      });
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CART_KEY, context.previous);
      }
      toast.add({
        type: "error",
        title: MESSAGES.cart.addError,
      });
    },
    onSettled: () => invalidateCart(),
  });

  const updateCartItemMutation = useMutation({
    mutationFn: ({
      merchandiseId,
      type,
    }: {
      merchandiseId: string;
      type: UpdateType;
    }) =>
      type === "delete"
        ? removeItem(merchandiseId)
        : updateItemQuantity(merchandiseId, type),
    onMutate: async ({ merchandiseId, type }) => {
      await queryClient.cancelQueries({ queryKey: CART_KEY });
      const previous = queryClient.getQueryData<Cart>(CART_KEY);
      queryClient.setQueryData<Cart>(CART_KEY, (current) =>
        cartReducer(current, {
          type: "UPDATE_ITEM",
          payload: { merchandiseId, updateType: type },
        }),
      );
      return { previous };
    },
    onSuccess: (_data, variables) => {
      if (variables.type === "delete") {
        toast.add({
          type: "info",
          title: MESSAGES.cart.deleteSuccess,
        });
      }
    },
    onError: (_error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CART_KEY, context.previous);
      }
      toast.add({
        type: "error",
        title:
          variables.type === "delete"
            ? MESSAGES.cart.deleteError
            : MESSAGES.cart.updateError,
      });
    },
    onSettled: () => invalidateCart(),
  });

  return {
    cart,
    isLoading,
    isMutating: addCartItem.isPending || updateCartItemMutation.isPending,
    addCartItem,
    updateCartItem: updateCartItemMutation,
  };
}
