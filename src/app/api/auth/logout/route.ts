import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  await deleteSession();
  const url = new URL("/login", request.url);
  return NextResponse.redirect(url, 303);
}
