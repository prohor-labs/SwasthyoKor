import { getHomepageShowcaseCategories } from "@/lib/db/queries";
import { CategoryProductSlider } from "./CategoryProductSlider";

export async function CategoryShowcaseSection() {
  const showcaseCategories = await getHomepageShowcaseCategories();

  if (!showcaseCategories.length) return null;

  return (
    <div className="flex flex-col gap-6 sm:gap-10 mx-auto w-full max-w-7xl px-4 py-2 sm:py-4">
      {showcaseCategories.map((cat) => (
        <CategoryProductSlider
          key={cat.id || cat.handle}
          title={cat.title}
          subtitle={cat.subtitle}
          handle={cat.handle}
          products={cat.products}
        />
      ))}
    </div>
  );
}
