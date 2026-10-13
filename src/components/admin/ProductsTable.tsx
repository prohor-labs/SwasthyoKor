"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Trash2 } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteProductAction } from "@/lib/actions/admin";

import { EditProductDialog, type EditProductItem } from "./EditProductDialog";

export function ProductsTable({
  products,
  collections = [],
}: {
  products: EditProductItem[];
  collections?: { id: string; title: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান?")) return;
    setDeletingId(id);
    startTransition(async () => {
      await deleteProductAction(id);
      setDeletingId(null);
    });
  };

  return (
    <div className="w-full rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-6 py-4">পণ্য</TableHead>
            <TableHead className="px-6 py-4">মূল্য</TableHead>
            <TableHead className="px-6 py-4">স্ট্যাটাস</TableHead>
            <TableHead className="px-6 py-4 text-right">অ্যাকশন</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-48 text-center">
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>কোনো পণ্য পাওয়া যায়নি</EmptyTitle>
                    <EmptyDescription>
                      আপনার স্টোরে পণ্য যোগ করতে 'নতুন পণ্য যোগ করুন' বাটনে ক্লিক করুন।
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TableCell>
            </TableRow>
          ) : (
            products.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="px-6 py-4 font-medium">
                  <div className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <div className="relative size-10 overflow-hidden rounded-xl border border-border bg-muted">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                    <div>
                      <div className="font-bold text-foreground">
                        {item.title}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        /{item.handle}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 font-semibold text-primary">
                  ৳{item.price}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Badge variant={item.available ? "default" : "destructive"}>
                    {item.available ? "ইন স্টক" : "স্টক শেষ"}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <EditProductDialog
                      product={item}
                      collections={collections}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isPending && deletingId === item.id}
                      onClick={() => handleDelete(item.id)}
                      className="text-destructive hover:bg-destructive/10 cursor-pointer rounded-xl"
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
    </div>
  );
}
