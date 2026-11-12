import React from "react";
import type { BrowserType } from "../../types";

interface BrowserIconProps {
  browser?: BrowserType;
  size?: number;
  className?: string;
}

export const BrowserIcon: React.FC<BrowserIconProps> = ({
  size = 28,
  className,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="22" fill="#0060df" fillOpacity="0.1" />
      {/* Firefox Globe */}
      <circle cx="24" cy="24" r="16" fill="#2563eb" />
      {/* Inner continents */}
      <path
        d="M19 16C23 14 28 16 30 19C32 22 31 27 28 30C25 33 21 34 18 32C15 30 14 26 16 22"
        fill="#3b82f6"
      />
      {/* Fox curl / Flame outer swoosh */}
      <path
        d="M41 21C39 12 30 7 21 8C20 9 20 11 21 12C21 13 22 14 21 15C19 15 17 14 15 13C12 16 10 20 10 25C10 33 16 40 24 40C33 40 40 33 40 24C40 23 40 22 41 21Z"
        fill="#f97316"
      />
      {/* Golden tail swoop */}
      <path
        d="M39 24C38 31 32 37 24 37C19 37 14 33 13 28C14 29 17 31 20 30C25 29 28 25 31 22C33 20 36 21 39 24Z"
        fill="#eab308"
      />
      {/* Fox head accent */}
      <path
        d="M36 12C33 10 29 9 26 9C27 10 29 12 30 14C33 14 35 13 36 12Z"
        fill="#ea580c"
      />
    </svg>
  );
};
