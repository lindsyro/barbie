import React from "react";
import type { IconProps } from "./types.ts";

export const ChevronRightIcon: React.FC<IconProps> = ({
  size = 10,
  width,
  height,
  strokeWidth = 1.5,
  ...props
}) => {
  return (
    <svg
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4.5 2.5L8 6L4.5 9.5" />
    </svg>
  );
};

export default ChevronRightIcon;
