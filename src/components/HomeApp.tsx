"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

import { APP_NAME, TOKEN_SYMBOL } from "@/config/app";
import { AppNav } from "@/components/AppNav";
import { ConnectWallet } from "@/components/ConnectWallet";
import { PreviewBanner } from "@/components/PreviewBanner";
import { BoostPanel } from "@/components/BoostPanel";
import { DeployPanel } from "@/components/DeployPanel";
import { GmPanel } from "@/components/GmPanel";
import {
  DEPLOY_CHAIN_ID,
  BOOST_GM_MULTIPLIER,
} from "@/config/contract";
import { POINTS_PER_REFERRAL } from "@/config/referral";
import {
  isHubLiveMode,
  PREVIEW_DEPLOY_COUNT,
  PREVIEW_POINTS,
} from "@/config/preview";
import { PointsRulesCard } from "@/components/PointsRulesCard";
import { useFarcasterMiniApp } from "@/hooks/useFarcasterMiniApp";
import { useHubStats } from "@/hooks/useHubStats";

type Tab = "gm" | "deploy" | "boost";

export function HomeApp() {
  const { inMiniApp } = useFarcasterMiniApp();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("gm");

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "gm" || t === "deploy" || t === "boost") setTab(t);
  }, [searchParams]);
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const wrongChain = isConnected && chainId !== DEPLOY_CHAIN_ID;

  const {
    deployCount,
    freeDeployAvailable,
    deployFeeOnChain,
    points,
    boostActive,
    refreshStats,
  } = useHubStats();

  const isLiveMode = isHubLiveMode({ isConnected, wrongChain });
  const actionDisabled = !isLiveMode;
  const displayPoints = isLiveMode
    ? (points?.toString() ?? "0")
    : String(PREVIEW_POINTS);
  const displayBoostActive = isLiveMode ? boostActive : true;
  const displayDeployCount = isLiveMode
    ? deployCount?.toString() ?? "0"
    : String(PREVIEW_DEPLOY_COUNT);
  const showTabs = isLiveMode ? isConnected && !wrongChain : true;

  return (
    <>
      <AppNav />

      <header className="uni-card px-5 py-5 text-center">
        <p className="uni-eyebrow">
          {inMiniApp ? "Farcaster" : "Web"} · Base
        </p>
        <h1 className="uni-title mt-2 text-3xl">{APP_NAME}</h1>
        <p className="uni-body mt-2 text-sm">
          GM, Boost, deploy tokens, refer friends, and earn NFT badges for the{" "}
          <span className="uni-text-accent font-semibold">{TOKEN_SYMBOL}</span> airdrop on
          Base.
        </p>
        <div className="uni-airdrop-callout mt-4">
          <p className="uni-airdrop-text">
            More points = Bigger{" "}
            <span className="uni-text-accent font-semibold">{TOKEN_SYMBOL}</span> airdrop.
            Simple as that.
          </p>
        </div>
      </header>

      {!isLiveMode && <PreviewBanner />}

      <div className="uni-card px-4 py-5">
        <ConnectWallet />
        {showTabs && (
          <div className="uni-card-inset mt-2.5 flex items-center justify-between gap-2 px-3 py-2">
            <p className="uni-label shrink-0 leading-none">
              Total points
              {!isLiveMode && (
                <span className="ml-1 text-[10px] font-normal uppercase tracking-wide text-[var(--uni-text-tertiary)]">
                  demo
                </span>
              )}
            </p>
            <p className="uni-mono text-lg font-semibold leading-none uni-text-accent">
              {displayPoints}
            </p>
          </div>
        )}
      </div>

      {wrongChain && isLiveMode && (
        <button
          type="button"
          className="uni-btn uni-btn-primary"
          disabled={isSwitching}
          onClick={() => switchChain({ chainId: DEPLOY_CHAIN_ID })}
        >
          {isSwitching ? "Switching…" : "Switch to Base"}
        </button>
      )}

      {wrongChain && !isLiveMode && (
        <button
          type="button"
          className="uni-btn uni-btn-primary"
          disabled={isSwitching}
          onClick={() => switchChain({ chainId: DEPLOY_CHAIN_ID })}
        >
          {isSwitching ? "Switching…" : "Switch to Base (for live play)"}
        </button>
      )}

      {showTabs && (
        <div className="uni-card p-4">
          <div className="uni-tabs mb-4">
            <div className="uni-tab-wrap">
              <button
                type="button"
                className={`uni-tab ${tab === "gm" ? "uni-tab-active" : ""}`}
                onClick={() => setTab("gm")}
              >
                GM
              </button>
              {displayBoostActive && (
                <span className="uni-tab-2x-badge" aria-hidden>
                  {BOOST_GM_MULTIPLIER}×
                </span>
              )}
            </div>
            <div
              className={`uni-tab-boost-ring ${displayBoostActive ? "uni-tab-boost-ring--live" : ""}`}
            >
              <button
                type="button"
                className={`uni-tab ${tab === "boost" ? "uni-tab-active" : ""}`}
                onClick={() => setTab("boost")}
              >
                Boost{" "}
                <span className="uni-tab-2x-mark">{BOOST_GM_MULTIPLIER}×</span>
              </button>
            </div>
            <div className="uni-tab-wrap">
              <button
                type="button"
                className={`uni-tab ${tab === "deploy" ? "uni-tab-active" : ""}`}
                onClick={() => setTab("deploy")}
              >
                Deploy
              </button>
              {displayBoostActive && (
                <span className="uni-tab-2x-badge" aria-hidden>
                  {BOOST_GM_MULTIPLIER}×
                </span>
              )}
            </div>
          </div>

          {tab === "gm" ? (
            <GmPanel disabled={actionDisabled} preview={!isLiveMode} />
          ) : tab === "boost" ? (
            <BoostPanel
              disabled={actionDisabled}
              preview={!isLiveMode}
              onSuccess={() => void refreshStats()}
            />
          ) : (
            <DeployPanel
              disabled={actionDisabled}
              preview={!isLiveMode}
              freeDeployAvailable={
                isLiveMode ? freeDeployAvailable : true
              }
              deployFeeOnChain={deployFeeOnChain}
              onSuccess={() => void refreshStats()}
            />
          )}
        </div>
      )}

      <PointsRulesCard />

      <Link href="/badges" className="uni-btn uni-btn-secondary block text-center">
        View badges · GM & Deploy milestones
      </Link>

      <Link href="/referral" className="uni-btn uni-btn-secondary block text-center">
        Referral code · +{POINTS_PER_REFERRAL} pts for you and your friend
      </Link>

      <Link href="/farm" className="uni-btn uni-btn-secondary block text-center">
        Farm {TOKEN_SYMBOL} · live checklist &amp; rank
      </Link>

      <Link href="/leaderboard" className="uni-btn uni-btn-secondary block text-center">
        Leaderboard · rank by points
      </Link>

      {showTabs && (
        <p className="uni-caption text-center">
          Deploys: <span className="uni-mono">{displayDeployCount}</span>
          {" · "}
          <Link href="/badges" className="uni-link">
            Earn badges
          </Link>
          {!isLiveMode && (
            <span className="text-[var(--uni-text-tertiary)]"> (demo)</span>
          )}
        </p>
      )}
    </>
  );
}
