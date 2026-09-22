"use client";

import type { ProductOption, ProductVariant } from "@/lib/types";
import { cn } from "@/lib/utils";

type Combination = {
  id: string;
  availableForSale: boolean;
  [key: string]: string | boolean;
};

export function VariantSelector({
  options,
  variants,
  selectedOptions,
  onOptionSelect,
}: {
  options: ProductOption[];
  variants: ProductVariant[];
  selectedOptions: Record<string, string>;
  onOptionSelect: (optionName: string, value: string) => void;
}) {
  // If no variants or options, hide selector
  if (variants.length === 0 && options.length === 0) {
    return null;
  }

  const combinations: Combination[] = variants.map((variant) => {
    const selectedOptionsMap: Record<string, string> = {};
    for (const option of variant.selectedOptions) {
      selectedOptionsMap[option.name.toLowerCase()] = option.value;
    }

    return {
      id: variant.id,
      availableForSale:
        variant.availableForSale && (variant.inventoryQuantity ?? 15) > 0,
      price: variant.price.amount,
      ...selectedOptionsMap,
    };
  });

  // If options array is present
  if (options.length > 0) {
    return options.map((option) => {
      const selectedVal = selectedOptions[option.name.toLowerCase()];
      return (
        <dl className="mb-4" key={option.id}>
          <dt className="mb-2 text-xs font-bold text-foreground flex items-center justify-between">
            <span>
              প্যাক সাইজ / ওজন:{" "}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {selectedVal}
              </span>
            </span>
            <span className="text-[11px] font-normal text-muted-foreground">
              অরিজিনাল সিল প্যাক
            </span>
          </dt>
          <dd className="flex flex-wrap gap-2.5">
            {option.values.map((value) => {
              const optionNameLowerCase = (option.name || "পরিমাণ").toLowerCase();

              const currentCombination = {
                ...selectedOptions,
                [optionNameLowerCase]: value,
              };

              const matchedVariant = variants.find((v) =>
                v.selectedOptions.some((o) => o.value === value),
              );

              const isAvailableForSale = combinations.some((combination) =>
                Object.entries(currentCombination).every(
                  ([key, val]) =>
                    combination[key] === val && combination.availableForSale,
                ),
              );

              const isActive = selectedOptions[optionNameLowerCase] === value;
              const priceNum = matchedVariant
                ? Number(matchedVariant.price.amount)
                : null;

              return (
                <button
                  type="button"
                  key={value}
                  aria-disabled={!isAvailableForSale}
                  disabled={!isAvailableForSale}
                  onClick={() => onOptionSelect(optionNameLowerCase, value)}
                  title={`${option.name} ${value}${
                    !isAvailableForSale ? " (স্টক শেষ)" : ""
                  }`}
                  className={cn(
                    "flex min-w-[60px] items-center gap-1.5 justify-center rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer",
                    {
                      "border-emerald-600 bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/20 font-bold":
                        isActive,
                      "border-border bg-card hover:border-emerald-500/50 hover:bg-muted text-foreground":
                        !isActive && isAvailableForSale,
                      "relative z-10 cursor-not-allowed opacity-40 bg-muted text-muted-foreground border-dashed":
                        !isAvailableForSale,
                    },
                  )}
                >
                  {isActive && (
                    <span className="size-1.5 rounded-full bg-white animate-pulse" />
                  )}
                  <span>{value}</span>
                  {priceNum && !isActive && (
                    <span className="text-[10px] text-muted-foreground font-mono ml-0.5">
                      (৳{priceNum.toLocaleString("bn-BD")})
                    </span>
                  )}
                </button>
              );
            })}
          </dd>
        </dl>
      );
    });
  }

  // Fallback: if options is empty but variants > 1
  return (
    <dl className="mb-4">
      <dt className="mb-2 text-xs font-bold text-foreground flex items-center justify-between">
        <span>প্যাকেজিং / ইউনিট নির্বাচন করুন</span>
        <span className="text-[11px] font-normal text-muted-foreground">
          অরিজিনাল সিল প্যাক
        </span>
      </dt>
      <dd className="flex flex-wrap gap-2.5">
        {variants.map((v) => {
          const isAvailable =
            v.availableForSale && (v.inventoryQuantity ?? 15) > 0;
          const isActive =
            selectedOptions["পরিমাণ"] === v.title ||
            (!selectedOptions["পরিমাণ"] && variants[0]?.id === v.id);

          return (
            <button
              type="button"
              key={v.id}
              disabled={!isAvailable}
              onClick={() => onOptionSelect("পরিমাণ", v.title)}
              className={cn(
                "flex items-center gap-1.5 justify-center rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer",
                {
                  "border-emerald-600 bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/20 font-bold":
                    isActive,
                  "border-border bg-card hover:border-emerald-500/50 hover:bg-muted text-foreground":
                    !isActive && isAvailable,
                  "cursor-not-allowed opacity-40 bg-muted text-muted-foreground border-dashed":
                    !isAvailable,
                },
              )}
            >
              {isActive && (
                <span className="size-1.5 rounded-full bg-white animate-pulse" />
              )}
              <span>{v.title}</span>
              {!isActive && (
                <span className="text-[10px] text-muted-foreground font-mono ml-0.5">
                  (৳{Number(v.price.amount).toLocaleString("bn-BD")})
                </span>
              )}
            </button>
          );
        })}
      </dd>
    </dl>
  );
}
