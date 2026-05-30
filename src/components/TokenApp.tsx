"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

import { AirdropClaimPanel } from "@/components/AirdropClaimPanel";
import { AppNav } from "@/components/AppNav";
import { ConnectWallet } from "@/components/ConnectWallet";
import { PreviewBanner } from "@/components/PreviewBanner";
import { StakePanel } from "@/components/StakePanel";
import { APP_NAME, TOKEN_SYMBOL } from "@/config/app";
import { AIRDROP_MIN_POINTS } from "@/config/airdrop";
import { DEPLOY_CHAIN_ID } from "@/config/contract";
import { MIN_STAKE_A } from "@/config/staking";
import {
  isAirdropLiveMode,
  isHubLiveMode,
  isStakingLiveMode,
} from "@/config/preview";
import { useAirdrop } from "@/hooks/useAirdrop";
import { useStaking } from "@/hooks/useStaking";

type TokenTab = "claim" | "stake";

export function TokenApp() {
  const searchParams = useSearchParams();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const { airdropConfigured } = useAirdrop();
  const { stakingConfigured } = useStaking();

  const wrongChain = isConnected && chainId !== DEPLOY_CHAIN_ID;
  const hubLive = isHubLiveMode({ isConnected, wrongChain });
  const claimLive = isAirdropLiveMode({
    isConnected,
    wrongChain,
    airdropConfigured,
  });
  const stakeLive = isStakingLiveMode({
    isConnected,
    wrongChain,
    stakingConfigured,
  });

  const [tab, setTab] = useState<TokenTab>("claim");

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "claim" || t === "stake") setTab(t);
  }, [searchParams]);

  const onClaimSuccess = useCallback(() => {
    setTab("stake");
  }, []);

  return (
    <>
      <AppNav />

      <header className="uni-card px-5 py-5 text-center">
        <p className="uni-eyebrow">Points &amp; pool · Base</p>
        <h1 className="uni-title mt-2 text-3xl">{TOKEN_SYMBOL}</h1>
        <p className="uni-body mx-auto mt-2 max-w-sm text-sm">
          Claim {TOKEN_SYMBOL} with Hub points, then stake to earn from the
          reward pool.
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

      {wrongChain && (
        <button
          type="button"
          className="uni-btn uni-btn-primary"
          disabled={isSwitching}
          onClick={() => switchChain({ chainId: DEPLOY_CHAIN_ID })}
        >
          {isSwitching ? "Switching…" : "Switch to Base"}
        </button>
      )}

      <div className="uni-card px-2 py-2">
        <div className="uni-tabs">
          <button
            type="button"
            className={`uni-tab ${tab === "claim" ? "uni-tab-active" : ""}`}
            onClick={() => setTab("claim")}
          >
            Claim
          </button>
          <button
            type="button"
            className={`uni-tab ${tab === "stake" ? "uni-tab-active" : ""}`}
            onClick={() => setTab("stake")}
          >
            Stake
          </button>
        </div>
      </div>

      {tab === "claim" ? (
        <AirdropClaimPanel isLiveMode={claimLive} onSuccess={onClaimSuccess} />
      ) : (
        <StakePanel isLiveMode={stakeLive} />
      )}

      <div className="uni-card-inset px-4 py-3">
        <p className="uni-label">How it works</p>
        <ol className="uni-caption mt-2 list-decimal space-y-1 pl-4">
          <li>Farm points on App, Farm, and Refer tabs.</li>
          <li>
            Claim tab — reach {AIRDROP_MIN_POINTS}+ pts, redeem 1:1 for{" "}
            {TOKEN_SYMBOL}.
          </li>
          <li>
            Stake tab — lock {TOKEN_SYMBOL} (min {MIN_STAKE_A}) to earn pool
            rewards.
          </li>
          <li>Remaining points stay for leaderboard rank only.</li>
          <li>
            {TOKEN_SYMBOL} badges track lifetime claimed total — progress
            never drops after you claim.
          </li>
        </ol>
      </div>

      {hubLive && !airdropConfigured && tab === "claim" && (
        <div className="uni-card uni-card-critical px-4 py-4">
          <p className="uni-caption">
            Deploy <span className="uni-code">AbuseToken.sol</span>, call{" "}
            <span className="uni-code">setAirdropToken</span> on Hub, and set{" "}
            <span className="uni-code">ABUSE_TOKEN_ADDRESS</span> in config.
          </p>
        </div>
      )}

      {hubLive && !stakingConfigured && tab === "stake" && (
        <div className="uni-card uni-card-critical px-4 py-4">
          <p className="uni-caption">
            Deploy <span className="uni-code">StakePool.sol</span>, fund the
            reward pool, and set{" "}
            <span className="uni-code">STAKE_POOL_ADDRESS</span> in config.
          </p>
        </div>
      )}

      {!claimLive && !stakeLive && (
        <p className="uni-caption text-center">
          Demo mode — connect on Base with contracts configured for live txs.
        </p>
      )}
    </>
  );
}
