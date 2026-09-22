import { asc, desc } from "drizzle-orm";
import { CollectionsTable, CreateCollectionDialog } from "@/components/admin";
import { db } from "@/lib/db";
import { collections } from "@/lib/db/schema";

export const metadata = {
  title: "কালেকশন ও ক্যাটাগরি | অ্যাডমিন",
  description: "স্বাস্থ্যকর পণ্যের ক্যাটাগরি ও কালেকশন পরিচালনা।",
};

export default async function AdminCollectionsPage() {
  const allCollections = await db
    .select()
    .from(collections)
    .orderBy(asc(collections.displayOrder), desc(collections.createdAt));

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            কালেকশন ও ক্যাটাগরি
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            মোট {allCollections.length}টি কালেকশন স্টোরে রয়েছে।
          </p>
        </div>
        <CreateCollectionDialog />
      </div>

      <CollectionsTable collections={allCollections} />
    </div>
  );
}
