import React from "react";
import type { IconProps } from "./types.ts";

export const ChevronDownIcon: React.FC<IconProps> = ({
  size = 12,
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
      <path d="M2.5 4.5L6 8L9.5 4.5" />
    </svg>
  );
};

export default ChevronDownIcon;
