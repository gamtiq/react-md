import React, { FC, forwardRef } from "react";
import cn from "classnames";
import {
  OptionalFixedPositionOptions,
  FixedTo,
  GetFixedPositionOptions,
  useFixedPositioning,
} from "@react-md/transition";
import { WithForwardedRef, LabelRequiredForA11y } from "@react-md/utils";

import Dialog, { DialogProps } from "./Dialog";

export interface FixedDialogProps
  extends Omit<DialogProps, "type">,
    Pick<OptionalFixedPositionOptions, "anchor"> {
  /**
   * The element the dialog should be fixed to. This can either be:
   * - a query selector string to get an element
   * - an HTMLElement (normally a ref.current)
   * - a function that returns an HTMLElement or null
   * - null
   */
  fixedTo: FixedTo;

  /**
   * Any additional options to apply to the fixed positioning logic. The `transformOrigin`
   * option will be enabled by default.
   */
  options?: OptionalFixedPositionOptions;

  /**
   * An optional function to call to get the fixed positioning options.
   */
  getOptions?: GetFixedPositionOptions;
}

type StrictProps = LabelRequiredForA11y<FixedDialogProps>;
type WithRef = WithForwardedRef<HTMLDivElement>;
type DefaultProps = Required<
  Pick<
    StrictProps,
    "anchor" | "classNames" | "overlayHidden" | "disableScrollLock"
  >
>;
type WithDefaultProps = StrictProps & DefaultProps & WithRef;

/**
 * The `FixedDialog` is a wrapper for the `Dialog` component that can be used
 * to be fix itself to another element. Another term for this component might
 * be a "Pop out Dialog".
 */
const FixedDialog: FC<StrictProps & WithRef> = providedProps => {
  const {
    fixedTo,
    anchor,
    options,
    getOptions,
    forwardedRef,
    children,
    className,
    ...props
  } = providedProps as WithDefaultProps;
  const { onRequestClose } = props;

  const {
    style,
    onEnter,
    onEntering,
    onEntered,
    onExited,
  } = useFixedPositioning({
    transformOrigin: true,
    ...options,
    onScroll: (_event, { visible }) => {
      if (!visible) {
        onRequestClose();
      }
    },
    fixedTo,
    anchor,
    getOptions,
  });

  return (
    <Dialog
      {...props}
      className={cn("rmd-dialog--fixed", className)}
      type="custom"
      ref={forwardedRef}
      style={style}
      onEnter={onEnter}
      onEntering={onEntering}
      onEntered={onEntered}
      onExited={onExited}
    >
      {children}
    </Dialog>
  );
};

const defaultProps: DefaultProps = {
  anchor: {
    x: "inner-right",
    y: "top",
  },
  classNames: {
    appear: "rmd-dialog--fixed-enter",
    appearActive: "rmd-dialog--fixed-enter-active",
    enter: "rmd-dialog--fixed-enter",
    enterActive: "rmd-dialog--fixed-enter-active",
    exit: "rmd-dialog--fixed-exit",
    exitActive: "rmd-dialog--fixed-exit-active",
  },
  overlayHidden: true,
  disableScrollLock: true,
};

FixedDialog.defaultProps = defaultProps;

if (process.env.NODE_ENV !== "production") {
  FixedDialog.displayName = "FixedDialog";

  let PropTypes = null;
  try {
    PropTypes = require("prop-types");
  } catch (e) {}

  if (PropTypes) {
    FixedDialog.propTypes = {
      fixedTo: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func,
        PropTypes.object,
      ]),
      options: PropTypes.shape({
        vwMargin: PropTypes.number,
        vhMargin: PropTypes.number,
        xMargin: PropTypes.number,
        yMargin: PropTypes.number,
        disableSwapping: PropTypes.bool,
        transformOrigin: PropTypes.bool,
      }),
      getOptions: PropTypes.func,
      onRequestClose: PropTypes.func.isRequired,
      overlayHidden: PropTypes.bool,
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
      timeout: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.shape({
          enter: PropTypes.number,
          exit: PropTypes.number,
        }),
      ]),
      disableScrollLock: PropTypes.bool,
      anchor: PropTypes.shape({
        x: PropTypes.oneOf([
          "inner-left",
          "inner-right",
          "center",
          "left",
          "right",
        ]),
        y: PropTypes.oneOf(["above", "below", "center", "top", "bottom"]),
      }),
    };
  }
}

export default forwardRef<HTMLDivElement, StrictProps>((props, ref) => (
  <FixedDialog {...props} forwardedRef={ref} />
));
