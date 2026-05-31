import { DEPLOY_CHAIN_ID } from "@/config/contract";

/** Set after deploying BadgeNFT.sol (pass Hub address to constructor) */
export const BADGE_NFT_ADDRESS: `0x${string}` =
  "0xAC8FAb96243AF9B4953B3f3B07555964C656383c";

export const isBadgeContractConfigured =
  BADGE_NFT_ADDRESS !== "0x0000000000000000000000000000000000000000";

export const badgeNftAbi = [
  {
    type: "function",
    name: "mint",
    inputs: [{ name: "badgeType", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "mintRankBadge",
    inputs: [
      { name: "badgeType", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "eligibility",
    inputs: [
      { name: "user", type: "address" },
      { name: "badgeType", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasMintedType",
    inputs: [
      { name: "", type: "address" },
      { name: "", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "milestoneMintedCount",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalMinted",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "badgeThreshold",
    inputs: [{ name: "badgeType", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "badgeCategory",
    inputs: [{ name: "badgeType", type: "uint256" }],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "rankSigner",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "BadgeMinted",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "badgeType", type: "uint256", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
    ],
  },
] as const;

export { DEPLOY_CHAIN_ID };
