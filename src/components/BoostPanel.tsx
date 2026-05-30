"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatEther } from "viem";

import {
  BOOST_DURATION_SEC,
  BOOST_FEE_WEI,
  BOOST_GM_MULTIPLIER,
  DEPLOY_CHAIN_ID,
  HUB_CONTRACT_ADDRESS,
  hubAbi,
} from "@/config/contract";
import { POINTS_RULES } from "@/config/points";
import { useHubStats } from "@/hooks/useHubStats";

function explorerTxUrl(hash: string) {
  return `https://basescan.org/tx/${hash}`;
}

type BoostPanelProps = {
  disabled?: boolean;
  preview?: boolean;
  onSuccess?: () => void;
};

export function BoostPanel({ disabled, preview, onSuccess }: BoostPanelProps) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const syncedTxHash = useRef<string | undefined>(undefined);

  const {
    boostActiveUntil,
    freeBoostAvailable,
    boostCount,
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
  const isPaidBoost = preview ? false : freeBoostAvailable === false;
  const active = preview ? true : (boostActive ?? false);

  const secondsLeft = useMemo(() => {
    if (preview) return 42 * 60 + 18;
    if (!boostActiveUntil) return 0;
    const until = Number(boostActiveUntil);
    if (until === 0) return 0;
    return Math.max(0, until - now);
  }, [boostActiveUntil, now, preview]);

  const handleBoost = () => {
    writeContract({
      address: HUB_CONTRACT_ADDRESS,
      abi: hubAbi,
      functionName: "boost",
      chainId: DEPLOY_CHAIN_ID,
      value: isPaidBoost ? feeWei : BigInt(0),
    });
  };

  const durationMin = Math.round(BOOST_DURATION_SEC / 60);

  return (
    <div className="flex w-full flex-col gap-4">
      {active && (
        <div className="uni-airdrop-callout px-3 py-2.5 text-center">
          <p className="uni-label text-[var(--uni-success)]">
            {BOOST_GM_MULTIPLIER}× Boost active
          </p>
          <p className="uni-caption mt-1">
            {secondsLeft > 0
              ? `${Math.floor(secondsLeft / 60)}m ${secondsLeft % 60}s left`
              : "Refreshing…"}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Stat
          label="Boosts used"
          value={preview ? "3" : boostCount?.toString() ?? "0"}
        />
        <Stat
          label="While active"
          value={`${BOOST_GM_MULTIPLIER}× pts`}
        />
      </div>

      <button
        type="button"
        onClick={handleBoost}
        disabled={disabled || preview || isPending || isConfirming}
        className="uni-btn uni-btn-primary"
      >
        {isPending
          ? "Confirm in wallet"
          : isConfirming
            ? "Processing…"
            : isPaidBoost
              ? `Boost · ${feeLabel} ETH`
              : "Boost · Free"}
      </button>

      <p className="uni-caption text-center">
        {active
          ? `Stack refreshes on new Boost · ${durationMin} min window`
          : `Free Boost once per day · ${durationMin} min of ${BOOST_GM_MULTIPLIER}× on GM & deploy`}
      </p>

      {writeError && (
        <p className="uni-caption text-center text-[var(--uni-critical)]">
          {writeError.message.split("\n")[0]}
        </p>
      )}

      {isSuccess && hash && (
        <a
          href={explorerTxUrl(hash)}
          target="_blank"
          rel="noreferrer"
          className="uni-link uni-caption text-center"
        >
          View on Basescan
        </a>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="uni-card-inset px-3 py-2.5">
      <p className="uni-label">{label}</p>
      <p className="uni-mono mt-0.5 text-lg font-semibold text-[var(--uni-text)]">
        {value}
      </p>
    </div>
  );
}
