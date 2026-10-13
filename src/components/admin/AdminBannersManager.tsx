"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Add, Edit, Trash2 } from "@/components/icons";
import { ResponsiveDialog } from "@/components/shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  createHeroBannerAction,
  deleteHeroBannerAction,
  updateHeroBannerAction,
} from "@/lib/actions/admin";
import type { HeroBanner } from "@/lib/db/schema";
import { compressImageClient } from "@/lib/image";

export function AdminBannersManager({ banners }: { banners: HeroBanner[] }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [createAccentColor, _setCreateAccentColor] = useState("text-amber-400");
  const [editAccentColor, setEditAccentColor] = useState("text-amber-400");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    formData.set("accentColor", createAccentColor);

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
      const res = await createHeroBannerAction(formData);
      if (res.success) {
        setIsCreateOpen(false);
      } else {
        setError(res.error || "ব্যানার তৈরি করতে সমস্যা হয়েছে।");
      }
    });
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingBanner) return;
    setError(null);
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    formData.append("id", editingBanner.id);
    formData.set("accentColor", editAccentColor);

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
      const res = await updateHeroBannerAction(formData);
      if (res.success) {
        setEditingBanner(null);
      } else {
        setError(res.error || "ব্যানার আপডেট করতে সমস্যা হয়েছে।");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই ব্যানারটি মুছে ফেলতে চান?")) return;
    setDeletingId(id);
    startTransition(async () => {
      await deleteHeroBannerAction(id);
      setDeletingId(null);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Create Button Trigger */}
      <div className="flex justify-end">
        <ResponsiveDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          title="নতুন হিরো ব্যানার যোগ করুন"
          description="হোমপেজ স্লাইডারে প্রদর্শনের জন্য নতুন ব্যানার আপলোড ও কনফিগার করুন।"
          trigger={
            <Button className="rounded-xl font-bold shadow-xs">
              <Add className="size-4 mr-1" />
              <span>নতুন ব্যানার তৈরি করুন</span>
            </Button>
          }
        >
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={handleCreateSubmit}
            className="flex flex-col gap-3 sm:gap-4"
          >
            <FieldGroup className="gap-3 sm:gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field>
                  <FieldLabel
                    htmlFor="create-title"
                    className="text-xs sm:text-sm font-semibold text-foreground/90"
                  >
                    ব্যানারের নাম / লেবেল (ঐচ্ছিক)
                  </FieldLabel>
                  <Input
                    id="create-title"
                    name="title"
                    placeholder="যেমন: ঈদের অফার ব্যানার"
                    className="h-10 text-xs sm:text-sm px-3 rounded-lg sm:rounded-xl"
                  />
                </Field>

                <Field>
                  <FieldLabel
                    htmlFor="create-link"
                    className="text-xs sm:text-sm font-semibold text-foreground/90"
                  >
                    ক্লিক করলে যে পেইজে যাবে (টার্গেট লিঙ্ক)
                  </FieldLabel>
                  <Input
                    id="create-link"
                    name="link"
                    defaultValue="/search"
                    className="h-10 text-xs sm:text-sm px-3 rounded-lg sm:rounded-xl font-mono"
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel
                  htmlFor="create-image"
                  className="text-xs sm:text-sm font-semibold text-foreground/90"
                >
                  ব্যানার ইমেজ ফাইল (বা ইমেজ URL) *
                </FieldLabel>
                <Input
                  id="create-image"
                  name="image"
                  type="file"
                  accept="image/*"
                  className="h-10 text-xs rounded-lg sm:rounded-xl file:mr-2.5 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs file:font-semibold"
                />
              </Field>

              <Field>
                <FieldLabel
                  htmlFor="create-imageUrl"
                  className="text-xs sm:text-sm font-semibold text-foreground/90"
                >
                  অথবা ছবির সরাসরি লিঙ্ক (URL)
                </FieldLabel>
                <Input
                  id="create-imageUrl"
                  name="imageUrl"
                  placeholder="https://images.unsplash.com/..."
                  className="h-10 text-xs sm:text-sm px-3 rounded-lg sm:rounded-xl font-mono"
                />
              </Field>
            </FieldGroup>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
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
                    <Spinner className="size-4 mr-1" />
                    <span>সংরক্ষণ হচ্ছে...</span>
                  </>
                ) : (
                  "সংরক্ষণ করুন"
                )}
              </Button>
            </div>
          </form>
        </ResponsiveDialog>
      </div>

      {/* Banners Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all hover:border-emerald-500/50"
          >
            {/* Banner Preview Image */}
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              <Image
                src={banner.image}
                alt={banner.title || `ব্যানার #${index + 1}`}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
              <div className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                স্লাইড #{index + 1}
              </div>
            </div>

            {/* Banner Details & Action Footer */}
            <div className="flex items-center justify-between p-3.5 border-t border-border/50 bg-card">
              <div className="flex flex-col">
                <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                  লিঙ্ক: {banner.link}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">
                  {banner.active ? "সক্রিয় (Active)" : "নিষ্ক্রিয়"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingBanner(banner);
                    setEditAccentColor(banner.accentColor || "text-amber-400");
                  }}
                  className="rounded-lg h-8 w-8 p-0 text-foreground hover:bg-muted"
                  title="সম্পাদনা করুন"
                >
                  <Edit className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isPending && deletingId === banner.id}
                  onClick={() => handleDelete(banner.id)}
                  className="rounded-lg h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Banner Dialog */}
      {editingBanner && (
        <ResponsiveDialog
          open={Boolean(editingBanner)}
          onOpenChange={(open) => !open && setEditingBanner(null)}
          title="হিরো ব্যানার সম্পাদনা করুন"
          description="ব্যানার টাইটেল, লিঙ্ক, ইমেজ ও কনফিগারেশন পরিবর্তন করুন।"
        >
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={handleEditSubmit}
            className="flex flex-col gap-3 sm:gap-4"
          >
            <FieldGroup className="gap-3 sm:gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field>
                  <FieldLabel
                    htmlFor="edit-title"
                    className="text-xs sm:text-sm font-semibold text-foreground/90"
                  >
                    ব্যানারের নাম / লেবেল (ঐচ্ছিক)
                  </FieldLabel>
                  <Input
                    id="edit-title"
                    name="title"
                    defaultValue={editingBanner.title}
                    placeholder="যেমন: ঈদের অফার ব্যানার"
                    className="h-10 text-xs sm:text-sm px-3 rounded-lg sm:rounded-xl"
                  />
                </Field>

                <Field>
                  <FieldLabel
                    htmlFor="edit-link"
                    className="text-xs sm:text-sm font-semibold text-foreground/90"
                  >
                    ক্লিক করলে যে পেইজে যাবে (টার্গেট লিঙ্ক)
                  </FieldLabel>
                  <Input
                    id="edit-link"
                    name="link"
                    defaultValue={editingBanner.link}
                    className="h-10 text-xs sm:text-sm px-3 rounded-lg sm:rounded-xl font-mono"
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel
                  htmlFor="edit-image"
                  className="text-xs sm:text-sm font-semibold text-foreground/90"
                >
                  নতুন ব্যানার ইমেজ ফাইল (ঐচ্ছিক)
                </FieldLabel>
                <Input
                  id="edit-image"
                  name="image"
                  type="file"
                  accept="image/*"
                  className="h-10 text-xs rounded-lg sm:rounded-xl file:mr-2.5 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs file:font-semibold"
                />
              </Field>

              <Field>
                <FieldLabel
                  htmlFor="edit-imageUrl"
                  className="text-xs sm:text-sm font-semibold text-foreground/90"
                >
                  অথবা নতুন ইমেজ URL (ঐচ্ছিক)
                </FieldLabel>
                <Input
                  id="edit-imageUrl"
                  name="imageUrl"
                  placeholder="https://images.unsplash.com/..."
                  className="h-10 text-xs sm:text-sm px-3 rounded-lg sm:rounded-xl font-mono"
                />
              </Field>
            </FieldGroup>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingBanner(null)}
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
                    <Spinner className="size-4 mr-1" />
                    <span>আপডেট হচ্ছে...</span>
                  </>
                ) : (
                  "আপডেট সম্পন্ন করুন"
                )}
              </Button>
            </div>
          </form>
        </ResponsiveDialog>
      )}
    </div>
  );
}
