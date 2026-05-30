import type { Address } from "viem";

import { isBadgeContractConfigured } from "@/config/badgeContract";
import { isContractConfigured } from "@/config/contract";
import { DAILY_FREE_GM_TARGET, DAILY_FREE_POINTS_MAX } from "@/config/farm";
import { POINTS_PER_REFERRAL } from "@/config/referral";
import type { FarmCheckItem } from "@/hooks/useFarmProgress";
import type { ReferralRedemption } from "@/lib/fetchReferrals";
import type { LeaderboardRow } from "@/lib/leaderboard";

export const PREVIEW_POINTS = 1240;
export const PREVIEW_GM_COUNT = 18;
export const PREVIEW_DEPLOY_COUNT = 2;
export const PREVIEW_REFERRAL_COUNT = 2;
export const PREVIEW_REFERRAL_POINTS =
  PREVIEW_REFERRAL_COUNT * POINTS_PER_REFERRAL;
export const PREVIEW_CODE = "DEMO42";
export const PREVIEW_FARM_POINTS = 420;
export const PREVIEW_FARM_GM = 12;
export const PREVIEW_USER_RANK = 42;
export const PREVIEW_USER_RANK_POINTS = "420";

const PREVIEW_ADDR_1 =
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" as Address;
const PREVIEW_ADDR_2 =
  "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199" as Address;
const PREVIEW_ADDR_3 =
  "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" as Address;

export function isHubLiveMode(opts: {
  isConnected: boolean;
  wrongChain: boolean;
}): boolean {
  return isContractConfigured && opts.isConnected && !opts.wrongChain;
}

export function isBadgeLiveMode(opts: {
  isConnected: boolean;
  wrongChain: boolean;
}): boolean {
  return isHubLiveMode(opts) && isBadgeContractConfigured;
}

export function isAirdropLiveMode(opts: {
  isConnected: boolean;
  wrongChain: boolean;
  airdropConfigured: boolean;
}): boolean {
  return isHubLiveMode(opts) && opts.airdropConfigured;
}

export function isStakingLiveMode(opts: {
  isConnected: boolean;
  wrongChain: boolean;
  stakingConfigured: boolean;
}): boolean {
  return isHubLiveMode(opts) && opts.stakingConfigured;
}

export const PREVIEW_A_CLAIMED = "240";
export const PREVIEW_CLAIM_POINTS = 1000;
export const PREVIEW_STAKED_A = "500";
export const PREVIEW_STAKING_EARNED = "12.4";
export const PREVIEW_STAKING_WALLET = "740";
export const PREVIEW_TOTAL_STAKED = "12,400";

export const PREVIEW_REFERRALS: ReferralRedemption[] = [
  {
    referee: PREVIEW_ADDR_1,
    blockNumber: "46610001",
    transactionHash:
      "0x1111111111111111111111111111111111111111111111111111111111111111",
  },
  {
    referee: PREVIEW_ADDR_2,
    blockNumber: "46610042",
    transactionHash:
      "0x2222222222222222222222222222222222222222222222222222222222222222",
  },
];

export const PREVIEW_LEADERBOARD: LeaderboardRow[] = [
  {
    rank: 1,
    address: PREVIEW_ADDR_3,
    points: "12400",
    gmCount: "420",
    deployCount: "88",
    lastActive: "0",
  },
  {
    rank: 2,
    address: PREVIEW_ADDR_1,
    points: "9800",
    gmCount: "310",
    deployCount: "64",
    lastActive: "0",
  },
  {
    rank: 3,
    address: PREVIEW_ADDR_2,
    points: "7600",
    gmCount: "240",
    deployCount: "51",
    lastActive: "0",
  },
  {
    rank: 4,
    address: "0x1111111111111111111111111111111111111111",
    points: "5400",
    gmCount: "180",
    deployCount: "36",
    lastActive: "0",
  },
  {
    rank: 5,
    address: "0x2222222222222222222222222222222222222222",
    points: "4200",
    gmCount: "140",
    deployCount: "28",
    lastActive: "0",
  },
  {
    rank: PREVIEW_USER_RANK,
    address: "0x3333333333333333333333333333333333333333",
    points: PREVIEW_USER_RANK_POINTS,
    gmCount: "12",
    deployCount: "4",
    lastActive: "0",
  },
];

export const PREVIEW_DAILY_ITEMS: FarmCheckItem[] = [
  {
    id: "daily-boost",
    title: "Activate Boost",
    description: "Free once per day · tap Boost on Farm rank",
    done: true,
    pointsLabel: "2× all",
    href: "/",
  },
  {
    id: "daily-gm",
    title: `Use ${DAILY_FREE_GM_TARGET} free GMs`,
    description: `2/${DAILY_FREE_GM_TARGET} free GMs used today · resets UTC midnight`,
    done: false,
    pointsLabel: "2× with Boost",
    href: "/?section=play&tab=gm",
  },
  {
    id: "daily-deploy",
    title: "Use your free deploy",
    description: "One free token deploy per day on Base",
    done: true,
    pointsLabel: "2× with Boost",
    href: "/?section=play&tab=deploy",
  },
];

export const PREVIEW_SETUP_ITEMS: FarmCheckItem[] = [
  {
    id: "activate-code",
    title: "Activate your referral code",
    description: `Your code: ${PREVIEW_CODE} — one-time on-chain`,
    done: true,
    href: "/referral",
  },
  {
    id: "redeem-code",
    title: "Redeem a friend's code",
    description: `Instant +${POINTS_PER_REFERRAL} pts for you and your friend`,
    done: false,
    pointsLabel: `+${POINTS_PER_REFERRAL}`,
    href: "/referral",
  },
  {
    id: "share-code",
    title: "Share code on X or Farcaster",
    description: `Post your code — friends get +${POINTS_PER_REFERRAL} pts, you get +${POINTS_PER_REFERRAL} each redeem`,
    done: true,
    optional: true,
    href: "/referral",
  },
  {
    id: "mint-badge",
    title: "Mint your first badge NFT",
    description: "6 badge(s) in your wallet",
    done: true,
    href: "/badges",
  },
  {
    id: "invite-friend",
    title: "Get 1 friend to redeem your code",
    description: `${PREVIEW_REFERRAL_COUNT} friend(s) activated · +${POINTS_PER_REFERRAL} pts each`,
    done: true,
    pointsLabel: `+${POINTS_PER_REFERRAL} per friend`,
    href: "/referral",
  },
  {
    id: "leaderboard",
    title: "Check the leaderboard",
    description: `Your rank: #${PREVIEW_USER_RANK}`,
    done: true,
    href: "/leaderboard",
  },
];

export const PREVIEW_DAILY_DONE = PREVIEW_DAILY_ITEMS.filter((i) => i.done).length;
export const PREVIEW_DAILY_TOTAL = PREVIEW_DAILY_ITEMS.length;
export const PREVIEW_SETUP_DONE = PREVIEW_SETUP_ITEMS.filter(
  (i) => i.done && !i.optional,
).length;
export const PREVIEW_SETUP_TOTAL = PREVIEW_SETUP_ITEMS.filter(
  (i) => !i.optional,
).length;
export const PREVIEW_DAILY_POINTS_MAX = DAILY_FREE_POINTS_MAX;
