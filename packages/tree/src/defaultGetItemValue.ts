import { UnknownTreeItem } from "./types";

/**
 * A "reasonable" default implementation for the getItemValue prop on a tree that will warn about
 * items that are not keyboard searchable in non-production environments.
 *
 * @private
 */
export default function defaultGetItemValue(
  item: UnknownTreeItem,
  valueKey: string
): string {
  const result = item[valueKey];
  if (process.env.NODE_ENV !== "production") {
    const type = typeof result;
    if (type !== "string" && type !== "number") {
      /* eslint-disable no-console */
      console.warn(
        "Unable to extract a string or number from an item within the tree for the item:"
      );
      console.warn(item);
      console.warn("");
      console.warn(
        "This will make the item unable to be searched by typing within the tree and should be fixed before pushing to production."
      );
      console.warn(new Error().stack);
    }
  }

  return `${result}`;
}
