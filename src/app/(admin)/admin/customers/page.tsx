import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const metadata = {
  title: "গ্রাহক তালিকা | অ্যাডমিন",
  description: "স্বাস্থ্যকর স্টোরের নিবন্ধিত গ্রাহক তালিকা।",
};

export default async function AdminCustomersPage() {
  const allUsers = await db.select().from(users);

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            গ্রাহকবৃন্দ
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            মোট {allUsers.length} জন নিবন্ধিত গ্রাহক রয়েছেন।
          </p>
        </div>
      </div>

      <div className="w-full rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-6 py-4">গ্রাহক</TableHead>
              <TableHead className="px-6 py-4">ইমেইল</TableHead>
              <TableHead className="px-6 py-4">যুক্ত হওয়ার তারিখ</TableHead>
              <TableHead className="px-6 py-4">স্ট্যাটাস</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center">
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>এখনো কোনো গ্রাহক নিবন্ধিত হননি</EmptyTitle>
                      <EmptyDescription>
                        নতুন ব্যবহারকারীরা সাইন আপ করলে তাদের তালিকা এখানে দেখা যাবে।
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              allUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="px-6 py-4 font-bold text-foreground">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        {user.avatarUrl && (
                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                        )}
                        <AvatarFallback className="text-xs font-bold">
                          {user.name ? user.name[0].toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground font-mono text-xs">
                    {user.email}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("bn-BD")}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge variant="default">সক্রিয়</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
