import React from "react";
import type { IconProps } from "./types.ts";

export const UserIcon: React.FC<IconProps> = ({
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
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2" />
    </svg>
  );
};

export default UserIcon;
