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

const SECONDS_PER_YEAR = 365n * SECONDS_PER_DAY;

/** Nominal APY when the reward budget fully covers emissions at current TVL */
export function estimatedApyPercent(
  rewardReserveWei = BigInt(Number.MAX_SAFE_INTEGER) * 10n ** 18n,
  totalStakedWei = 0n,
): number {
  if (totalStakedWei === 0n || rewardReserveWei === 0n) {
    return rewardReserveWei === 0n ? 0 : STAKING_APY_PERCENT;
  }

  const annualEmissionWei =
    (REWARD_RATE_PER_STAKED_TOKEN * SECONDS_PER_YEAR * totalStakedWei) /
    REWARD_SCALE;
  if (annualEmissionWei === 0n) return STAKING_APY_PERCENT;
  if (rewardReserveWei >= annualEmissionWei) return STAKING_APY_PERCENT;

  const effective =
    Number((rewardReserveWei * 100n * REWARD_SCALE) / (totalStakedWei * SECONDS_PER_YEAR)) /
    Number(REWARD_RATE_PER_STAKED_TOKEN);
  return Math.min(STAKING_APY_PERCENT, Math.max(0, Math.round(effective)));
}

export function canStake(amountWei: bigint): boolean {
  return amountWei >= MIN_STAKE_WEI;
}
