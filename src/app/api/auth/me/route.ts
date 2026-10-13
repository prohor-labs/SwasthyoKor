import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "ব্যবহারকারীর তথ্য লোড করতে সমস্যা হয়েছে।";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
