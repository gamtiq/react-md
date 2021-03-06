import { useRef } from "react";
import {
  BaseTreeItem,
  getItemsFrom,
  TreeData,
  TreeItemExpansion,
  TreeItemId,
  TreeItemSelection,
  useTreeItemExpansion,
} from "@react-md/tree";

import { LayoutNavigationItem, LayoutNavigationTree } from "./types";

export interface LayoutNavigationState<
  T extends BaseTreeItem = LayoutNavigationItem
> extends TreeItemSelection, TreeItemExpansion {
  navItems: LayoutNavigationTree<T>;
}

/**
 * @private
 */
const getParentIds = (
  itemId: TreeItemId,
  navItems: TreeData<BaseTreeItem>
): TreeItemId[] => getItemsFrom(navItems, itemId).map(({ itemId }) => itemId);

/**
 * This is used to disable the item select and multi item select functionality since
 * only one id can be selected at a time, and it'll always be the current pathname's
 * itemId
 *
 * @private
 */
const noop = (): void => {};

/**
 * This is a pretty reasonable default implementation for having a navigation tree within
 * the Layout component. The way it'll work is that the current route will be the only
 * selected item within the tree. When the pathname changes, the selectedIds will be updated
 * to only be the current pathname once again.
 *
 * This means that you can use whatever routing library or history provider that ensures that
 * your layout re-renders on a path change.
 *
 * @see LayoutNavigationTree for description of the navItems
 * @param navItems All the navigation items within your layout. This is used for determining
 * which parent tree items should be expanded when the route changes so the current route
 * won't be hidden from view. This sort of flow happens if you have a link outside of the
 * navigation tree.
 * @param pathname The current pathname
 * @return the required `Tree` selection and expansion state and handlers that should be
 * passed to the `Layout` component.
 */
export default function useLayoutNavigation<
  T extends BaseTreeItem = LayoutNavigationItem
>(
  navItems: LayoutNavigationTree<T>,
  pathname: string
): LayoutNavigationState<T> {
  const itemId = pathname.replace(/\?.*$/, "");
  const {
    expandedIds,
    onItemExpansion,
    onMultiItemExpansion,
  } = useTreeItemExpansion(() => getParentIds(itemId, navItems));

  const prevItemId = useRef(itemId);
  const prevNavItems = useRef(navItems);
  if (prevItemId.current !== itemId || prevNavItems.current !== navItems) {
    prevItemId.current = itemId;
    prevNavItems.current = navItems;
    onMultiItemExpansion(
      Array.from(new Set([...expandedIds, ...getParentIds(itemId, navItems)]))
    );
  }

  return {
    navItems,
    multiSelect: false,
    selectedIds: [itemId],
    onItemSelect: noop,
    onMultiItemSelect: noop,
    expandedIds,
    onItemExpansion,
    onMultiItemExpansion,
  };
}
