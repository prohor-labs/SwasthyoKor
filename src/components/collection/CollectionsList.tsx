import { getCollections } from "@/lib/db/queries";
import { FilterList } from "./FilterList";

export async function CollectionsList() {
  const collections = await getCollections();
  return <FilterList list={collections} title="ক্যাটাগরি (Collections)" />;
}
