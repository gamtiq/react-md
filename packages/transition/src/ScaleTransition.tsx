import React, { FC, ReactNode } from "react";
import CSSTransition, {
  CSSTransitionClassNames,
} from "react-transition-group/CSSTransition";
import {
  ConditionalPortal,
  RenderConditionalPortalProps,
} from "@react-md/portal";

import { OverridableCSSTransitionProps, TransitionTimeout } from "./types";

export const SCALE_CLASSNAMES: CSSTransitionClassNames = {
  appear: "rmd-transition--scale-enter",
  appearActive: "rmd-transition--scale-enter-active",
  enter: "rmd-transition--scale-enter",
  enterActive: "rmd-transition--scale-enter-active",
  enterDone: "",
  exit: "rmd-transition--scale-exit",
  exitActive: "rmd-transition--scale-exit-active",
};

export const SCALE_Y_CLASSNAMES: CSSTransitionClassNames = {
  appear: "rmd-transition--scale-y-enter",
  appearActive: "rmd-transition--scale-y-enter-active",
  enter: "rmd-transition--scale-y-enter",
  enterActive: "rmd-transition--scale-y-enter-active",
  enterDone: "",
  exit: "rmd-transition--scale-y-exit",
  exitActive: "rmd-transition--scale-y-exit-active",
};

export const SCALE_TIMEOUT: TransitionTimeout = {
  enter: 200,
  exit: 150,
};

export interface ScaleTransitionProps
  extends OverridableCSSTransitionProps,
    RenderConditionalPortalProps {
  /**
   * Boolean if the vertical scale animation should be used instead of the normal
   * scale animation.
   */
  vertical?: boolean;

  /**
   * Boolean if the animation should be triggered. Enabling this will trigger the appear/enter
   * animations while disabling it will trigger the exit animation.
   */
  visible: boolean;

  /**
   * The children to render.
   */
  children?: ReactNode;
}

type DefaultProps = Required<
  Pick<
    ScaleTransitionProps,
    "timeout" | "mountOnEnter" | "unmountOnExit" | "portal"
  >
>;
type WithDefaultProps = ScaleTransitionProps & DefaultProps;

/**
 * This `ScaleTransition` component is used to trigger an animation that switches between an
 * opacity of `0` and `1` and using a `transform: scale(0)` to `transform: scale(1)`. It is
 * recommended to also manually apply a `transform-origin` style or use the `useFixedPositioning`
 * hook to generate for you so that the animation starts from a specific point.
 *
 * Since the default scale animation is X and Y, you can enable the `vertical` prop which will
 * update the transition to use `transform: scaleY(0)` to `transform: scaleY(1)` instead.
 */
const ScaleTransition: FC<ScaleTransitionProps> = providedProps => {
  const {
    visible,
    children,
    classNames: propClassNames,
    vertical,
    portal,
    portalInto,
    portalIntoId,
    ...props
  } = providedProps as WithDefaultProps;

  let classNames = propClassNames;
  if (!classNames) {
    classNames = vertical ? SCALE_Y_CLASSNAMES : SCALE_CLASSNAMES;
  }

  return (
    <ConditionalPortal
      portal={portal}
      portalInto={portalInto}
      portalIntoId={portalIntoId}
    >
      <CSSTransition {...props} in={visible} classNames={classNames}>
        {children}
      </CSSTransition>
    </ConditionalPortal>
  );
};

const defaultProps: DefaultProps = {
  portal: false,
  mountOnEnter: true,
  unmountOnExit: true,
  timeout: SCALE_TIMEOUT,
};

ScaleTransition.defaultProps = defaultProps;

if (process.env.NODE_ENV !== "production") {
  let PropTypes;
  try {
    PropTypes = require("prop-types");
  } catch (e) {}

  if (PropTypes) {
    ScaleTransition.propTypes = {
      portal: PropTypes.bool,
      portalInto: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
      portalIntoId: PropTypes.string,
      mountOnEnter: PropTypes.bool,
      unmountOnExit: PropTypes.bool,
      visible: PropTypes.bool.isRequired,
      vertical: PropTypes.bool,
      timeout: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.shape({
          enter: PropTypes.number,
          exit: PropTypes.number,
        }),
      ]),
      classNames: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          appear: PropTypes.string,
          appearActive: PropTypes.string,
          enter: PropTypes.string,
          enterActive: PropTypes.string,
          enterDone: PropTypes.string,
          exit: PropTypes.string,
          exitActive: PropTypes.string,
          exitDone: PropTypes.string,
        }),
      ]),
      children: PropTypes.node,
    };
  }
}

export default ScaleTransition;
