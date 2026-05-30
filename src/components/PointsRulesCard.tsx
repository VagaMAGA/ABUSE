import Link from "next/link";

import { TOKEN_SYMBOL } from "@/config/app";
import { AIRDROP_MIN_POINTS } from "@/config/airdrop";
import { POINTS_RULES } from "@/config/points";
import { MIN_STAKE_A } from "@/config/staking";

export function PointsRulesCard() {
  return (
    <div className="uni-card-inset px-4 py-3">
      <p className="uni-label">Points System</p>
      <div className="uni-caption mt-2 space-y-2">
        <div className="space-y-1">
          <p>Free GM — +{POINTS_RULES.freeGm} pts</p>
          <p>Paid GM — +{POINTS_RULES.paidGm} pts</p>
        </div>

        <div className="space-y-1">
          <p>
            Boost Active — {POINTS_RULES.boostGmMultiplier}× points on GM &amp;
            Deploy
          </p>
          <p className="text-[var(--uni-text-tertiary)]">
            ↳ 1 free boost per day · lasts ~1 hour
          </p>
        </div>

        <div className="space-y-1">
          <p>Free Deploy — +{POINTS_RULES.freeDeploy} pts</p>
          <p>Paid Deploy — +{POINTS_RULES.paidDeploy} pts</p>
        </div>

        <div className="space-y-1">
          <p>Referral Code Redeemed — +{POINTS_RULES.referral} pts each</p>
          <p className="text-[var(--uni-text-tertiary)]">
            ↳ both you and your friend earn rewards
          </p>
        </div>

        <div className="space-y-1">
          <p>
            Redeem &amp; stake{" "}
            <span className="uni-text-accent font-semibold">{TOKEN_SYMBOL}</span>{" "}
            —{" "}
            <Link href="/stake" className="uni-link">
              claim &amp; stake
            </Link>
          </p>
          <p className="text-[var(--uni-text-tertiary)]">
            ↳ claim min {AIRDROP_MIN_POINTS.toLocaleString()} pts · stake min{" "}
            {MIN_STAKE_A} {TOKEN_SYMBOL}
          </p>
        </div>
      </div>
    </div>
  );
}
