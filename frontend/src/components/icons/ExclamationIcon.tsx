import React from "react";
import type { IconProps } from "./types.ts";

export const ExclamationIcon: React.FC<IconProps> = ({
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
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
};

export default ExclamationIcon;
