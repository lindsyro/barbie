import React from "react";
import type { IconProps } from "./types.ts";

export const ArrowRightIcon: React.FC<IconProps> = ({
  size = 24,
  width,
  height,
  strokeWidth = 2,
  ...props
}) => {
  return (
    <svg
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
};

export default ArrowRightIcon;
