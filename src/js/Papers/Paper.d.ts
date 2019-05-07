import * as React from 'react';
import { Props } from '../index';

export interface PaperProps extends Props {
  // for the `component` prop until refactored out
  [key: string]: any;

  component?: React.ReactType;
  componentRef?: (ref: React.ReactHTMLElement<any> | null) => null;
  children?: React.ReactNode;
  zDepth?: number;
  raiseOnHover?: boolean;
}

declare const Paper: React.ComponentClass<PaperProps>;
export default Paper;
