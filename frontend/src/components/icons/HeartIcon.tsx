import React from "react";
import type { IconProps } from "./types.ts";

export interface HeartIconProps extends IconProps {
  filled?: boolean;
}

export const HeartIcon: React.FC<HeartIconProps> = ({
  size = 24,
  width,
  height,
  strokeWidth = 2,
  filled = false,
  fill,
  ...props
}) => {
  return (
    <svg
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 24 24"
      fill={fill ?? (filled ? "currentColor" : "none")}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
};

export default HeartIcon;
