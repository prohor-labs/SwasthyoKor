import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/dashboard";
import { ThemeToggler } from "@/components/theme-toggler";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = {
  title: "প্রোফাইল ও সেটিংস | স্বাস্থ্যকর",
  description: "আপনার ব্যক্তিগত অ্যাকাউন্ট প্রোফাইল ও সেটিংস পরিচালনা করুন।",
};

export default async function UserProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/dashboard/profile");
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            প্রোফাইল ও সেটিংস
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            আপনার অ্যাকাউন্টের বিবরণ, যোগাযোগের তথ্য ও ডিসপ্লে প্রেফারেন্স।
          </p>
        </div>
      </div>

      <ProfileForm
        initialUser={{
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          isAdmin: user.isAdmin,
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme Settings */}
        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold">থিম ও ডিসপ্লে</CardTitle>
            <CardDescription className="text-xs">
              ইন্টারফেস মোড (লাইট / ডার্ক) পরিবর্তন করুন।
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">কালার মোড</span>
            <ThemeToggler />
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold">অ্যাকাউন্ট স্ট্যাটাস</CardTitle>
            <CardDescription className="text-xs">
              নিরাপত্তা ও অথেন্টিকেশন তথ্য।
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">টাইপ</span>
            <Badge variant={user.isAdmin ? "default" : "secondary"}>
              {user.isAdmin ? "অ্যাডমিনিস্ট্রেটর" : "সাধারণ গ্রাহক"}
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
