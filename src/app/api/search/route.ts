import { type NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim() || "";

    if (!query) {
      return NextResponse.json({ products: [] });
    }

    const products = await getProducts({ query });
    return NextResponse.json({ products: products.slice(0, 6) });
  } catch (error) {
    console.error("Live search API error:", error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
