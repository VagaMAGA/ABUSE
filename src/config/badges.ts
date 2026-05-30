export type BadgeKind =
  | "gm"
  | "deploy"
  | "points"
  | "rank"
  | "collection"
  | "referral";

export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";

export type BadgeMintMode = "hub" | "rank";

export type BadgeDefinition = {
  id: number;
  kind: BadgeKind;
  threshold: number;
  title: string;
  description: string;
  mintMode: BadgeMintMode;
};

/** On-chain badgeType ids 1–24 (see BadgeNFT.sol) */
export const BADGES: readonly BadgeDefinition[] = [
  {
    id: 1,
    kind: "gm",
    threshold: 10,
    title: "GM ×10",
    description: "Complete 10 GMs in the app",
    mintMode: "hub",
  },
  {
    id: 2,
    kind: "gm",
    threshold: 20,
    title: "GM ×20",
    description: "Complete 20 GMs in the app",
    mintMode: "hub",
  },
  {
    id: 3,
    kind: "gm",
    threshold: 50,
    title: "GM ×50",
    description: "Complete 50 GMs in the app",
    mintMode: "hub",
  },
  {
    id: 4,
    kind: "deploy",
    threshold: 10,
    title: "Deploy ×10",
    description: "Deploy 10 tokens via the hub",
    mintMode: "hub",
  },
  {
    id: 5,
    kind: "deploy",
    threshold: 20,
    title: "Deploy ×20",
    description: "Deploy 20 tokens via the hub",
    mintMode: "hub",
  },
  {
    id: 6,
    kind: "deploy",
    threshold: 50,
    title: "Deploy ×50",
    description: "Deploy 50 tokens via the hub",
    mintMode: "hub",
  },
  {
    id: 7,
    kind: "points",
    threshold: 100,
    title: "Points ×100",
    description: "Earn 100 total points in the app",
    mintMode: "hub",
  },
  {
    id: 8,
    kind: "points",
    threshold: 500,
    title: "Points ×500",
    description: "Earn 500 total points in the app",
    mintMode: "hub",
  },
  {
    id: 9,
    kind: "points",
    threshold: 1000,
    title: "Points ×1000",
    description: "Earn 1000 total points in the app",
    mintMode: "hub",
  },
  {
    id: 10,
    kind: "rank",
    threshold: 10,
    title: "Top 10",
    description: "Reach top 10 on the leaderboard",
    mintMode: "rank",
  },
  {
    id: 11,
    kind: "rank",
    threshold: 50,
    title: "Top 50",
    description: "Reach top 50 on the leaderboard",
    mintMode: "rank",
  },
  {
    id: 12,
    kind: "rank",
    threshold: 100,
    title: "Top 100",
    description: "Reach top 100 on the leaderboard",
    mintMode: "rank",
  },
  {
    id: 13,
    kind: "gm",
    threshold: 100,
    title: "GM ×100",
    description: "Complete 100 GMs in the app",
    mintMode: "hub",
  },
  {
    id: 14,
    kind: "deploy",
    threshold: 100,
    title: "Deploy ×100",
    description: "Deploy 100 tokens via the hub",
    mintMode: "hub",
  },
  {
    id: 15,
    kind: "points",
    threshold: 5000,
    title: "Points ×5000",
    description: "Earn 5000 total points in the app",
    mintMode: "hub",
  },
  {
    id: 16,
    kind: "rank",
    threshold: 3,
    title: "Top 3",
    description: "Reach top 3 on the leaderboard",
    mintMode: "rank",
  },
  {
    id: 17,
    kind: "collection",
    threshold: 4,
    title: "Collector ×4",
    description: "Mint 4 milestone badge NFTs",
    mintMode: "hub",
  },
  {
    id: 18,
    kind: "collection",
    threshold: 8,
    title: "Collector ×8",
    description: "Mint 8 milestone badge NFTs",
    mintMode: "hub",
  },
  {
    id: 19,
    kind: "collection",
    threshold: 12,
    title: "Collector ×12",
    description: "Mint 12 milestone badge NFTs",
    mintMode: "hub",
  },
  {
    id: 20,
    kind: "collection",
    threshold: 16,
    title: "Collector ×16",
    description: "Mint all 16 milestone badge NFTs",
    mintMode: "hub",
  },
  {
    id: 21,
    kind: "referral",
    threshold: 2,
    title: "Referral ×2",
    description: "2 friends redeem your referral code",
    mintMode: "hub",
  },
  {
    id: 22,
    kind: "referral",
    threshold: 5,
    title: "Referral ×5",
    description: "5 friends redeem your referral code",
    mintMode: "hub",
  },
  {
    id: 23,
    kind: "referral",
    threshold: 10,
    title: "Referral ×10",
    description: "10 friends redeem your referral code",
    mintMode: "hub",
  },
  {
    id: 24,
    kind: "referral",
    threshold: 20,
    title: "Referral ×20",
    description: "20 friends redeem your referral code",
    mintMode: "hub",
  },
] as const;

/** Milestone ids 1–16 (used for collection badges on-chain) */
export const MILESTONE_BADGE_IDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
] as const;

export const MILESTONE_BADGE_MAX = MILESTONE_BADGE_IDS.length;

export const MILESTONE_BADGE_COUNT = MILESTONE_BADGE_MAX;

export const GM_BADGES = BADGES.filter((b) => b.kind === "gm");
export const DEPLOY_BADGES = BADGES.filter((b) => b.kind === "deploy");
export const POINTS_BADGES = BADGES.filter((b) => b.kind === "points");
export const RANK_BADGES = BADGES.filter((b) => b.kind === "rank");
export const COLLECTION_BADGES = BADGES.filter((b) => b.kind === "collection");
export const REFERRAL_BADGES = BADGES.filter((b) => b.kind === "referral");

/** Max rank required to mint a rank badge (badge threshold = max rank) */
export function isRankEligible(userRank: number | null, maxRank: number): boolean {
  if (userRank == null) return false;
  return userRank <= maxRank;
}

const PROGRESSION_TIERS: BadgeTier[] = ["bronze", "silver", "gold", "platinum"];
const RANK_TIERS: BadgeTier[] = ["platinum", "gold", "silver", "bronze"];

/** Bronze / silver / gold / platinum within each badge category */
export function badgeTier(badge: BadgeDefinition): BadgeTier {
  if (badge.kind === "collection") {
    const index = COLLECTION_BADGES.findIndex((b) => b.id === badge.id);
    return PROGRESSION_TIERS[index] ?? "bronze";
  }

  const inKind = BADGES.filter((b) => b.kind === badge.kind).sort(
    (a, b) => a.threshold - b.threshold,
  );
  const index = inKind.findIndex((b) => b.id === badge.id);
  if (index < 0) return "bronze";

  if (badge.kind === "rank") {
    return RANK_TIERS[index] ?? "bronze";
  }

  return PROGRESSION_TIERS[index] ?? "bronze";
}

export function badgeTierLabel(tier: BadgeTier): string {
  switch (tier) {
    case "bronze":
      return "Ember";
    case "silver":
      return "Blood";
    case "gold":
      return "Crimson";
    case "platinum":
      return "Inferno";
  }
}
