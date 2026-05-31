"use client";

import { useEffect, useMemo, useState } from "react";
import { parseUnits } from "viem";

import { TOKEN_SYMBOL } from "@/config/app";
import {
  MIN_STAKE_A,
  MIN_STAKE_WEI,
  estimatedApyPercent,
  poolDailyRewards,
  userDailyRewards,
  STAKING_APY_PERCENT,
} from "@/config/staking";
import { useStaking } from "@/hooks/useStaking";

type StakePanelProps = {
  canAct: boolean;
};

export function StakePanel({ canAct }: StakePanelProps) {
  const {
    staked,
    earned,
    totalStaked,
    rewardReserve,
    rewardReserveWei,
    walletBalance,
    stakedWei,
    earnedWei,
    totalStakedWei,
    walletBalanceWei,
    stake,
    unstake,
    claimReward,
    exit,
    refresh,
    isPending,
    isConfirming,
    isSuccess,
    writeError,
    reset,
  } = useStaking();

  const dailyRewards = userDailyRewards(stakedWei);
  const apy = estimatedApyPercent(rewardReserveWei, totalStakedWei);
  const rewardsPaused = canAct && rewardReserveWei === BigInt(0);

  const [stakeAmount, setStakeAmount] = useState(String(MIN_STAKE_A));
  const [unstakeAmount, setUnstakeAmount] = useState("");

  useEffect(() => {
    if (isSuccess) {
      void refresh();
      reset();
      setUnstakeAmount("");
    }
  }, [isSuccess, refresh, reset]);

  const stakeWei = useMemo(() => {
    try {
      return parseUnits(stakeAmount || "0", 18);
    } catch {
      return BigInt(0);
    }
  }, [stakeAmount]);

  const unstakeWei = useMemo(() => {
    try {
      return parseUnits(unstakeAmount || "0", 18);
    } catch {
      return BigInt(0);
    }
  }, [unstakeAmount]);

  const canStakeNow =
    canAct &&
    stakeWei >= MIN_STAKE_WEI &&
    stakeWei <= walletBalanceWei;

  const canUnstakeNow =
    canAct && unstakeWei > BigInt(0) && unstakeWei <= stakedWei;

  const canClaimNow = canAct && earnedWei > BigInt(0);

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <div className="uni-card-inset px-3 py-2.5">
          <p className="uni-label">Wallet {TOKEN_SYMBOL}</p>
          <p className="uni-mono mt-0.5 text-lg font-semibold">{walletBalance}</p>
        </div>
        <div className="uni-card-inset px-3 py-2.5">
          <p className="uni-label">Staked</p>
          <p className="uni-mono mt-0.5 text-lg font-semibold uni-text-accent">
            {staked}
          </p>
        </div>
        <div className="uni-card-inset px-3 py-2.5">
          <p className="uni-label">Pending rewards</p>
          <p className="uni-mono mt-0.5 text-lg font-semibold">{earned}</p>
        </div>
        <div className="uni-card-inset px-3 py-2.5">
          <p className="uni-label">Est. APY</p>
          <p className="uni-mono mt-0.5 text-lg font-semibold">
            {apy > 0 ? `${apy}%` : "—"}
          </p>
        </div>
      </div>

      <div className="uni-card-inset px-4 py-3">
        <p className="uni-label">Pool stats</p>
        <div className="uni-caption mt-2 space-y-1">
          <p>
            Total staked: {totalStaked} {TOKEN_SYMBOL}
          </p>
          <p>
            Rewards remaining: {rewardReserve} {TOKEN_SYMBOL}
          </p>
          {rewardsPaused && (
            <p className="text-[var(--uni-warning)]">
              Reward pool depleted — accrual paused. Unstake anytime.
            </p>
          )}
          {canAct && apy > 0 && apy < STAKING_APY_PERCENT && (
            <p className="text-[var(--uni-text-tertiary)]">
              Effective APY capped by remaining budget (~{apy}% at current TVL)
            </p>
          )}
          <p>
            Pool emission: ~{poolDailyRewards(totalStakedWei).toFixed(2)}{" "}
            {TOKEN_SYMBOL}/day
          </p>
          {dailyRewards > 0 && (
            <p className="text-[var(--uni-success)]">
              Your share: ~{dailyRewards.toFixed(4)} {TOKEN_SYMBOL}/day
            </p>
          )}
        </div>
      </div>

      <div className="uni-card px-4 py-4">
        <p className="uni-label">Stake {TOKEN_SYMBOL}</p>
        <p className="uni-caption mt-1">
          Min {MIN_STAKE_A} {TOKEN_SYMBOL}
          {apy > 0 ? ` · ${apy}% APY` : ""}
        </p>
        <input
          type="number"
          min={MIN_STAKE_A}
          step={1}
          value={stakeAmount}
          disabled={!canAct}
          onChange={(e) => setStakeAmount(e.target.value)}
          className="uni-input mt-3 w-full"
          placeholder={String(MIN_STAKE_A)}
        />
        <button
          type="button"
          className="uni-btn uni-btn-primary mt-3 w-full"
          disabled={!canAct || !canStakeNow || isPending || isConfirming}
          onClick={() => void stake(stakeWei)}
        >
          {isPending
            ? "Confirm in wallet…"
            : isConfirming
              ? "Staking…"
              : `Stake ${stakeAmount || MIN_STAKE_A} ${TOKEN_SYMBOL}`}
        </button>
      </div>

      <div className="uni-card px-4 py-4">
        <p className="uni-label">Unstake</p>
        <input
          type="number"
          min={0}
          step={1}
          value={unstakeAmount}
          disabled={!canAct || stakedWei === BigInt(0)}
          onChange={(e) => setUnstakeAmount(e.target.value)}
          className="uni-input mt-3 w-full"
          placeholder="0"
        />
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            className="uni-btn uni-btn-secondary flex-1"
            disabled={!canAct || !canUnstakeNow || isPending || isConfirming}
            onClick={() => void unstake(unstakeWei)}
          >
            Unstake
          </button>
          <button
            type="button"
            className="uni-btn uni-btn-secondary flex-1"
            disabled={!canAct || !canClaimNow || isPending || isConfirming}
            onClick={() => void claimReward()}
          >
            Claim rewards
          </button>
        </div>
        <button
          type="button"
          className="uni-btn mt-2 w-full"
          disabled={
            !canAct ||
            (stakedWei === BigInt(0) && earnedWei === BigInt(0)) ||
            isPending ||
            isConfirming
          }
          onClick={() => void exit()}
        >
          Exit — claim all &amp; unstake
        </button>

        {writeError && (
          <p className="uni-caption mt-3 text-center text-[var(--uni-critical)]">
            {writeError.message.split("\n")[0]}
          </p>
        )}

        {isSuccess && (
          <p className="uni-caption mt-3 text-center text-[var(--uni-success)]">
            Transaction confirmed!
          </p>
        )}
      </div>
    </>
  );
}
