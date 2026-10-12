"use client";

import { useState, useTransition } from "react";
import { Add } from "@/components/icons";
import { ResponsiveDialog } from "@/components/shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { createCollectionAction } from "@/lib/actions/admin";

export function CreateCollectionDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createCollectionAction(formData);
      if (res.success) {
        setOpen(false);
      } else {
        setError(res.error || "কালেকশন তৈরি করতে সমস্যা হয়েছে।");
      }
    });
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      title="নতুন কালেকশন যোগ করুন"
      description="নতুন পণ্য ক্যাটাগরি বা কালেকশন তৈরি করুন।"
      trigger={
        <Button className="rounded-xl shadow-xs">
          <Add data-icon="inline-start" />
          <span>নতুন কালেকশন</span>
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
            <FieldLabel htmlFor="col-title" className="text-xs sm:text-sm font-semibold text-foreground/90">
              কালেকশনের নাম *
            </FieldLabel>
            <Input
              id="col-title"
              name="title"
              placeholder="যেমন: খাঁটি মধু ও ঘি"
              required
              className="h-10 text-xs sm:text-sm px-3 rounded-lg sm:rounded-xl"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="col-handle" className="text-xs sm:text-sm font-semibold text-foreground/90">
              হ্যান্ডেল (URL Slug) *
            </FieldLabel>
            <Input
              id="col-handle"
              name="handle"
              placeholder="যেমন: honey-and-ghee"
              required
              className="h-10 text-xs sm:text-sm px-3 rounded-lg sm:rounded-xl font-mono"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="col-subtitle" className="text-xs sm:text-sm font-semibold text-foreground/90">
              হোমপেজ সাবটাইটেল / ট্যাগলাইন
            </FieldLabel>
            <Input
              id="col-subtitle"
              name="subtitle"
              placeholder="যেমন: সুন্দরবনের কাঁচা মধু, গাওয়া ঘি ও খাঁটি গুড়"
              className="h-10 text-xs sm:text-sm px-3 rounded-lg sm:rounded-xl"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="col-image" className="text-xs sm:text-sm font-semibold text-foreground/90">
              ক্যাটাগরি ছবি (Image URL)
            </FieldLabel>
            <Input
              id="col-image"
              name="image"
              placeholder="https://... বা ছবির লিংক"
              className="h-10 text-xs sm:text-sm px-3 rounded-lg sm:rounded-xl"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="col-desc" className="text-xs sm:text-sm font-semibold text-foreground/90">
              বিবরণ
            </FieldLabel>
            <Textarea
              id="col-desc"
              name="description"
              rows={2}
              placeholder="কালেকশন সম্পর্কিত সংক্ষিপ্ত বিবরণ..."
              className="text-xs sm:text-sm rounded-lg sm:rounded-xl"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-border/70 bg-muted/30">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="col-homepage"
                name="showOnHomepage"
                value="true"
                className="size-4 rounded accent-primary cursor-pointer"
              />
              <label
                htmlFor="col-homepage"
                className="text-xs font-semibold text-foreground cursor-pointer select-none"
              >
                হোমপেজে শোকেস করুন
              </label>
            </div>

            <div className="flex items-center gap-2 justify-between sm:justify-end">
              <label
                htmlFor="col-order"
                className="text-xs text-muted-foreground whitespace-nowrap"
              >
                ডিসপ্লে ক্রম:
              </label>
              <Input
                id="col-order"
                name="displayOrder"
                type="number"
                defaultValue="0"
                className="rounded-lg h-8 text-xs w-20 px-2"
              />
            </div>
          </div>
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
                <span>সংরক্ষণ হচ্ছে...</span>
              </>
            ) : (
              "সংরক্ষণ করুন"
            )}
          </Button>
        </div>
      </form>
    </ResponsiveDialog>
  );
}
