"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { BagShopping, X } from "@/components/icons";
import Price from "@/components/price";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { useCart } from "@/hooks/use-cart";
import { checkout } from "@/lib/actions/checkout";
import { DEFAULT_OPTION } from "@/lib/constants";
import { createUrl } from "@/lib/utils";
import { DeleteItemButton } from "./DeleteItemButton";
import { EditItemQuantityButton } from "./EditItemQuantityButton";
import OpenCart from "./OpenCart";

export function CartModal() {
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const quantityRef = useRef(cart?.totalQuantity);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  useEffect(() => {
    if (
      cart?.totalQuantity &&
      cart?.totalQuantity !== quantityRef.current &&
      cart?.totalQuantity > 0
    ) {
      if (!isOpen) {
        setIsOpen(true);
      }
      quantityRef.current = cart?.totalQuantity;
    }
  }, [isOpen, cart?.totalQuantity]);

  return (
    <>
      <button type="button" aria-label="কার্ট খুলুন" onClick={openCart}>
        <OpenCart quantity={cart?.totalQuantity} />
      </button>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="flex h-full w-full max-w-md flex-col justify-between bg-white/95 p-3.5 sm:p-6 text-black backdrop-blur-xl dark:bg-neutral-950/95 dark:text-white"
        >
          <div className="flex items-center justify-between border-b border-border/80 pb-3 sm:pb-4">
            <div className="flex items-center gap-2">
              <BagShopping className="size-5 text-emerald-600 dark:text-emerald-400" />
              <SheetTitle className="text-base font-bold text-foreground">
                আমার শপিং ব্যাগ
              </SheetTitle>
            </div>
            <button
              type="button"
              aria-label="কার্ট বন্ধ করুন"
              onClick={closeCart}
              className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
          <SheetDescription className="sr-only">
            আপনার কার্টের পণ্যসমূহ দেখুন এবং অর্ডার সম্পন্ন করুন।
          </SheetDescription>

          {!cart || cart.lines.length === 0 ? (
            <div className="flex size-full flex-col items-center justify-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900">
                <BagShopping className="size-8 text-neutral-400" />
              </div>
              <p className="text-xl font-semibold">আপনার কার্ট খালি</p>
              <p className="text-sm text-neutral-500">
                খাঁটি ও প্রাকৃতিক পণ্য সংগ্রহ করতে শপিং শুরু করুন।
              </p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col justify-between overflow-hidden">
              <ul className="flex-1 overflow-y-auto divide-y divide-border/60 py-1 sm:py-2">
                {cart.lines
                  .sort((a, b) =>
                    a.merchandise.product.title.localeCompare(
                      b.merchandise.product.title,
                    ),
                  )
                  .map((item, i) => {
                    const merchandiseSearchParams: Record<string, string> = {};

                    item.merchandise.selectedOptions.forEach(
                      ({ name, value }) => {
                        if (value !== DEFAULT_OPTION) {
                          merchandiseSearchParams[name.toLowerCase()] = value;
                        }
                      },
                    );

                    const merchandiseUrl = createUrl(
                      `/product/${item.merchandise.product.handle}`,
                      new URLSearchParams(merchandiseSearchParams),
                    );

                    return (
                      <li
                        key={`${item.merchandise.id}-${i}`}
                        className="py-2.5 sm:py-4"
                      >
                        <div className="relative flex items-center justify-between gap-2.5 sm:gap-3">
                          <div className="flex flex-1 items-center gap-2.5 sm:gap-3 min-w-0">
                            <div className="relative size-14 sm:size-16 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-neutral-100 dark:bg-neutral-900">
                              {item.merchandise.product.featuredImage ? (
                                <Image
                                  className="size-full object-cover"
                                  width={64}
                                  height={64}
                                  alt={
                                    item.merchandise.product.featuredImage
                                      .altText || item.merchandise.product.title
                                  }
                                  src={
                                    item.merchandise.product.featuredImage.url
                                  }
                                />
                              ) : null}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <Link
                                href={merchandiseUrl}
                                onClick={closeCart}
                                className="text-xs sm:text-sm font-semibold text-foreground hover:text-emerald-600 transition-colors line-clamp-1"
                              >
                                {item.merchandise.product.title}
                              </Link>
                              {item.merchandise.title !== DEFAULT_OPTION ? (
                                <span className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                                  {item.merchandise.title}
                                </span>
                              ) : null}
                              <div className="mt-0.5 sm:mt-1">
                                <Price
                                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400"
                                  amount={item.cost.totalAmount.amount}
                                  currencyCode={
                                    item.cost.totalAmount.currencyCode
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                            <div className="flex h-7 sm:h-8 items-center rounded-lg border border-border bg-muted/40">
                              <EditItemQuantityButton
                                item={item}
                                type="minus"
                              />
                              <span className="w-5 text-center text-xs font-bold">
                                {item.quantity}
                              </span>
                              <EditItemQuantityButton item={item} type="plus" />
                            </div>

                            <DeleteItemButton item={item} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
              </ul>

              <div className="border-t border-border pt-3 sm:pt-4 text-sm bg-background/50">
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-muted-foreground text-xs">
                    <p>ভ্যাট ও ট্যাক্স</p>
                    <Price
                      className="font-medium text-foreground"
                      amount={cart.cost.totalTaxAmount.amount}
                      currencyCode={cart.cost.totalTaxAmount.currencyCode}
                    />
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground text-xs">
                    <p>শিপিং চার্জ</p>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ফ্রি
                    </span>
                  </div>
                </div>

                <Separator className="my-2" />

                <div className="my-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">
                    সর্বমোট
                  </span>
                  <Price
                    className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400"
                    amount={cart.cost.totalAmount.amount}
                    currencyCode={cart.cost.totalAmount.currencyCode}
                  />
                </div>

                <form action={checkout}>
                  <CheckoutButton
                    totalAmount={cart.cost.totalAmount.amount}
                    currencyCode={cart.cost.totalAmount.currencyCode}
                  />
                </form>

                <p className="text-[11px] text-center text-muted-foreground mt-2.5">
                  🔒 ১০০% নিরাপদ অনলাইন পেমেন্ট (বিকাশ / নগদ / কার্ড)
                </p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function CheckoutButton({
  totalAmount,
}: {
  totalAmount: string;
  currencyCode?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 p-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-xs"
      type="submit"
      disabled={pending}
    >
      {pending ? (
        <Spinner className="size-4 text-white" />
      ) : (
        <>
          <BagShopping className="size-4" />
          <span>অর্ডার সম্পন্ন করুন</span>
          <span className="ml-auto font-mono">
            ৳{parseFloat(totalAmount).toLocaleString("bn-BD")}
          </span>
        </>
      )}
    </button>
  );
}
