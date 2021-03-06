import React, { FC, ReactNode, useEffect, useMemo, useRef } from "react";

import {
  DEFAULT_DESKTOP_LARGE_MIN_WIDTH,
  DEFAULT_DESKTOP_MIN_WIDTH,
  DEFAULT_PHONE_MAX_WIDTH,
  DEFAULT_TABLET_MAX_WIDTH,
  DEFAULT_TABLET_MIN_WIDTH,
} from "./constants";

import { AppSizeContext } from "./useAppSize";
import useAppSizeMedia, {
  AppSize,
  AppSizeOptions,
  DEFAULT_APP_SIZE,
} from "./useAppSizeMedia";

export interface AppSizeListenerProps extends AppSizeOptions {
  children: ReactNode;

  /**
   * An change handler for the app size. This will be called each time the app size
   * changes based on a window resize event and will be provided the
   * next size and the previous size.
   */
  onChange?: (nextSize: AppSize, lastSize: AppSize) => void;
}

type DefaultProps = Required<
  Pick<
    AppSizeListenerProps,
    | "phoneMaxWidth"
    | "tabletMinWidth"
    | "tabletMaxWidth"
    | "desktopMinWidth"
    | "desktopLargeMinWidth"
    | "defaultSize"
  >
>;

type WithDefaultProps = AppSizeListenerProps & DefaultProps;

/**
 * This component should be mounted near the top of your app as it will keep track
 * of the current app size based on the provided breakpoint widths.
 */
const AppSizeListener: FC<AppSizeListenerProps> = providedProps => {
  const {
    children,
    onChange,
    defaultSize,
    phoneMaxWidth,
    tabletMinWidth,
    tabletMaxWidth,
    desktopMinWidth,
    desktopLargeMinWidth,
  } = providedProps as WithDefaultProps;

  const appSize = useAppSizeMedia({
    phoneMaxWidth,
    tabletMaxWidth,
    tabletMinWidth,
    desktopMinWidth,
    desktopLargeMinWidth,
    defaultSize,
  });
  const lastValue = useRef(appSize);

  useEffect(() => {
    // trigger the onChange prop on mount only if there is a difference between the defaultSize
    // and the mounted size.
    if (
      onChange &&
      (defaultSize.isPhone !== appSize.isPhone ||
        defaultSize.isTablet !== appSize.isTablet ||
        defaultSize.isDesktop !== appSize.isDesktop ||
        defaultSize.isLargeDesktop !== appSize.isLargeDesktop ||
        defaultSize.isLandscape !== appSize.isLandscape)
    ) {
      onChange(appSize, defaultSize);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (lastValue.current !== appSize) {
      if (onChange) {
        onChange(appSize, lastValue.current);
      }

      lastValue.current = appSize;
    }
  });

  const value = useMemo(
    () => ({
      ...appSize,
      __initialized: true,
    }),
    [appSize]
  );
  return (
    <AppSizeContext.Provider value={value}>{children}</AppSizeContext.Provider>
  );
};

const defaultProps: DefaultProps = {
  phoneMaxWidth: DEFAULT_PHONE_MAX_WIDTH,
  tabletMinWidth: DEFAULT_TABLET_MIN_WIDTH,
  tabletMaxWidth: DEFAULT_TABLET_MAX_WIDTH,
  desktopMinWidth: DEFAULT_DESKTOP_MIN_WIDTH,
  desktopLargeMinWidth: DEFAULT_DESKTOP_LARGE_MIN_WIDTH,
  defaultSize: DEFAULT_APP_SIZE,
};

AppSizeListener.defaultProps = defaultProps;

if (process.env.NODE_ENV !== "production") {
  let PropTypes = null;
  try {
    PropTypes = require("prop-types");
  } catch (e) {}

  if (PropTypes) {
    const querySize = PropTypes.oneOfType([PropTypes.string, PropTypes.number]);

    AppSizeListener.propTypes = {
      children: PropTypes.node.isRequired,
      onChange: PropTypes.func,
      phoneMaxWidth: querySize,
      tabletMinWidth: querySize,
      tabletMaxWidth: querySize,
      desktopMinWidth: querySize,
      desktopLargeMinWidth: querySize,
      defaultSize: PropTypes.shape({
        isPhone: PropTypes.bool.isRequired,
        isTablet: PropTypes.bool.isRequired,
        isDesktop: PropTypes.bool.isRequired,
        isLargeDesktop: PropTypes.bool.isRequired,
        isLandscape: PropTypes.bool.isRequired,
      }),
    };
  }
}

export default AppSizeListener;
