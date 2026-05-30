import { BOOST_GM_MULTIPLIER } from "@/config/contract";

/** Points per Hub action — must match Hub.sol constants */
export const POINTS_RULES = {
  freeGm: 10,
  paidGm: 20,
  freeDeploy: 20,
  paidDeploy: 40,
  referral: 200,
  boostGmMultiplier: BOOST_GM_MULTIPLIER,
} as const;

export type PointsAction = keyof typeof POINTS_RULES;

export function pointsForGm(isPaid: boolean, boosted = false): number {
  const base = isPaid ? POINTS_RULES.paidGm : POINTS_RULES.freeGm;
  return boosted ? base * POINTS_RULES.boostGmMultiplier : base;
}

export function pointsForDeploy(isPaid: boolean, boosted = false): number {
  const base = isPaid ? POINTS_RULES.paidDeploy : POINTS_RULES.freeDeploy;
  return boosted ? base * POINTS_RULES.boostGmMultiplier : base;
}
