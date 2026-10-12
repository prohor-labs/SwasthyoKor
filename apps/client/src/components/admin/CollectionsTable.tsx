"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Check, Edit, Folder, Trash2 } from "@/components/icons";
import { ResponsiveDialog } from "@/components/shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteCollectionAction,
  toggleCollectionHomepageAction,
  updateCollectionAction,
} from "@/lib/actions/admin";

interface CollectionItem {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  subtitle?: string | null;
  image?: string | null;
  showOnHomepage: boolean;
  displayOrder: number;
  maxProducts: number;
  createdAt: Date;
}

export function CollectionsTable({
  collections,
}: {
  collections: CollectionItem[];
}) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editingCol, setEditingCol] = useState<CollectionItem | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই কালেকশনটি মুছে ফেলতে চান?")) return;
    setDeletingId(id);
    startTransition(async () => {
      await deleteCollectionAction(id);
      setDeletingId(null);
    });
  };

  const handleToggleHomepage = (col: CollectionItem) => {
    setTogglingId(col.id);
    startTransition(async () => {
      await toggleCollectionHomepageAction(col.id, !col.showOnHomepage);
      setTogglingId(null);
    });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCol) return;
    setEditError(null);
    const formData = new FormData(e.currentTarget);
    formData.append("id", editingCol.id);

    startTransition(async () => {
      const res = await updateCollectionAction(formData);
      if (res.success) {
        setEditingCol(null);
      } else {
        setEditError(res.error || "কালেকশন আপডেট করতে সমস্যা হয়েছে।");
      }
    });
  };

  return (
    <div className="w-full rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-5 py-4">কালেকশন</TableHead>
            <TableHead className="px-4 py-4">হ্যান্ডেল (Slug)</TableHead>
            <TableHead className="px-4 py-4 text-center">হোমপেজ শোকেস</TableHead>
            <TableHead className="px-4 py-4 text-center">ক্রম</TableHead>
            <TableHead className="px-4 py-4">বিবরণ / সাবটাইটেল</TableHead>
            <TableHead className="px-4 py-4 text-right">অ্যাকশন</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collections.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-48 text-center">
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>কোনো কালেকশন পাওয়া যায়নি</EmptyTitle>
                    <EmptyDescription>
                      নতুন ক্যাটাগরি তৈরি করতে 'নতুন কালেকশন' বাটনে চাপ দিন।
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TableCell>
            </TableRow>
          ) : (
            collections.map((col) => (
              <TableRow key={col.id}>
                <TableCell className="px-5 py-4 font-bold text-foreground">
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 rounded-full overflow-hidden border border-border bg-muted shrink-0 flex items-center justify-center">
                      {col.image ? (
                        <Image
                          src={col.image}
                          alt={col.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <Folder className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <Link
                        href={`/category/${col.handle}`}
                        className="hover:underline hover:text-primary transition-colors line-clamp-1"
                      >
                        {col.title}
                      </Link>
                      {col.subtitle && (
                        <span className="text-[11px] text-muted-foreground line-clamp-1 font-normal">
                          {col.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 font-mono text-xs text-muted-foreground">
                  /{col.handle}
                </TableCell>
                <TableCell className="px-4 py-4 text-center">
                  <Button
                    type="button"
                    variant={col.showOnHomepage ? "default" : "outline"}
                    size="sm"
                    disabled={isPending && togglingId === col.id}
                    onClick={() => handleToggleHomepage(col)}
                    className={`h-7 px-2.5 rounded-full text-xs font-semibold cursor-pointer ${
                      col.showOnHomepage
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "text-muted-foreground"
                    }`}
                  >
                    {togglingId === col.id ? (
                      <Spinner className="size-3 mr-1" />
                    ) : col.showOnHomepage ? (
                      <Check className="size-3 mr-1" />
                    ) : null}
                    <span>{col.showOnHomepage ? "চালু" : "বন্ধ"}</span>
                  </Button>
                </TableCell>
                <TableCell className="px-4 py-4 text-center">
                  <Badge variant="outline" className="font-mono text-xs">
                    #{col.displayOrder}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-4 text-xs text-muted-foreground max-w-xs truncate">
                  {col.subtitle || col.description || "—"}
                </TableCell>
                <TableCell className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingCol(col)}
                      className="text-foreground hover:bg-muted cursor-pointer rounded-xl h-8 w-8 p-0"
                      title="সম্পাদনা করুন"
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isPending && deletingId === col.id}
                      onClick={() => handleDelete(col.id)}
                      className="text-destructive hover:bg-destructive/10 cursor-pointer rounded-xl h-8 w-8 p-0"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Edit Collection Dialog */}
      {editingCol && (
        <ResponsiveDialog
          open={Boolean(editingCol)}
          onOpenChange={(open) => !open && setEditingCol(null)}
          title="কালেকশন / ক্যাটাগরি সম্পাদনা"
          description="কালেকশনের নাম, সাবটাইটেল, হোমপেজ সেটিংস ও বিবরণ আপডেট করুন।"
        >
          {editError && (
            <Alert variant="destructive">
              <AlertDescription>{editError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleEditSubmit} className="flex flex-col gap-3 sm:gap-4">
            <FieldGroup className="gap-3 sm:gap-4">
              <Field>
                <FieldLabel htmlFor="edit-col-title" className="text-xs sm:text-sm font-semibold text-foreground/90">
                  কালেকশনের নাম *
                </FieldLabel>
                <Input
                  id="edit-col-title"
                  name="title"
                  defaultValue={editingCol.title}
                  required
                  className="h-10 text-xs sm:text-sm px-3 rounded-lg sm:rounded-xl"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-col-subtitle" className="text-xs sm:text-sm font-semibold text-foreground/90">
                  হোমপেজ সাবটাইটেল / ট্যাগলাইন
                </FieldLabel>
                <Input
                  id="edit-col-subtitle"
                  name="subtitle"
                  defaultValue={editingCol.subtitle || ""}
                  placeholder="যেমন: সুন্দরবনের কাঁচা মধু, গাওয়া ঘি ও খাঁটি গুড়"
                  className="h-10 text-xs sm:text-sm px-3 rounded-lg sm:rounded-xl"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-col-handle" className="text-xs sm:text-sm font-semibold text-foreground/90">
                  হ্যান্ডেল (URL Slug) *
                </FieldLabel>
                <Input
                  id="edit-col-handle"
                  name="handle"
                  defaultValue={editingCol.handle}
                  required
                  className="h-10 text-xs sm:text-sm px-3 rounded-lg sm:rounded-xl font-mono"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-col-image" className="text-xs sm:text-sm font-semibold text-foreground/90">
                  ক্যাটাগরি ছবি URL (Image URL)
                </FieldLabel>
                <Input
                  id="edit-col-image"
                  name="image"
                  defaultValue={editingCol.image || ""}
                  placeholder="https://..."
                  className="h-10 text-xs sm:text-sm px-3 rounded-lg sm:rounded-xl font-mono"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-col-desc" className="text-xs sm:text-sm font-semibold text-foreground/90">
                  বিবরণ
                </FieldLabel>
                <Textarea
                  id="edit-col-desc"
                  name="description"
                  rows={2}
                  defaultValue={editingCol.description || ""}
                  className="text-xs sm:text-sm rounded-lg sm:rounded-xl"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-border/70 bg-muted/30">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-col-homepage"
                    name="showOnHomepage"
                    value="true"
                    defaultChecked={editingCol.showOnHomepage}
                    className="size-4 rounded accent-primary cursor-pointer"
                  />
                  <label
                    htmlFor="edit-col-homepage"
                    className="text-xs font-semibold text-foreground cursor-pointer select-none"
                  >
                    হোমপেজে শোকেস করুন
                  </label>
                </div>

                <div className="flex items-center gap-2 justify-between sm:justify-end">
                  <label
                    htmlFor="edit-col-order"
                    className="text-xs text-muted-foreground whitespace-nowrap"
                  >
                    ডিসপ্লে ক্রম:
                  </label>
                  <Input
                    id="edit-col-order"
                    name="displayOrder"
                    type="number"
                    defaultValue={editingCol.displayOrder || 0}
                    className="rounded-lg h-8 text-xs w-20 px-2"
                  />
                </div>
              </div>
            </FieldGroup>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingCol(null)}
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
                  "আপডেট করুন"
                )}
              </Button>
            </div>
          </form>
        </ResponsiveDialog>
      )}
    </div>
  );
}
