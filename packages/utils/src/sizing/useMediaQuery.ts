import { useEffect, useState } from "react";

/**
 * A helper hook that is used to create a memoized media query tester
 * for `window.matchMedia`.
 *
 * Note: This is a **client side only** hook as it requires the `window`
 * to attach a resize event listener to.
 *
 * @param query The media query to use
 * @param defaultValue The default value for if this media query matches. When
 * this is `undefined`, it will default to `false` unless the `window` is defined
 * and the `checkImmediately` param was not set to `false`. Otherwise, it will
 * check the media query matches on mount and use that value.
 * @param checkImmediately Boolean if the media query should be checked immediately
 * on mount. When omittied, it will default to checking when the window is defined.
 * @return true if the media query is a match.
 */
export default function useMediaQuery(
  query: string,
  defaultValue?: boolean,
  checkImmediately: boolean = typeof window !== "undefined"
): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof defaultValue !== "undefined") {
      return defaultValue;
    }

    if (checkImmediately && typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }

    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mq = window.matchMedia(query);
    const updater = ({ matches }: MediaQueryListEvent): void =>
      setMatches(matches);
    mq.addListener(updater);

    if (mq.matches !== matches) {
      setMatches(mq.matches);
    }

    return () => mq.removeListener(updater);
  }, [matches, query]);

  return matches;
}
