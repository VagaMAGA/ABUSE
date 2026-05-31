import { base } from "wagmi/chains";

/** Set after deploying Hub.sol on Base */
export const HUB_CONTRACT_ADDRESS: `0x${string}` =
  "0x7f076Fd4E7E18385E9E43ccB59B684B4Bd16dBa1";

/** Hub deploy block — set after first deploy (speeds up leaderboard indexing) */
export const HUB_DEPLOY_FROM_BLOCK = 46725882n;

export const DEPLOY_CHAIN_ID = base.id;

export const POINTS_PER_FREE_GM = 10;
export const POINTS_PER_PAID_GM = 20;
export const FREE_GM_PER_DAY = 2;
export const GM_FEE_WEI = BigInt("100000000000000");

export const POINTS_PER_FREE_DEPLOY = 20;
export const POINTS_PER_PAID_DEPLOY = 40;
export const FREE_DEPLOY_PER_DAY = 1;
export const DEPLOY_FEE_WEI = BigInt("100000000000000");

export const POINTS_PER_REFERRAL = 200;

export const FREE_BOOST_PER_DAY = 1;
export const BOOST_FEE_WEI = BigInt("100000000000000");
export const BOOST_DURATION_SEC = 3600;
export const BOOST_GM_MULTIPLIER = 2;

export const hubAbi = [
  {
    type: "function",
    name: "referralCodeFor",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "registerReferralCode",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "redeemReferralCode",
    inputs: [{ name: "code", type: "string" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "userReferralCodeHash",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasRedeemedReferralCode",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "boost",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "boostActive",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "freeBoostAvailable",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "boostActiveUntil",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "boostCount",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "gm",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "deployToken",
    inputs: [
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "initialSupply", type: "uint256" },
    ],
    outputs: [{ name: "token", type: "address" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "gmCount",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "deployCount",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "points",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "AIRDROP_MIN_POINTS",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "POINTS_PER_A_TOKEN",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "airdropToken",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "airdropClaimed",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "previewAirdropTokens",
    inputs: [{ name: "pointsAmount", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "claimAirdrop",
    inputs: [{ name: "pointsToSpend", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "referredBy",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "referralCount",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "POINTS_PER_REFERRAL",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "lastGmAt",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "freeGmsRemaining",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "freeDeployAvailable",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalGms",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalDeploys",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalBoosts",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalActions",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "BOOST_FEE",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "BOOST_DURATION",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "BOOST_GM_MULTIPLIER",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "FREE_GM_PER_DAY",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "GM_FEE",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "DEPLOY_FEE",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "POINTS_PER_FREE_GM",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "POINTS_PER_PAID_GM",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "POINTS_PER_FREE_DEPLOY",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "POINTS_PER_PAID_DEPLOY",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "MIN_INTERVAL",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "ReferralCodeRegistered",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "codeHash", type: "bytes32", indexed: true },
    ],
  },
  {
    type: "event",
    name: "ReferralCodeRedeemed",
    inputs: [
      { name: "referrer", type: "address", indexed: true },
      { name: "referee", type: "address", indexed: true },
      { name: "referrerPoints", type: "uint256", indexed: false },
      { name: "refereePoints", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AirdropClaimed",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "pointsSpent", type: "uint256", indexed: false },
      { name: "tokensReceived", type: "uint256", indexed: false },
      { name: "pointsRemaining", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "GM",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "gmCount", type: "uint256", indexed: false },
      { name: "points", type: "uint256", indexed: false },
      { name: "paid", type: "bool", indexed: false },
      { name: "boosted", type: "bool", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "BoostActivated",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "activeUntil", type: "uint256", indexed: false },
      { name: "paid", type: "bool", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "TokenDeployed",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "token", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "symbol", type: "string", indexed: false },
      { name: "initialSupply", type: "uint256", indexed: false },
      { name: "paid", type: "bool", indexed: false },
      { name: "boosted", type: "bool", indexed: false },
      { name: "pointsEarned", type: "uint256", indexed: false },
      { name: "totalPoints", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

/** @deprecated use hubAbi */
export const gmAbi = hubAbi;

export const isContractConfigured =
  HUB_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";
