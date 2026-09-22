"use client";

import { useState, useTransition } from "react";
import { Add, Edit, Trash2 } from "@/components/icons";
import { ResponsiveDialog } from "@/components/shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { updateProductAction } from "@/lib/actions/admin";
import { compressImageClient } from "@/lib/image";
import {
  PRODUCT_UNITS,
  formatPackTitle,
  getDefaultAmountForUnit,
  getProductUnitCategory,
  getProductUnitLabel,
  parseAmountFromTitle,
  type ProductUnit,
} from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ProductVariantItem {
  id?: string;
  title: string;
  amount?: number;
  price: string;
  compareAtPrice?: string;
  inventoryQuantity: number;
  unit: ProductUnit;
}

export interface EditProductItem {
  id: string;
  title: string;
  handle: string;
  price: string;
  compareAtPrice?: string;
  inventoryQuantity?: number;
  unit?: string;
  description?: string;
  collectionId?: string;
  imageUrl?: string;
  available: boolean;
  variants?: ProductVariantItem[];
}

export function EditProductDialog({
  product,
  collections,
}: {
  product: EditProductItem;
  collections: { id: string; title: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const initialRootUnit: ProductUnit =
    (product.unit as ProductUnit) && PRODUCT_UNITS.includes(product.unit as ProductUnit)
      ? (product.unit as ProductUnit)
      : "jar";

  const [rootUnit, setRootUnit] = useState<ProductUnit>(initialRootUnit);

  const getAutoPackStock = (amt: number | undefined, stock: number) => {
    if (!amt || amt <= 0 || stock <= 0) return 0;
    return Math.floor(stock / amt);
  };

  const getInitialTotalStock = (initialUnit: ProductUnit): number => {
    if (product.inventoryQuantity && product.inventoryQuantity > 0) {
      return product.inventoryQuantity;
    }
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((acc, v) => {
        const amt =
          v.amount !== undefined && v.amount !== null
            ? v.amount
            : parseAmountFromTitle(v.title, initialUnit);
        return Math.max(acc, (v.inventoryQuantity || 0) * (amt || 1));
      }, 0) || 100;
    }
    return 100;
  };

  const [totalStock, setTotalStock] = useState<number>(() =>
    getInitialTotalStock(initialRootUnit),
  );
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(
    product.collectionId || "",
  );
  const [availableForSale, setAvailableForSale] = useState<string>(
    product.available ? "true" : "false",
  );

  const getInitialVariants = (unitToUse: ProductUnit, stock: number): ProductVariantItem[] => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.map((v) => {
        const amt =
          v.amount !== undefined && v.amount !== null
            ? v.amount
            : parseAmountFromTitle(v.title, unitToUse);
        return {
          id: v.id,
          title: v.title || formatPackTitle(amt, unitToUse),
          amount: amt,
          price: v.price || "0",
          compareAtPrice: v.compareAtPrice || "",
          inventoryQuantity: getAutoPackStock(amt, stock),
          unit: unitToUse,
        };
      });
    }
    const defaultAmt = getDefaultAmountForUnit(unitToUse);
    return [
      {
        title: formatPackTitle(defaultAmt, unitToUse),
        amount: defaultAmt,
        price: product.price || "0",
        compareAtPrice: product.compareAtPrice || "",
        inventoryQuantity: getAutoPackStock(defaultAmt, stock),
        unit: unitToUse,
      },
    ];
  };

  const [variants, setVariants] = useState<ProductVariantItem[]>(() =>
    getInitialVariants(initialRootUnit, getInitialTotalStock(initialRootUnit)),
  );

  // Sync state if product changes or dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      const u =
        (product.unit as ProductUnit) && PRODUCT_UNITS.includes(product.unit as ProductUnit)
          ? (product.unit as ProductUnit)
          : "jar";
      setRootUnit(u);
      const stock = getInitialTotalStock(u);
      setTotalStock(stock);
      setSelectedCollectionId(product.collectionId || "");
      setAvailableForSale(product.available ? "true" : "false");
      setVariants(getInitialVariants(u, stock));
      setError(null);
    }
  };

  const handleTotalStockChange = (newStock: number) => {
    const validStock = Math.max(0, newStock);
    setTotalStock(validStock);
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        inventoryQuantity: getAutoPackStock(v.amount, validStock),
      })),
    );
  };

  // When root unit changes, update all variants with new unit and auto-regenerated titles
  const handleRootUnitChange = (newUnit: ProductUnit) => {
    setRootUnit(newUnit);
    setVariants((prev) =>
      prev.map((v) => {
        const amt = v.amount && v.amount > 0 ? v.amount : getDefaultAmountForUnit(newUnit);
        return {
          ...v,
          unit: newUnit,
          amount: amt,
          title: formatPackTitle(amt, newUnit),
          inventoryQuantity: getAutoPackStock(amt, totalStock),
        };
      }),
    );
  };

  const handleAddVariant = (customAmount?: number) => {
    const amt =
      customAmount !== undefined
        ? customAmount
        : variants.length > 0
          ? (variants[variants.length - 1].amount || 1) + 1
          : getDefaultAmountForUnit(rootUnit);

    const lastVar = variants[variants.length - 1];
    setVariants((prev) => [
      ...prev,
      {
        title: formatPackTitle(amt, rootUnit),
        amount: amt,
        price: lastVar ? lastVar.price : "0",
        compareAtPrice: lastVar?.compareAtPrice || "",
        inventoryQuantity: getAutoPackStock(amt, totalStock),
        unit: rootUnit,
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantAmountChange = (index: number, newAmountStr: string) => {
    const num = parseFloat(newAmountStr) || 0;
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== index) return v;
        return {
          ...v,
          amount: num,
          title: num > 0 ? formatPackTitle(num, rootUnit) : v.title,
          inventoryQuantity: getAutoPackStock(num, totalStock),
        };
      }),
    );
  };

  const handleVariantFieldChange = (
    index: number,
    field: keyof ProductVariantItem,
    value: any,
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    );
  };

  const unitCategory = getProductUnitCategory(rootUnit);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    formData.append("id", product.id);

    // Prepare variants with guaranteed titles and units
    const formattedVariants = variants.map((v) => ({
      ...v,
      unit: rootUnit,
      title:
        v.title.trim() ||
        (v.amount ? formatPackTitle(v.amount, rootUnit) : "স্ট্যান্ডার্ড"),
      inventoryQuantity: getAutoPackStock(v.amount, totalStock),
    }));

    formData.append("variants", JSON.stringify(formattedVariants));
    formData.set("unit", rootUnit);
    formData.set("collectionId", selectedCollectionId);
    formData.set("availableForSale", availableForSale);

    if (formattedVariants.length > 0) {
      formData.set("price", formattedVariants[0].price);
      if (formattedVariants[0].compareAtPrice) {
        formData.set("compareAtPrice", formattedVariants[0].compareAtPrice);
      }
      formData.set("inventoryQuantity", String(totalStock));
    }

    // Compress client-side to WebP if image file is selected
    const imageFile = formData.get("image") as File | null;
    if (
      imageFile &&
      imageFile.size > 0 &&
      imageFile.type.startsWith("image/")
    ) {
      const compressedWebpFile = await compressImageClient(imageFile);
      formData.set("image", compressedWebpFile);
    }

    startTransition(async () => {
      const res = await updateProductAction(formData);
      if (res.success) {
        setOpen(false);
      } else {
        setError(res.error || "পণ্য আপডেট করতে সমস্যা হয়েছে।");
      }
    });
  };


  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="পণ্য সম্পাদনা করুন"
      description="পণ্যের নাম, মূল ইউনিট, ক্যাটাগরি এবং বিভিন্ন প্যাক সাইজের পরিমাণ ও মূল্য পরিবর্তন করুন।"
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className="text-foreground hover:bg-muted cursor-pointer rounded-xl"
          title="সম্পাদনা করুন"
        >
          <Edit className="size-4" />
        </Button>
      }
    >
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
        <FieldGroup className="gap-3 sm:gap-4">
          <Field>
            <FieldLabel
              htmlFor={`prod-title-${product.id}`}
              className="text-xs sm:text-sm font-semibold text-foreground/90"
            >
              পণ্যের নাম *
            </FieldLabel>
            <Input
              id={`prod-title-${product.id}`}
              name="title"
              defaultValue={product.title}
              required
              className="h-10 text-xs sm:text-sm px-3 rounded-lg sm:rounded-xl"
            />
          </Field>

          <Field>
            <FieldLabel
              htmlFor={`prod-handle-${product.id}`}
              className="text-xs sm:text-sm font-semibold text-foreground/90"
            >
              হ্যান্ডেল (URL Slug) *
            </FieldLabel>
            <Input
              id={`prod-handle-${product.id}`}
              name="handle"
              defaultValue={product.handle}
              required
              className="h-10 text-xs sm:text-sm px-3 rounded-lg sm:rounded-xl font-mono"
            />
          </Field>

          {/* ──── Root Unit, Category, Total Stock & Availability ──── */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <Field>
              <FieldLabel
                htmlFor={`prod-unit-${product.id}`}
                className="text-xs sm:text-sm font-semibold text-foreground/90 flex items-center justify-between"
              >
                <span>পণ্যের ইউনিট / টাইপ *</span>
              </FieldLabel>
              <Select
                value={rootUnit}
                onValueChange={(val) =>
                  val && handleRootUnitChange(val as ProductUnit)
                }
              >
                <SelectTrigger
                  id={`prod-unit-${product.id}`}
                  className="w-full h-10 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium"
                >
                  <SelectValue placeholder="ইউনিট নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>গণনা ভিত্তিক (Count / Container)</SelectLabel>
                    <SelectItem value="jar">জার (Jar)</SelectItem>
                    <SelectItem value="bottle">বোতল (Bottle)</SelectItem>
                    <SelectItem value="piece">পিস (Piece)</SelectItem>
                    <SelectItem value="packet">প্যাকেট (Packet)</SelectItem>
                    <SelectItem value="box">বক্স (Box)</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>ওজন ভিত্তিক (Weight)</SelectLabel>
                    <SelectItem value="gram">গ্রাম (Gram)</SelectItem>
                    <SelectItem value="kg">কেজি (Kg)</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>ভলিউম / তরল (Volume)</SelectLabel>
                    <SelectItem value="ml">মি.লি. (ml)</SelectItem>
                    <SelectItem value="litre">লিটার (Litre)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel
                htmlFor={`prod-total-stock-${product.id}`}
                className="text-xs sm:text-sm font-semibold text-foreground/90"
              >
                মোট স্টক ({getProductUnitLabel(rootUnit)}) *
              </FieldLabel>
              <div className="relative">
                <Input
                  id={`prod-total-stock-${product.id}`}
                  type="number"
                  min="0"
                  value={totalStock}
                  onChange={(e) =>
                    handleTotalStockChange(parseInt(e.target.value, 10) || 0)
                  }
                  required
                  placeholder="যেমন: 100"
                  className="h-10 text-xs sm:text-sm px-3 rounded-lg sm:rounded-xl font-mono pr-14"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground pointer-events-none">
                  {getProductUnitLabel(rootUnit)}
                </span>
              </div>
            </Field>

            <Field>
              <FieldLabel
                htmlFor={`prod-collection-${product.id}`}
                className="text-xs sm:text-sm font-semibold text-foreground/90"
              >
                কালেকশন / ক্যাটাগরি
              </FieldLabel>
              <Select
                value={selectedCollectionId}
                onValueChange={(val) => setSelectedCollectionId(val ?? "")}
              >
                <SelectTrigger
                  id={`prod-collection-${product.id}`}
                  className="w-full h-10 rounded-lg sm:rounded-xl text-xs sm:text-sm"
                >
                  <SelectValue placeholder="কালেকশন নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="">কালেকশন নেই</SelectItem>
                    {collections.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.title}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel
                htmlFor={`prod-status-${product.id}`}
                className="text-xs sm:text-sm font-semibold text-foreground/90"
              >
                স্টক স্ট্যাটাস
              </FieldLabel>
              <Select
                value={availableForSale}
                onValueChange={(val) => setAvailableForSale(val ?? "true")}
              >
                <SelectTrigger
                  id={`prod-status-${product.id}`}
                  className="w-full h-10 rounded-lg sm:rounded-xl text-xs sm:text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="true">ইন স্টক (In Stock)</SelectItem>
                    <SelectItem value="false">স্টক শেষ (Out of Stock)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* ──── Variant / Pack Sizes Section ──── */}
          <div className="flex flex-col gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-border/70 bg-muted/20 p-2.5 sm:p-4">
            <div className="flex items-center justify-between gap-2 pb-1 border-b border-border/40">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-foreground/90">
                  ভ্যারিয়েন্ট / প্যাকসমূহ ({variants.length})
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  (মোট {totalStock} {getProductUnitLabel(rootUnit)} থেকে অটো স্টক হিসাব হবে)
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddVariant()}
                className="h-8 rounded-lg sm:rounded-xl text-xs font-semibold cursor-pointer shrink-0"
              >
                <Add className="size-3.5 mr-1" />
                <span>+ নতুন প্যাক</span>
              </Button>
            </div>

            {/* Pack Rows */}
            <div className="flex flex-col gap-2.5">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-2 rounded-lg sm:rounded-xl border border-border bg-card p-2.5 sm:p-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] sm:text-xs font-bold text-muted-foreground">
                        প্যাক #{idx + 1}
                      </span>
                      {/* Live Generated Title Tag */}
                      <span className="inline-flex items-center text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                        {v.title ||
                          formatPackTitle(v.amount || 0, rootUnit) ||
                          "প্যাক"}
                      </span>
                      {/* Live Calculated Pack Stock Badge */}
                      <span className="inline-flex items-center text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        ⚡ অটো স্টক: {getAutoPackStock(v.amount, totalStock)}টি প্যাক
                      </span>
                    </div>
                    {variants.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveVariant(idx)}
                        className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10 cursor-pointer rounded-md"
                        title="এই প্যাকটি মুছুন"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
                    {/* Amount / Weight */}
                    <div>
                      <label className="text-[10px] sm:text-[11px] font-medium text-muted-foreground block mb-1">
                        পরিমাণ ({getProductUnitLabel(rootUnit)}) *
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="any"
                          min="0"
                          value={v.amount || ""}
                          onChange={(e) =>
                            handleVariantAmountChange(idx, e.target.value)
                          }
                          placeholder="যেমন: 500"
                          required
                          className="h-9 text-xs font-mono rounded-lg pr-12"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground pointer-events-none">
                          {getProductUnitLabel(rootUnit)}
                        </span>
                      </div>
                    </div>

                    {/* Selling Price */}
                    <div>
                      <label className="text-[10px] sm:text-[11px] font-medium text-muted-foreground block mb-1">
                        বিক্রয় মূল্য (৳) *
                      </label>
                      <Input
                        type="number"
                        step="any"
                        min="0"
                        value={v.price}
                        onChange={(e) =>
                          handleVariantFieldChange(idx, "price", e.target.value)
                        }
                        placeholder="যেমন: 850"
                        required
                        className="h-9 text-xs font-mono rounded-lg"
                      />
                    </div>

                    {/* Compare At Price */}
                    <div>
                      <label className="text-[10px] sm:text-[11px] font-medium text-muted-foreground block mb-1">
                        আগের মূল্য (৳)
                      </label>
                      <Input
                        type="number"
                        step="any"
                        min="0"
                        value={v.compareAtPrice || ""}
                        onChange={(e) =>
                          handleVariantFieldChange(
                            idx,
                            "compareAtPrice",
                            e.target.value,
                          )
                        }
                        placeholder="ঐচ্ছিক"
                        className="h-9 text-xs font-mono rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Field>
            <FieldLabel
              htmlFor={`prod-image-${product.id}`}
              className="text-xs sm:text-sm font-semibold text-foreground/90"
            >
              নতুন ছবি পরিবর্তন (ঐচ্ছিক)
            </FieldLabel>
            <Input
              id={`prod-image-${product.id}`}
              name="image"
              type="file"
              accept="image/*"
              className="h-10 text-xs rounded-lg sm:rounded-xl file:mr-2.5 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs file:font-semibold"
            />
          </Field>

          <Field>
            <FieldLabel
              htmlFor={`prod-desc-${product.id}`}
              className="text-xs sm:text-sm font-semibold text-foreground/90"
            >
              বিবরণ
            </FieldLabel>
            <Textarea
              id={`prod-desc-${product.id}`}
              name="description"
              rows={3}
              defaultValue={product.description || ""}
              placeholder="পণ্য সম্পর্কিত বিস্তারিত বিবরণ..."
              className="text-xs sm:text-sm rounded-lg sm:rounded-xl"
            />
          </Field>
        </FieldGroup>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="h-10 text-xs sm:text-sm rounded-lg sm:rounded-xl px-4"
          >
            বাতিল
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="h-10 text-xs sm:text-sm rounded-lg sm:rounded-xl px-5"
          >
            {isPending ? (
              <>
                <Spinner data-icon="inline-start" className="size-4" />
                <span>আপডেট হচ্ছে...</span>
              </>
            ) : (
              "আপডেট করুন"
            )}
          </Button>
        </div>
      </form>
    </ResponsiveDialog>
  );
}
