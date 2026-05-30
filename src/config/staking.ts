/** Staking — must match StakePool.sol constants */
export const MIN_STAKE_A = 500;
export const MIN_STAKE_WEI = BigInt(MIN_STAKE_A) * BigInt(10 ** 18);

/** Fixed APY when reward pool is funded */
export const STAKING_APY_PERCENT = 100;

/** Per-staked-token rate (1e18 scale) — 100% APY: 1e18 / (365 * 86400) */
export const REWARD_RATE_PER_STAKED_TOKEN = 31_709_791_983n;

const SECONDS_PER_DAY = 86400n;
const REWARD_SCALE = 10n ** 18n;

/** Daily rewards for a staked balance at 100% APY */
export function userDailyRewards(staked: bigint): number {
  if (staked === 0n) return 0;
  const wei =
    (REWARD_RATE_PER_STAKED_TOKEN * SECONDS_PER_DAY * staked) / REWARD_SCALE;
  return Number(wei) / 1e18;
}

/** Total pool emission per day at current TVL */
export function poolDailyRewards(totalStaked: bigint): number {
  if (totalStaked === 0n) return 0;
  return userDailyRewards(totalStaked);
}

/** APY is fixed per staked token when the reward budget is sufficient */
export function estimatedApyPercent(): number {
  return STAKING_APY_PERCENT;
}

export function canStake(amountWei: bigint): boolean {
  return amountWei >= MIN_STAKE_WEI;
}
