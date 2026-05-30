"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

import { FREE_GM_PER_DAY, isContractConfigured } from "@/config/contract";
import { POINTS_PER_REFERRAL } from "@/config/referral";
import {
  DAILY_FREE_GM_TARGET,
  FARM_SHARE_STORAGE_KEY,
} from "@/config/farm";
import { useBadgeStatus } from "@/hooks/useBadgeStatus";
import { useHubStats } from "@/hooks/useHubStats";
import { useReferralCode } from "@/hooks/useReferralCode";

export type FarmCheckItem = {
  id: string;
  title: string;
  description: string;
  done: boolean;
  pointsLabel?: string;
  href: string;
  optional?: boolean;
};

export function useFarmProgress() {
  const { isConnected } = useAccount();
  const hubReady = isContractConfigured;

  const {
    points,
    gmCount,
    freeRemaining,
    freeDeployAvailable,
    referralCount,
    boostActiveUntil,
    boostActive,
    refreshStats,
  } = useHubStats();

  const {
    myCode,
    isCodeRegistered,
    hasRedeemed,
  } = useReferralCode();

  const {
    badges,
    userRank,
    milestoneMintedCount,
    isConfigured: badgesConfigured,
    refresh: refreshBadges,
  } = useBadgeStatus();

  const [hasShared, setHasShared] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHasShared(
      window.localStorage.getItem(FARM_SHARE_STORAGE_KEY) === "1",
    );
  }, []);

  const markShared = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(FARM_SHARE_STORAGE_KEY, "1");
    setHasShared(true);
  }, []);

  const pointsNum = Number(points ?? BigInt(0));
  const freeGmsUsedToday =
    freeRemaining != null
      ? DAILY_FREE_GM_TARGET - Number(freeRemaining)
      : 0;
  const dailyGmsDone = freeRemaining != null && freeRemaining === BigInt(0);
  const dailyDeployDone =
    freeDeployAvailable != null && freeDeployAvailable === false;
  const dailyBoostDone =
    boostActiveUntil != null &&
    boostActiveUntil > BigInt(0) &&
    (boostActive === true ||
      Number(boostActiveUntil) > Math.floor(Date.now() / 1000) - 86_400);
  const mintedBadgeCount = badges.filter((b) => b.minted).length;
  const hasAnyBadge = mintedBadgeCount > 0;
  const friendsJoined = Number(referralCount ?? BigInt(0));

  const dailyItems: FarmCheckItem[] = useMemo(
    () => [
      {
        id: "daily-boost",
        title: "Activate Boost",
        description: boostActive
          ? "2× GM & deploy — use the window"
          : "Free once per day · ~1h of 2× points",
        done: hubReady && isConnected && dailyBoostDone,
        pointsLabel: "2× all",
        href: "/?tab=boost",
      },
      {
        id: "daily-gm",
        title: `Use ${DAILY_FREE_GM_TARGET} free GMs`,
        description:
          freeRemaining != null
            ? `${freeGmsUsedToday}/${DAILY_FREE_GM_TARGET} free GMs used today · resets UTC midnight`
            : "Connect wallet to track",
        done: hubReady && isConnected && dailyGmsDone,
        pointsLabel: "2× with Boost",
        href: "/",
      },
      {
        id: "daily-deploy",
        title: "Use your free deploy",
        description: "One free token deploy per day on Base",
        done: hubReady && isConnected && dailyDeployDone,
        pointsLabel: "2× with Boost",
        href: "/?tab=deploy",
      },
    ],
    [
      boostActive,
      dailyBoostDone,
      dailyDeployDone,
      dailyGmsDone,
      freeGmsUsedToday,
      freeRemaining,
      hubReady,
      isConnected,
    ],
  );

  const setupItems: FarmCheckItem[] = useMemo(
    () => [
      {
        id: "activate-code",
        title: "Activate your referral code",
        description: myCode
          ? `Your code: ${myCode} — one-time on-chain`
          : "Connect wallet to see your code",
        done: isCodeRegistered,
        href: "/referral",
      },
      {
        id: "redeem-code",
        title: "Redeem a friend's code",
        description: `Instant +${POINTS_PER_REFERRAL} pts for you and your friend`,
        done: hasRedeemed,
        pointsLabel: `+${POINTS_PER_REFERRAL}`,
        href: "/referral",
      },
      {
        id: "share-code",
        title: "Share code on X or Farcaster",
        description: `Post your code — friends get +${POINTS_PER_REFERRAL} pts, you get +${POINTS_PER_REFERRAL} each redeem`,
        done: hasShared,
        optional: true,
        href: "/referral",
      },
      {
        id: "mint-badge",
        title: "Mint your first badge NFT",
        description: hasAnyBadge
          ? `${mintedBadgeCount} badge(s) in your wallet`
          : "GM ×10 or other milestones on Badges tab",
        done: badgesConfigured && hasAnyBadge,
        href: "/badges",
      },
      {
        id: "invite-friend",
        title: "Get 1 friend to redeem your code",
        description:
          friendsJoined > 0
            ? `${friendsJoined} friend(s) activated · +${POINTS_PER_REFERRAL} pts each`
            : "Highest points-per-action in the app",
        done: friendsJoined >= 1,
        pointsLabel: `+${POINTS_PER_REFERRAL} per friend`,
        href: "/referral",
      },
      {
        id: "leaderboard",
        title: "Check the leaderboard",
        description:
          userRank != null
            ? `Your rank: #${userRank}`
            : "Climb for rank badges (top 10 / 50 / 100)",
        done: userRank != null,
        href: "/leaderboard",
      },
    ],
    [
      badgesConfigured,
      friendsJoined,
      hasAnyBadge,
      hasRedeemed,
      hasShared,
      isCodeRegistered,
      mintedBadgeCount,
      myCode,
      userRank,
    ],
  );

  const dailyDone = dailyItems.filter((i) => i.done).length;
  const dailyTotal = dailyItems.length;
  const setupDone = setupItems.filter((i) => i.done && !i.optional).length;
  const setupTotal = setupItems.filter((i) => !i.optional).length;

  const refresh = useCallback(async () => {
    await Promise.all([refreshStats(), refreshBadges()]);
  }, [refreshStats, refreshBadges]);

  return {
    hubReady,
    isConnected,
    pointsNum,
    gmCount: Number(gmCount ?? BigInt(0)),
    milestoneMintedCount: Number(milestoneMintedCount ?? BigInt(0)),
    myCode,
    dailyItems,
    setupItems,
    dailyDone,
    dailyTotal,
    setupDone,
    setupTotal,
    markShared,
    refresh,
  };
}
