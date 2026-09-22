import Link from "next/link";
import { CreateProductDialog, StatsCards } from "@/components/admin";
import { BookOpen, Box, Receipt } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { db } from "@/lib/db";
import { blogs, collections, orders, products, users } from "@/lib/db/schema";

export const metadata = {
  title: "অ্যাডমিন ওভারভিউ | স্বাস্থ্যকর",
  description: "স্বাস্থ্যকর ই-কমার্স অ্যাডমিন কন্ট্রোল প্যানেল।",
};

export default async function AdminOverviewPage() {
  const [allProducts, allOrders, allCollections, allUsers, allBlogs] =
    await Promise.all([
      db.select().from(products),
      db.select().from(orders),
      db.select().from(collections),
      db.select().from(users),
      db.select().from(blogs),
    ]);

  const totalRevenue = allOrders.reduce(
    (acc, order) => acc + (order.totalAmount || 0),
    0,
  );

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-6xl">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            অ্যাডমিন প্যানেল
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            স্বাস্থ্যকর স্টোরফ্রন্টের পণ্য, স্টক, অর্ডার, ব্লগ ও ডেটাবেস পরিচালনা করুন।
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CreateProductDialog
            collections={allCollections.map((c) => ({
              id: c.id,
              title: c.title,
            }))}
          />
        </div>
      </div>

      {/* ─── Stats Overview ─── */}
      <StatsCards
        productCount={allProducts.length}
        orderCount={allOrders.length}
        totalRevenue={totalRevenue}
        userCount={allUsers.length}
      />

      {/* ─── Quick Actions & Recent Summary ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Box className="size-5 text-primary" />
              সাম্প্রতিক পণ্য তালিকা
            </CardTitle>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-primary hover:underline"
            >
              সব দেখুন →
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {allProducts.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>কোনো পণ্য নেই</EmptyTitle>
                  <EmptyDescription>নতুন পণ্য যোগ করুন।</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="divide-y divide-border">
                {allProducts.slice(0, 4).map((prod) => (
                  <div
                    key={prod.id}
                    className="py-3 flex items-center justify-between text-sm"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <div className="font-bold text-foreground truncate">
                        {prod.title}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono truncate">
                        /{prod.handle}
                      </div>
                    </div>
                    <Badge
                      variant={
                        prod.availableForSale ? "default" : "destructive"
                      }
                      className="shrink-0 text-[10px]"
                    >
                      {prod.availableForSale ? "ইন স্টক" : "স্টক শেষ"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Receipt className="size-5 text-primary" />
              সাম্প্রতিক অর্ডারসমূহ
            </CardTitle>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-primary hover:underline"
            >
              সব দেখুন →
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {allOrders.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>কোনো অর্ডার নেই</EmptyTitle>
                  <EmptyDescription>
                    নতুন অর্ডার আসলে এখানে দেখা যাবে।
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="divide-y divide-border">
                {allOrders.slice(0, 4).map((ord) => (
                  <div
                    key={ord.id}
                    className="py-3 flex items-center justify-between text-sm"
                  >
                    <div>
                      <div className="font-bold text-foreground font-mono">
                        #{ord.id.slice(0, 8)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(ord.createdAt).toLocaleDateString("bn-BD")}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <div className="font-bold text-foreground">
                        ৳{ord.totalAmount.toLocaleString("bn-BD")}
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {ord.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="size-5 text-primary" />
              সাম্প্রতিক ব্লগ ও গাইড
            </CardTitle>
            <Link
              href="/admin/blog"
              className="text-xs font-semibold text-primary hover:underline"
            >
              সব দেখুন →
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {allBlogs.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>কোনো ব্লগ নেই</EmptyTitle>
                  <EmptyDescription>নতুন আর্টিকেল প্রকাশ করুন।</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="divide-y divide-border">
                {allBlogs.slice(0, 4).map((b) => (
                  <div
                    key={b.id}
                    className="py-3 flex items-center justify-between text-sm"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <div className="font-bold text-foreground truncate">
                        {b.title}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono truncate">
                        /blog/{b.slug}
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {b.category}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
