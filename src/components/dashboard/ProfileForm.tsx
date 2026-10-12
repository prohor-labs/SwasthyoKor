"use client";

import { useState, useTransition } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { updateProfileUserAction } from "@/lib/actions/user";
import { compressImageClient } from "@/lib/image";

interface ProfileFormProps {
  initialUser: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatarUrl?: string | null;
    isAdmin: boolean;
  };
}

export function ProfileForm({ initialUser }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    const avatarFile = formData.get("avatar") as File | null;
    if (
      avatarFile &&
      avatarFile.size > 0 &&
      avatarFile.type.startsWith("image/")
    ) {
      const compressedWebpFile = await compressImageClient(avatarFile, {
        maxWidthOrHeight: 500,
        maxSizeMB: 0.5,
      });
      formData.set("avatar", compressedWebpFile);
    }

    startTransition(async () => {
      const res = await updateProfileUserAction(formData);
      if (res.success) {
        setSuccess(res.message || "প্রোফাইল সফলভাবে আপডেট হয়েছে।");
      } else {
        setError(res.error || "প্রোফাইল আপডেট করতে ত্রুটি হয়েছে।");
      }
    });
  };

  return (
    <Card className="rounded-2xl border-border bg-card shadow-xs">
      <CardHeader>
        <CardTitle className="text-lg font-bold">ব্যক্তিগত তথ্য</CardTitle>
        <CardDescription>
          আপনার নাম, ফোন নম্বর এবং প্রোফাইল ছবি আপডেট করুন।
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border border-border">
              {initialUser.avatarUrl && (
                <AvatarImage
                  src={initialUser.avatarUrl}
                  alt={initialUser.name}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="text-lg font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                {initialUser.name ? initialUser.name[0].toUpperCase() : "স্ব"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-foreground">{initialUser.name}</h3>
              <p className="text-xs text-muted-foreground">
                {initialUser.email}
              </p>
            </div>
          </div>

          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="user-name">পূর্ণ নাম *</FieldLabel>
              <Input
                id="user-name"
                name="name"
                defaultValue={initialUser.name}
                required
                className="rounded-xl"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="user-email">ইমেইল ঠিকানা</FieldLabel>
              <Input
                id="user-email"
                value={initialUser.email}
                disabled
                className="rounded-xl bg-muted cursor-not-allowed"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="user-phone">মোবাইল নম্বর</FieldLabel>
              <Input
                id="user-phone"
                name="phone"
                placeholder="যেমন: ০১৭১২-৩৪৫৬৭৮"
                defaultValue={initialUser.phone || ""}
                className="rounded-xl"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="user-avatar">প্রোফাইল ছবি পরিবর্তন</FieldLabel>
              <Input
                id="user-avatar"
                name="avatar"
                type="file"
                accept="image/*"
                className="rounded-xl file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-2.5 file:py-1 file:text-xs file:font-semibold"
              />
            </Field>
          </FieldGroup>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl shadow-xs"
            >
              {isPending ? (
                <>
                  <Spinner data-icon="inline-start" className="size-4" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                "তথ্য সংরক্ষণ করুন"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
