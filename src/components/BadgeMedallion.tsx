import { BadgeIcon } from "@/components/BadgeIcon";
import type { BadgeDefinition, BadgeKind } from "@/config/badges";

const KIND_CODE: Record<BadgeKind, string> = {
  gm: "GM",
  deploy: "DEP",
  points: "PTS",
  rank: "RNK",
  collection: "COL",
  referral: "REF",
};

type BadgeMedallionProps = {
  badge: BadgeDefinition;
};

/** Tier ring + inner symbol box */
export function BadgeMedallion({ badge }: BadgeMedallionProps) {
  const kindCode = KIND_CODE[badge.kind];

  return (
    <div className="uni-medallion-ring" aria-hidden>
      <span className="uni-medallion-ring-outer" />
      <span className="uni-medallion-ring-inner">
        <BadgeIcon kind={badge.kind} className="h-4 w-4" />
        <span className="uni-medallion-ring-label">{kindCode}</span>
      </span>
    </div>
  );
}
