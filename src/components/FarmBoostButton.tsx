"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatEther } from "viem";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import {
  BOOST_FEE_WEI,
  BOOST_GM_MULTIPLIER,
  DEPLOY_CHAIN_ID,
  HUB_CONTRACT_ADDRESS,
  hubAbi,
} from "@/config/contract";
import { useHubStats } from "@/hooks/useHubStats";

type FarmBoostButtonProps = {
  disabled?: boolean;
  onSuccess?: () => void;
  variant?: "default" | "nav";
};

function formatBoostTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function FarmBoostButton({
  disabled,
  onSuccess,
  variant = "default",
}: FarmBoostButtonProps) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const syncedTxHash = useRef<string | undefined>(undefined);

  const {
    boostActiveUntil,
    freeBoostAvailable,
    boostFeeOnChain,
    boostActive,
    refreshStats,
  } = useHubStats();

  const { data: hash, isPending, writeContract, error: writeError } =
    useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!isSuccess || !hash) return;
    if (syncedTxHash.current === hash) return;
    syncedTxHash.current = hash;
    const sync = async () => {
      await refreshStats();
      window.setTimeout(() => void refreshStats(), 800);
      onSuccess?.();
    };
    void sync();
  }, [isSuccess, hash, refreshStats, onSuccess]);

  const feeWei = boostFeeOnChain ?? BOOST_FEE_WEI;
  const feeLabel = formatEther(feeWei);
  const isPaidBoost = freeBoostAvailable === false;
  const active = boostActive ?? false;

  const secondsLeft = useMemo(() => {
    if (!boostActiveUntil) return 0;
    const until = Number(boostActiveUntil);
    if (until === 0) return 0;
    return Math.max(0, until - now);
  }, [boostActiveUntil, now]);

  const handleBoost = () => {
    writeContract({
      address: HUB_CONTRACT_ADDRESS,
      abi: hubAbi,
      functionName: "boost",
      chainId: DEPLOY_CHAIN_ID,
      value: isPaidBoost ? feeWei : BigInt(0),
    });
  };

  const busy = isPending || isConfirming;
  const priceLabel = isPaidBoost ? `${feeLabel} ETH` : "Free";

  const ariaLabel = active
    ? `Boost active, ${formatBoostTime(secondsLeft)} left`
    : busy
      ? "Boost transaction in progress"
      : `Activate ${BOOST_GM_MULTIPLIER}× boost · ${priceLabel}`;

  if (variant === "nav") {
    const navHint = busy
      ? "…"
      : active
        ? secondsLeft > 0
          ? formatBoostTime(secondsLeft)
          : "…"
        : priceLabel;

    return (
      <div className="uni-nav-boost-wrap shrink-0">
        <button
          type="button"
          onClick={handleBoost}
          disabled={disabled || busy}
          className={`uni-nav-boost ${active ? "uni-nav-boost--live" : ""}`}
          aria-label={ariaLabel}
          title={
            writeError
              ? writeError.message.split("\n")[0]
              : `${BOOST_GM_MULTIPLIER}× Boost · ${navHint}`
          }
        >
          <span className="uni-nav-boost-ring" aria-hidden />
          <span className="uni-nav-boost-face">
            <span className="uni-nav-boost-mark">{BOOST_GM_MULTIPLIER}×</span>
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <div
        className={`uni-farm-boost-shell ${active ? "uni-farm-boost-shell--live" : ""}`}
      >
        <button
          type="button"
          onClick={handleBoost}
          disabled={disabled || busy}
          className={`uni-farm-boost-btn ${active ? "uni-farm-boost-btn--live" : ""}`}
          aria-label={
            active
              ? `Boost active, ${formatBoostTime(secondsLeft)} left`
              : `Activate ${BOOST_GM_MULTIPLIER}× boost`
          }
        >
          <span className="uni-farm-boost-mark-wrap">
            <span className="uni-farm-boost-mark">{BOOST_GM_MULTIPLIER}×</span>
          </span>
          <span className="uni-farm-boost-title">
            {busy ? "…" : active ? "Extend" : "Boost"}
          </span>
          <span className="uni-farm-boost-sub">
            {busy
              ? "Wait"
              : active
                ? secondsLeft > 0
                  ? formatBoostTime(secondsLeft)
                  : "…"
                : priceLabel}
          </span>
        </button>
      </div>
      {writeError && (
        <p className="max-w-[5.5rem] text-right text-[10px] leading-tight text-[var(--uni-critical)]">
          {writeError.message.split("\n")[0]}
        </p>
      )}
    </div>
  );
}
