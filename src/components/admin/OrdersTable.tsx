"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderStatusAction } from "@/lib/actions/admin";

interface OrderItem {
  id: string;
  totalAmount: number;
  totalCurrency: string;
  status: string;
  createdAt: Date;
  itemsCount: number;
  email?: string | null;
}

function OrdersTable({ orders }: { orders: OrderItem[] }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (orderId: string, status: string) => {
    startTransition(async () => {
      await updateOrderStatusAction(orderId, status);
    });
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
      case "delivered":
        return "default";
      case "shipped":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="w-full rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-6 py-4">অর্ডার আইডি</TableHead>
            <TableHead className="px-6 py-4">তারিখ</TableHead>
            <TableHead className="px-6 py-4">আইটেম</TableHead>
            <TableHead className="px-6 py-4">মোট টাকা</TableHead>
            <TableHead className="px-6 py-4">স্ট্যাটাস</TableHead>
            <TableHead className="px-6 py-4 text-right">পরিবর্তন</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-48 text-center">
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>এখনো কোনো অর্ডার আসেনি</EmptyTitle>
                    <EmptyDescription>
                      গ্রাহকরা পণ্য অর্ডার করলে তা এখানে তালিকাভুক্ত হবে।
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="px-6 py-4 font-mono font-bold text-foreground">
                  #{order.id.slice(0, 8)}
                </TableCell>
                <TableCell className="px-6 py-4 text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("bn-BD")}
                </TableCell>
                <TableCell className="px-6 py-4 font-medium text-foreground">
                  {order.itemsCount}টি আইটেম
                </TableCell>
                <TableCell className="px-6 py-4 font-bold text-primary">
                  ৳{order.totalAmount.toLocaleString("bn-BD")}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Badge variant={getBadgeVariant(order.status)}>
                    {order.status === "confirmed"
                      ? "কনফার্মড"
                      : order.status === "shipped"
                        ? "ডেলিভারিতে"
                        : order.status === "delivered"
                          ? "ডেলিভার্ড"
                          : order.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <div className="flex justify-end">
                    <Select
                      disabled={isPending}
                      value={order.status}
                      onValueChange={(val) => {
                        if (val) handleStatusChange(order.id, val);
                      }}
                    >
                      <SelectTrigger size="sm" className="w-32 h-8 text-xs font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent align="end">
                        <SelectGroup>
                          <SelectItem value="confirmed">কনফার্মড</SelectItem>
                          <SelectItem value="shipped">ডেলিভারিতে</SelectItem>
                          <SelectItem value="delivered">ডেলিভার্ড</SelectItem>
                          <SelectItem value="cancelled">বাতিল</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
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
