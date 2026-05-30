"use client";

import { formatUnits } from "viem";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

import { AppNav } from "@/components/AppNav";
import { BadgeCard } from "@/components/BadgeCard";
import { ConnectWallet } from "@/components/ConnectWallet";
import { PreviewBanner } from "@/components/PreviewBanner";
import { TOKEN_SYMBOL } from "@/config/app";
import type { BadgeDefinition, BadgeKind } from "@/config/badges";
import { BADGES } from "@/config/badges";
import { DEPLOY_CHAIN_ID } from "@/config/contract";
import { isBadgeLiveMode } from "@/config/preview";
import { useBadgeStatus } from "@/hooks/useBadgeStatus";
import { useHubStats } from "@/hooks/useHubStats";

type BadgeTab = "all" | BadgeKind;

type DisplayBadge = BadgeDefinition & {
  minted: boolean;
  eligible: boolean;
  canMint: boolean;
  userRank?: number | null;
  rankSignerReady?: boolean;
  rankSignerReason?: string | null;
};

const TABS: { id: BadgeTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "gm", label: "GM" },
  { id: "deploy", label: "Deploy" },
  { id: "token", label: TOKEN_SYMBOL },
  { id: "rank", label: "Rank" },
  { id: "collection", label: "Collection" },
  { id: "referral", label: "Referral" },
];

const SECTION_LABELS: Record<BadgeKind, string> = {
  gm: "GM milestones",
  deploy: "Deploy milestones",
  token: "$A claimed",
  rank: "Leaderboard rank",
  collection: "Badge collection",
  referral: "Referral milestones",
};

/** Demo states so badge art is visible before wallet + deploy */
function buildPreviewBadges(): DisplayBadge[] {
  return BADGES.map((badge, index) => {
    const mod = index % 4;
    const minted = mod === 0;
    const canMint = mod === 1;
    const eligible = minted || canMint;

    return {
      ...badge,
      minted,
      eligible,
      canMint,
      userRank: badge.kind === "rank" ? (canMint ? badge.threshold : 999) : null,
      rankSignerReady: false,
      rankSignerReason: "missing",
    };
  });
}

const PREVIEW_BADGES = buildPreviewBadges();

function previewCount(badge: BadgeDefinition, index: number): bigint | undefined {
  if (badge.kind === "rank" || badge.kind === "collection") return undefined;
  const mod = index % 4;
  if (mod === 0 || mod === 1) return BigInt(badge.threshold);
  if (mod === 2) return BigInt(Math.max(1, Math.floor(badge.threshold * 0.45)));
  return BigInt(0);
}

function previewMilestoneCount(index: number): number {
  const mod = index % 4;
  if (mod === 0) return 16;
  if (mod === 1) return 8;
  if (mod === 2) return 3;
  return 0;
}

