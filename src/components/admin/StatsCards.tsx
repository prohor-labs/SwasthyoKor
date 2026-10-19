import { Box, CheckCircle, Receipt, User } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  productCount: number;
  orderCount: number;
  totalRevenue: number;
  userCount: number;
  blogCount?: number;
}

export function StatsCards({
  productCount,
  orderCount,
  totalRevenue,
  userCount,
  blogCount,
}: StatsCardsProps) {
  const stats = [
    {
      title: "মোট পণ্য",
      value: productCount.toLocaleString("bn-BD"),
      icon: Box,
      description: "লাইভ ক্যাটালগে থাকা পণ্য",
      color: "text-emerald-600 bg-emerald-500/10",
    },
    {
      title: "মোট অর্ডার",
      value: orderCount.toLocaleString("bn-BD"),
      icon: Receipt,
      description: "সম্পন্ন ও সক্রিয় অর্ডার",
      color: "text-blue-600 bg-blue-500/10",
    },
    {
      title: "মোট আয়",
      value: `৳${totalRevenue.toLocaleString("bn-BD")}`,
      icon: CheckCircle,
      description: "সর্বমোট সেলস ভলিউম",
      color: "text-amber-600 bg-amber-500/10",
    },
    {
      title: "নিবন্ধিত গ্রাহক",
      value: userCount.toLocaleString("bn-BD"),
      icon: User,
      description:
        blogCount !== undefined
          ? `ব্লগ আর্টিকেল: ${blogCount.toLocaleString("bn-BD")}টি`
          : "সক্রিয় গ্রাহক অ্যাকাউন্ট",
      color: "text-purple-600 bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className="rounded-2xl border-border bg-card shadow-xs"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-xl", stat.color)}>
                <Icon className="size-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-foreground">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
