"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

import { APP_NAME, TOKEN_SYMBOL } from "@/config/app";
import { AppNav } from "@/components/AppNav";
import { AirdropOrbLink } from "@/components/AirdropOrbLink";
import { ConnectWallet } from "@/components/ConnectWallet";
import {
  FarmProgressSection,
  FarmRankCard,
  type FarmTab,
} from "@/components/FarmProgressSection";
import { DeployPanel } from "@/components/DeployPanel";
import { GmPanel } from "@/components/GmPanel";
import { PointsRulesCard } from "@/components/PointsRulesCard";
import {
  DEPLOY_CHAIN_ID,
  BOOST_GM_MULTIPLIER,
  isContractConfigured,
} from "@/config/contract";
import { POINTS_PER_REFERRAL } from "@/config/referral";
import { isHubLiveMode } from "@/config/preview";
import { useFarmProgress } from "@/hooks/useFarmProgress";
import { useFarcasterMiniApp } from "@/hooks/useFarcasterMiniApp";
import { useHubStats } from "@/hooks/useHubStats";

type Section = "play" | "farm";
type PlayTab = "gm" | "deploy";

const FARM_TABS = new Set<FarmTab>(["today", "setup", "calc"]);
const PLAY_TABS = new Set<PlayTab>(["gm", "deploy"]);

export function HomeApp() {
  const { inMiniApp } = useFarcasterMiniApp();
  const searchParams = useSearchParams();
  const [section, setSection] = useState<Section>("play");
  const [playTab, setPlayTab] = useState<PlayTab>("gm");
  const [farmTab, setFarmTab] = useState<FarmTab>("today");

  useEffect(() => {
    const sectionParam = searchParams.get("section");
    const tabParam = searchParams.get("tab");

    if (sectionParam === "farm") setSection("farm");
    if (sectionParam === "play") setSection("play");

    if (tabParam && PLAY_TABS.has(tabParam as PlayTab)) {
      setSection("play");
      setPlayTab(tabParam as PlayTab);
    }
    if (tabParam === "boost") {
      setSection("play");
      setPlayTab("gm");
    }
    if (tabParam && FARM_TABS.has(tabParam as FarmTab)) {
      setSection("farm");
      setFarmTab(tabParam as FarmTab);
    }
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

  const { pointsNum: livePointsNum } = useFarmProgress();

  const canAct = isHubLiveMode({ isConnected, wrongChain });
  const showContent = isContractConfigured;

  return (
    <>
      <AppNav />

      <header className="uni-card px-5 py-5">
        <p className="uni-eyebrow text-center">
          {inMiniApp ? "Farcaster" : "Web"} · Base
        </p>
        <div className="mt-2 flex w-full justify-center">
          <div className="flex max-w-full flex-row flex-nowrap items-center justify-center gap-3.5">
            <h1 className="uni-title shrink-0 text-3xl leading-none">{APP_NAME}</h1>
            <AirdropOrbLink />
          </div>
        </div>
        <p className="uni-body mx-auto mt-2 max-w-sm text-center text-sm">
          GM, Boost, deploy, farm points, and claim{" "}
          <span className="uni-text-accent font-semibold">{TOKEN_SYMBOL}</span> on
          Base.
        </p>
        <div className="uni-airdrop-callout mt-4">
          <p className="uni-airdrop-text">
            More points = Bigger{" "}
            <span className="uni-text-accent font-semibold">{TOKEN_SYMBOL}</span>{" "}
            airdrop. Simple as that.
          </p>
        </div>
      </header>

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

      {!isConnected && isContractConfigured && (
        <p className="uni-caption text-center">
          Connect your wallet on Base to play and earn points.
        </p>
      )}

      {showContent && (
        <>
          <FarmRankCard
            pointsNum={livePointsNum}
            boostDisabled={!canAct}
            onBoostSuccess={() => void refreshStats()}
          />

          <div className="uni-card px-2 py-2">
            <div className="uni-tabs">
              <button
                type="button"
                className={`uni-tab ${section === "play" ? "uni-tab-active" : ""}`}
                onClick={() => setSection("play")}
              >
                Play
              </button>
              <button
                type="button"
                className={`uni-tab ${section === "farm" ? "uni-tab-active" : ""}`}
                onClick={() => setSection("farm")}
              >
                Farm{" "}
                <span className="uni-tab-tb-mark">{TOKEN_SYMBOL}</span>
              </button>
            </div>
          </div>

          {section === "play" ? (
            <div className="uni-card p-4">
              <div className="uni-card-inset mb-4 flex items-center justify-between gap-2 px-3 py-2">
                <p className="uni-label shrink-0 leading-none">Total points</p>
                <p className="uni-mono text-lg font-semibold leading-none uni-text-accent">
                  {points?.toString() ?? "0"}
                </p>
              </div>

              <div className="uni-tabs mb-4">
                <div className="uni-tab-wrap">
                  <button
                    type="button"
                    className={`uni-tab ${playTab === "gm" ? "uni-tab-active" : ""}`}
                    onClick={() => setPlayTab("gm")}
                  >
                    GM
                  </button>
                  {boostActive && (
                    <span className="uni-tab-2x-badge" aria-hidden>
                      {BOOST_GM_MULTIPLIER}×
                    </span>
                  )}
                </div>
                <div className="uni-tab-wrap">
                  <button
                    type="button"
                    className={`uni-tab ${playTab === "deploy" ? "uni-tab-active" : ""}`}
                    onClick={() => setPlayTab("deploy")}
                  >
                    Deploy
                  </button>
                  {boostActive && (
                    <span className="uni-tab-2x-badge" aria-hidden>
                      {BOOST_GM_MULTIPLIER}×
                    </span>
                  )}
                </div>
              </div>

              {playTab === "gm" ? (
                <GmPanel disabled={!canAct} />
              ) : (
                <DeployPanel
                  disabled={!canAct}
                  freeDeployAvailable={freeDeployAvailable}
                  deployFeeOnChain={deployFeeOnChain}
                  onSuccess={() => void refreshStats()}
                />
              )}
            </div>
          ) : (
            <FarmProgressSection
              showFarm={showContent}
              tab={farmTab}
              onTabChange={setFarmTab}
            />
          )}

          <p className="uni-caption text-center">
            Deploys:{" "}
            <span className="uni-mono">{deployCount?.toString() ?? "0"}</span>
            {" · "}
            <Link href="/badges" className="uni-link">
              Earn badges
            </Link>
          </p>
        </>
      )}

      <PointsRulesCard />

      <Link href="/badges" className="uni-btn uni-btn-secondary block text-center">
        View badges · GM & Deploy milestones
      </Link>

      <Link href="/referral" className="uni-btn uni-btn-secondary block text-center">
        Referral code · +{POINTS_PER_REFERRAL} pts for you and your friend
      </Link>

      <Link href="/leaderboard" className="uni-btn uni-btn-secondary block text-center">
        Leaderboard · rank by points
      </Link>
    </>
  );
}
