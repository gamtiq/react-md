import { useState, useMemo, useEffect } from "react";
import {
  useKeyboardMovement,
  MovementPresets,
  getFocusableElements,
  extractTextContent,
} from "@react-md/utils";

interface MenuKeyDownOptions {
  menu: HTMLDivElement | null;
  horizontal: boolean;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  onRequestClose: () => void;
  defaultFocus: string;
}

/**
 * This hook allows for the keyboard movement within a menu. It'll
 * make sure that the arrow keys and typing letters can correctly focus
 * menu items. In addition, it'll automatically swap to the left and right
 * arrow keys if the menu is displayed horizontally.
 */
export default function useMenuKeyDown({
  menu,
  onKeyDown,
  onRequestClose,
  horizontal,
  defaultFocus,
}: MenuKeyDownOptions): React.KeyboardEventHandler<HTMLDivElement> {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const items = useMemo(() => {
    if (!menu) {
      return [];
    }

    return getFocusableElements(menu, true);
  }, [menu]);

  useEffect(() => {
    if (!menu) {
      return;
    }

    if (defaultFocus === "last") {
      setFocusedIndex(items.length - 1);
    } else {
      setFocusedIndex(0);
    }

    // only want to trigger this on initial menu mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu]);

  return useKeyboardMovement<string, HTMLDivElement>({
    ...(horizontal
      ? MovementPresets.HORIZONTAL_MENU
      : MovementPresets.VERTICAL_MENU),
    focusedIndex,
    onChange({ index }) {
      setFocusedIndex(index);
      if (items[index]) {
        items[index].focus();
      }
    },
    items: items.map(item => extractTextContent(item)),
    onKeyDown(event) {
      if (onKeyDown) {
        onKeyDown(event);
      }

      if (event.key === "Escape" || event.key === "Tab") {
        onRequestClose();
      }
    },
  })[1];
}
