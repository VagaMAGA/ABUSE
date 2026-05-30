"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

import { AppNav } from "@/components/AppNav";
import { ConnectWallet } from "@/components/ConnectWallet";
import { PreviewBanner } from "@/components/PreviewBanner";
import { APP_NAME, TOKEN_SYMBOL } from "@/config/app";
import {
  AIRDROP_MIN_POINTS,
  POINTS_PER_A_TOKEN,
  aTokensForPoints,
  canClaimAirdrop,
  claimProgressPercent,
  pointsUntilClaim,
} from "@/config/airdrop";
import { DEPLOY_CHAIN_ID } from "@/config/contract";
import {
  isAirdropLiveMode,
  isHubLiveMode,
  PREVIEW_A_CLAIMED,
  PREVIEW_CLAIM_POINTS,
  PREVIEW_POINTS,
} from "@/config/preview";
import { useAirdrop } from "@/hooks/useAirdrop";
import { useHubStats } from "@/hooks/useHubStats";

export function AirdropApp() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const wrongChain = isConnected && chainId !== DEPLOY_CHAIN_ID;

  const { points: livePoints, refreshStats } = useHubStats();
  const {
    points: hookPoints,
    airdropConfigured,
    tokenBalance,
    totalClaimed,
    claim,
    refresh,
    isPending,
    isConfirming,
    isSuccess,
    writeError,
    reset,
  } = useAirdrop();

  const isLiveMode = isAirdropLiveMode({
    isConnected,
    wrongChain,
    airdropConfigured,
  });
  const hubLive = isHubLiveMode({ isConnected, wrongChain });

  const userPoints = isLiveMode
    ? (hookPoints ?? livePoints ?? BigInt(0))
    : BigInt(PREVIEW_POINTS);
  const displayClaimed = isLiveMode ? totalClaimed : PREVIEW_A_CLAIMED;
  const displayBalance = isLiveMode ? tokenBalance : PREVIEW_A_CLAIMED;
  const eligible = canClaimAirdrop(userPoints);
  const progress = claimProgressPercent(userPoints);
  const remaining = pointsUntilClaim(userPoints);

  const [spendPoints, setSpendPoints] = useState(AIRDROP_MIN_POINTS);
  const maxSpend = Number(userPoints);

  useEffect(() => {
    if (!eligible) {
      setSpendPoints(AIRDROP_MIN_POINTS);
      return;
    }
    setSpendPoints((prev) =>
      Math.min(Math.max(prev, AIRDROP_MIN_POINTS), maxSpend),
    );
  }, [eligible, maxSpend]);

  useEffect(() => {
    if (isSuccess) {
      void refresh();
      void refreshStats();
      reset();
    }
  }, [isSuccess, refresh, refreshStats, reset]);

  const receiveAmount = useMemo(
    () => aTokensForPoints(spendPoints),
    [spendPoints],
  );

  const actionsDisabled = !isLiveMode;

  return (
    <>
      <AppNav />

      <header className="uni-card px-5 py-5 text-center">
        <p className="uni-eyebrow">Points → token · Base</p>
        <h1 className="uni-title mt-2 text-3xl">Airdrop</h1>
        <p className="uni-body mx-auto mt-2 max-w-sm text-sm">
          Earn Hub points from GM, deploy, and referrals — then redeem for{" "}
          <span className="uni-text-accent font-semibold">{TOKEN_SYMBOL}</span>{" "}
          on-chain.
        </p>
        <p className="uni-caption mt-3 text-center">
          <Link href="/" className="uni-link">
            ← {APP_NAME} App
          </Link>
        </p>
      </header>

      {!hubLive && <PreviewBanner />}

      <div className="uni-card px-4 py-5">
        <ConnectWallet />
      </div>

      {wrongChain && hubLive && (
        <button
          type="button"
          className="uni-btn uni-btn-primary"
          disabled={isSwitching}
          onClick={() => switchChain({ chainId: DEPLOY_CHAIN_ID })}
        >
          {isSwitching ? "Switching…" : "Switch to Base"}
        </button>
      )}

      <div className="uni-card px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <p className="uni-label">Your points</p>
          {!isLiveMode && (
            <span className="uni-caption text-[var(--uni-text-tertiary)]">
              demo
            </span>
          )}
        </div>
        <p className="uni-mono mt-1 text-3xl font-bold uni-text-accent">
          {userPoints.toString()}
        </p>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="uni-label">
              Progress to claim ({AIRDROP_MIN_POINTS} pts min)
            </p>
            <p className="uni-mono text-sm font-semibold">{progress}%</p>
          </div>
          <div className="uni-badges-collection-bar">
            <div
              className="uni-badges-collection-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          {!eligible && (
            <p className="uni-caption mt-2">
              {remaining.toString()} pts until you can claim {TOKEN_SYMBOL}
            </p>
          )}
          {eligible && (
            <p className="uni-caption mt-2 text-[var(--uni-success)]">
              Unlocked — redeem points below
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="uni-card-inset px-3 py-2.5">
          <p className="uni-label">{TOKEN_SYMBOL} balance</p>
          <p className="uni-mono mt-0.5 text-lg font-semibold">{displayBalance}</p>
        </div>
        <div className="uni-card-inset px-3 py-2.5">
          <p className="uni-label">Total claimed</p>
          <p className="uni-mono mt-0.5 text-lg font-semibold">{displayClaimed}</p>
        </div>
      </div>

      <div className="uni-card px-4 py-4">
        <p className="uni-label">Redeem points</p>
        <p className="uni-caption mt-1">
          Rate: {POINTS_PER_A_TOKEN} pts = 1 {TOKEN_SYMBOL}
        </p>

        <label className="mt-4 block">
          <span className="uni-label">Points to spend</span>
          <input
            type="range"
            min={AIRDROP_MIN_POINTS}
            max={Math.max(AIRDROP_MIN_POINTS, maxSpend)}
            step={POINTS_PER_A_TOKEN}
            value={Math.min(spendPoints, Math.max(AIRDROP_MIN_POINTS, maxSpend))}
            disabled={!eligible || actionsDisabled}
            onChange={(e) => setSpendPoints(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--uni-pink)]"
          />
          <p className="uni-mono mt-2 text-center text-lg font-semibold">
            {Math.min(spendPoints, Math.max(AIRDROP_MIN_POINTS, maxSpend))} pts
            {" → "}
            <span className="uni-text-accent">
              {receiveAmount.toFixed(2)} {TOKEN_SYMBOL}
            </span>
          </p>
        </label>

        <button
          type="button"
          className="uni-btn uni-btn-primary mt-4 w-full"
          disabled={
            actionsDisabled || !eligible || isPending || isConfirming
          }
          onClick={() => claim(BigInt(spendPoints))}
        >
          {isPending
            ? "Confirm in wallet…"
            : isConfirming
              ? "Claiming…"
              : `Claim ${receiveAmount.toFixed(2)} ${TOKEN_SYMBOL}`}
        </button>

        {!eligible && !actionsDisabled && (
          <p className="uni-caption mt-3 text-center">
            Need at least {AIRDROP_MIN_POINTS} points to claim.
          </p>
        )}

        {writeError && (
          <p className="uni-caption mt-3 text-center text-[var(--uni-critical)]">
            {writeError.message.split("\n")[0]}
          </p>
        )}

        {isSuccess && (
          <p className="uni-caption mt-3 text-center text-[var(--uni-success)]">
            {TOKEN_SYMBOL} sent to your wallet!
          </p>
        )}
      </div>

      <div className="uni-card-inset px-4 py-3">
        <p className="uni-label">How it works</p>
        <ol className="uni-caption mt-2 list-decimal space-y-1 pl-4">
          <li>Farm points on App, Farm, and Refer tabs.</li>
          <li>
            Reach {AIRDROP_MIN_POINTS}+ points to unlock redemption.
          </li>
          <li>
            Choose how many points to burn — receive {TOKEN_SYMBOL} instantly.
          </li>
          <li>Remaining points stay on your Hub balance for badges & rank.</li>
        </ol>
      </div>

      {!isLiveMode && (
        <p className="uni-caption text-center">
          Demo: {PREVIEW_CLAIM_POINTS} pts would claim{" "}
          {aTokensForPoints(PREVIEW_CLAIM_POINTS).toFixed(1)} {TOKEN_SYMBOL}.{" "}
          <Link href="/farm" className="uni-link">
            Farm points →
          </Link>
        </p>
      )}

      {hubLive && !airdropConfigured && (
        <div className="uni-card uni-card-critical px-4 py-4">
          <p className="uni-caption">
            Deploy <span className="uni-code">AbuseToken.sol</span>, call{" "}
            <span className="uni-code">setAirdropToken</span> on Hub, and set{" "}
            <span className="uni-code">ABUSE_TOKEN_ADDRESS</span> in config.
          </p>
        </div>
      )}
    </>
  );
}
