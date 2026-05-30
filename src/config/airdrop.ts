/** Airdrop redemption — must match Hub.sol constants */
export const AIRDROP_MIN_POINTS = 500;
export const POINTS_PER_A_TOKEN = 100;

/** $A tokens per point spent (display: 100 pts → 1 $A) */
export function aTokensForPoints(points: number | bigint): number {
  const pts = Number(points);
  if (!Number.isFinite(pts) || pts <= 0) return 0;
  return pts / POINTS_PER_A_TOKEN;
}

/** Max points user can spend in one claim */
export function maxClaimPoints(userPoints: bigint): bigint {
  return userPoints;
}

export function canClaimAirdrop(userPoints: bigint): boolean {
  return userPoints >= BigInt(AIRDROP_MIN_POINTS);
}

export function pointsUntilClaim(userPoints: bigint): bigint {
  const min = BigInt(AIRDROP_MIN_POINTS);
  if (userPoints >= min) return BigInt(0);
  return min - userPoints;
}

export function claimProgressPercent(userPoints: bigint): number {
  const min = AIRDROP_MIN_POINTS;
  const pts = Number(userPoints);
  if (pts >= min) return 100;
  return Math.min(100, Math.round((pts / min) * 100));
}
