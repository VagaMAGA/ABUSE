import {
  BOOST_GM_MULTIPLIER,
  FREE_GM_PER_DAY,
  POINTS_PER_REFERRAL,
} from "@/config/contract";
import { POINTS_RULES } from "@/config/points";

export const FARM_RANKS = [
  { id: "sprout", label: "Sprout", minPoints: 0 },
  { id: "acid", label: "Acid Farmer", minPoints: 200 },
  { id: "turbo", label: "Turbo", minPoints: 500 },
  { id: "legend", label: "Legend", minPoints: 1500 },
] as const;

export const DAILY_FREE_GM_TARGET = FREE_GM_PER_DAY;

/** Max free points from perfect daily loop (Boost + 2 GM + deploy) */
export const DAILY_FREE_POINTS_MAX =
  (DAILY_FREE_GM_TARGET * POINTS_RULES.freeGm + POINTS_RULES.freeDeploy) *
  BOOST_GM_MULTIPLIER;

export const FARM_SHARE_STORAGE_KEY = "abuse_farm_shared";

export type FarmRank = (typeof FARM_RANKS)[number];

export function farmRankForPoints(points: number): FarmRank {
  let current: FarmRank = FARM_RANKS[0];
  for (const rank of FARM_RANKS) {
    if (points >= rank.minPoints) current = rank;
  }
  return current;
}

export function nextFarmRank(points: number) {
  for (const rank of FARM_RANKS) {
    if (points < rank.minPoints) return rank;
  }
  return null;
}

export function rankProgressPercent(points: number): number {
  const next = nextFarmRank(points);
  if (!next) return 100;
  const current = farmRankForPoints(points);
  const span = next.minPoints - current.minPoints;
  if (span <= 0) return 100;
  return Math.min(100, Math.round(((points - current.minPoints) / span) * 100));
}

export function simulateReferralPoints(friendsInvited: number): number {
  return Math.max(0, friendsInvited) * POINTS_PER_REFERRAL;
}

export function simulateDailyPoints(
  freeGms: number,
  includeDeploy: boolean,
  withBoost = true,
): number {
  const gms = Math.min(DAILY_FREE_GM_TARGET, Math.max(0, freeGms));
  const gmPts = gms * POINTS_RULES.freeGm;
  const deployPts = includeDeploy ? POINTS_RULES.freeDeploy : 0;
  const total = gmPts + deployPts;
  return withBoost ? total * BOOST_GM_MULTIPLIER : total;
}
