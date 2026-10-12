import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "ব্যবহারকারীর তথ্য লোড করতে সমস্যা হয়েছে।" },
      { status: 500 },
    );
  }
}
