import { Suspense } from "react";
import { CollectionsList, FilterList } from "@/components/collection";
import Search, { SearchSkeleton } from "@/components/layout/navbar/Search";
import { sorting } from "@/lib/constants";

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 py-4 sm:py-6 md:py-8">
      {/* Mobile Search Input Bar */}
      <div className="mb-4 block md:hidden">
        <Suspense fallback={<SearchSkeleton />}>
          <Search />
        </Suspense>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Left Sidebar: Collections (Desktop only) */}
        <div className="hidden md:block w-52 lg:w-60 flex-none">
          <Suspense fallback={null}>
            <CollectionsList />
          </Suspense>
        </div>

        {/* Center: Main Search Results & Products */}
        <div className="min-h-[50vh] flex-1 w-full">{children}</div>

        {/* Right Sidebar: Sort By (Desktop only) */}
        <div className="hidden md:block w-44 lg:w-52 flex-none">
          <FilterList list={sorting} title="সাজান (Sort by)" />
        </div>
      </div>
    </div>
  );
}
