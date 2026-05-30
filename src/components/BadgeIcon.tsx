import type { BadgeKind, BadgeTier } from "@/config/badges";
import { badgeTierLabel } from "@/config/badges";

type BadgeIconProps = {
  kind: BadgeKind;
  className?: string;
};

export function BadgeIcon({ kind, className = "h-6 w-6" }: BadgeIconProps) {
  switch (kind) {
    case "gm":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="10" y="3" width="4" height="4" fill="currentColor" />
          <rect x="3" y="10" width="4" height="4" fill="currentColor" />
          <rect x="17" y="10" width="4" height="4" fill="currentColor" />
          <rect x="10" y="17" width="4" height="4" fill="currentColor" />
          <rect
            x="7"
            y="7"
            width="10"
            height="10"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "deploy":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 8 L12 4 L20 8 V16 L12 20 L4 16 Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="miter"
          />
          <path
            d="M12 4 V20 M4 8 L20 16 M20 8 L4 16"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.55"
          />
        </svg>
      );
    case "token":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3 L15 9 H21 L16 13 L18 21 L12 17 L6 21 L8 13 L3 9 H9 Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="miter"
          />
        </svg>
      );
    case "rank":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="5" y="14" width="14" height="6" stroke="currentColor" strokeWidth="2" />
          <rect x="9" y="8" width="6" height="6" stroke="currentColor" strokeWidth="2" />
          <rect x="11" y="3" width="2" height="5" fill="currentColor" />
        </svg>
      );
    case "collection":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="5" width="7" height="9" stroke="currentColor" strokeWidth="2" />
          <rect x="14" y="5" width="7" height="9" stroke="currentColor" strokeWidth="2" />
          <rect x="8" y="10" width="8" height="9" fill="currentColor" opacity="0.35" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "referral":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="8" width="7" height="7" stroke="currentColor" strokeWidth="2" />
          <rect x="14" y="8" width="7" height="7" stroke="currentColor" strokeWidth="2" />
          <path d="M10.5 11.5 H13.5 M12 10 V13" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
  }
}

export function badgeTierClass(tier: BadgeTier): string {
  return `uni-badge-medallion-${tier}`;
}

export function badgeTierChipClass(tier: BadgeTier): string {
  return `uni-badge-tier-chip uni-badge-tier-${tier}`;
}

export { badgeTierLabel };

export function badgeThresholdLabel(
  kind: BadgeKind,
  threshold: number,
): string {
  if (kind === "rank") return `#${threshold}`;
  if (kind === "collection") return `${threshold} badges`;
  if (kind === "referral") return `${threshold} friends`;
  if (kind === "token") return `${threshold} $A`;
  return `×${threshold}`;
}