export function BadgesApp() {
  const [tab, setTab] = useState<BadgeTab>("all");
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const wrongChain = isConnected && chainId !== DEPLOY_CHAIN_ID;

  const { gmCount, deployCount, airdropClaimed, referralCount } = useHubStats();
  const {
    badges: liveBadges,
    refresh,
    isLoading,
    isConfigured,
    userRank,
    milestoneMintedCount: milestoneMintedOnChain,
  } = useBadgeStatus();

  const isLiveMode = isBadgeLiveMode({ isConnected, wrongChain });

  const displayBadges: DisplayBadge[] = isLiveMode ? liveBadges : PREVIEW_BADGES;

  const mintedCount = displayBadges.filter((b) => b.minted).length;
  const milestoneMintedCount = isLiveMode
    ? Number(milestoneMintedOnChain)
    : 6;
  const readyCount = displayBadges.filter((b) => b.canMint).length;
  const collectionProgress = Math.round((mintedCount / BADGES.length) * 100);

  const filteredBadges = useMemo(() => {
    if (tab === "all") return displayBadges;
    return displayBadges.filter((b) => b.kind === tab);
  }, [displayBadges, tab]);

  const sections = useMemo(() => {
    if (tab !== "all") return [{ kind: tab, items: filteredBadges }];
    const kinds: BadgeKind[] = [
      "gm",
      "deploy",
      "token",
      "rank",
      "collection",
      "referral",
    ];
    return kinds
      .map((kind) => ({
        kind,
        items: displayBadges.filter((b) => b.kind === kind),
      }))
      .filter((section) => section.items.length > 0);
  }, [displayBadges, filteredBadges, tab]);

  const statForKind = (kind: BadgeKind) => {
    if (!isLiveMode) {
      switch (kind) {
        case "gm":
          return "12";
        case "deploy":
          return "4";
        case "token":
          return "1000";
        case "rank":
          return "#42";
        case "collection":
          return "6";
        case "referral":
          return "2";
      }
    }

    switch (kind) {
      case "gm":
        return gmCount?.toString() ?? "0";
      case "deploy":
        return deployCount?.toString() ?? "0";
      case "token":
        return airdropClaimed != null
          ? formatUnits(airdropClaimed, 18)
          : "0";
      case "rank":
        return userRank != null ? `#${userRank}` : "—";
      case "collection":
        return milestoneMintedCount.toString();
      case "referral":
        return referralCount?.toString() ?? "0";
    }
  };

  const mintDisabled =
    !isLiveMode || isLoading;

  return (
    <>
      <AppNav />

      <header className="uni-badges-hero px-5 py-5">
        <div className="uni-badges-hero-inner">
          <p className="uni-eyebrow text-center">Collectible NFTs · Base</p>
          <h1 className="uni-title mt-2 text-center text-3xl">Badge collection</h1>
          <p className="uni-body mx-auto mt-2 max-w-sm text-center text-sm">
            Earn milestone badges for GM, deploys, {TOKEN_SYMBOL} claimed,
            leaderboard rank, and your badge collection. Mint each one once as
            an on-chain NFT.
          </p>

          <div className="uni-badges-collection">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="uni-label">Collection progress</p>
              <p className="uni-mono text-sm font-semibold text-[var(--uni-text)]">
                {mintedCount}
                <span className="text-[var(--uni-text-tertiary)]">
                  /{BADGES.length}
                </span>
                {!isLiveMode && (
                  <span className="ml-1 text-[10px] font-normal uppercase tracking-wide text-[var(--uni-text-tertiary)]">
                    preview
                  </span>
                )}
              </p>
            </div>
            <div className="uni-badges-collection-bar">
              <div
                className="uni-badges-collection-fill"
                style={{ width: `${collectionProgress}%` }}
              />
            </div>
            {readyCount > 0 && (
              <p className="uni-caption mt-2 text-center text-[var(--uni-pink)]">
                {readyCount} badge{readyCount === 1 ? "" : "s"} ready to mint
                {!isLiveMode ? " (demo)" : ""}
              </p>
            )}
          </div>

          <div className="uni-badges-stats mt-3">
            <div className="uni-badges-stat">
              <p className="uni-label">GMs</p>
              <p className="uni-badges-stat-value uni-mono mt-0.5">
                {statForKind("gm")}
              </p>
            </div>
            <div className="uni-badges-stat">
              <p className="uni-label">Deploys</p>
              <p className="uni-badges-stat-value uni-mono mt-0.5">
                {statForKind("deploy")}
              </p>
            </div>
            <div className="uni-badges-stat">
              <p className="uni-label">{TOKEN_SYMBOL} claimed</p>
              <p className="uni-badges-stat-value uni-mono mt-0.5 uni-text-accent">
                {statForKind("token")}
              </p>
            </div>
            <div className="uni-badges-stat">
              <p className="uni-label">Rank</p>
              <p className="uni-badges-stat-value uni-mono mt-0.5">
                {statForKind("rank")}
              </p>
            </div>
          </div>
        </div>
      </header>

      {!isLiveMode && <PreviewBanner />}

      <div className="uni-card px-4 py-4">
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

      <div className="uni-badges-tabs">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`uni-badges-tab ${tab === item.id ? "uni-badges-tab-active" : ""}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="uni-badge-grid">
        {sections.map((section) => (
          <div key={section.kind} className="contents">
            {tab === "all" && (
              <h2 className="uni-badge-section-title">
                {SECTION_LABELS[section.kind]}
              </h2>
            )}
            {section.items.map((badge) => {
              const badgeIndex = BADGES.findIndex((b) => b.id === badge.id);
              return (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  minted={badge.minted}
                  eligible={badge.eligible}
                  canMint={badge.canMint}
                  currentCount={
                    isLiveMode
                      ? badge.kind === "gm"
                        ? gmCount
                        : badge.kind === "deploy"
                          ? deployCount
                          : badge.kind === "token"
                            ? airdropClaimed
                            : badge.kind === "referral"
                              ? referralCount
                              : undefined
                      : previewCount(badge, badgeIndex)
                  }
                  milestoneMintedCount={
                    isLiveMode
                      ? milestoneMintedCount
                      : previewMilestoneCount(badgeIndex)
                  }
                  userRank={badge.userRank}
                  rankSignerReady={badge.rankSignerReady}
                  rankSignerReason={badge.rankSignerReason}
                  disabled={mintDisabled}
                  onMinted={() => void refresh()}
                />
              );
            })}
          </div>
        ))}
      </div>

      {isLiveMode && isLoading && (
        <p className="uni-caption uni-pulse text-center">Syncing badges…</p>
      )}

      {!isLiveMode && (
        <p className="uni-caption text-center">
          <Link href="/leaderboard" className="uni-link text-sm">
            View leaderboard →
          </Link>
        </p>
      )}
    </>
  );
}
