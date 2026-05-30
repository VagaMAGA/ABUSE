"use client";

import { useId } from "react";

type LogoLetterAProps = {
  size?: number;
  className?: string;
};

/** Stylized A from public/icon.svg — underline included */
export function LogoLetterA({ size = 12, className = "" }: LogoLetterAProps) {
  const uid = useId().replace(/:/g, "");
  const gradId = `logo-a-blood-${uid}`;

  return (
    <svg
      width={size}
      height={Math.round(size * 1.12)}
      viewBox="108 108 296 328"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient
          id={gradId}
          x1="140"
          y1="108"
          x2="372"
          y2="404"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ff2d55" />
          <stop offset="52%" stopColor="#ff6b35" />
          <stop offset="100%" stopColor="#ff5070" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradId})`}
        fillRule="evenodd"
        d="
          M 256 108
          L 372 404
          H 318
          L 292 332
          H 220
          L 194 404
          H 140
          L 256 108
          Z
          M 238 284
          H 274
          L 256 228
          Z
        "
      />
      <rect x="108" y="428" width="296" height="8" fill="#ff2d55" />
    </svg>
  );
}
