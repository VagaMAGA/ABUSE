#!/usr/bin/env node
/**
 * Sync latest Foundry broadcast addresses into frontend config files.
 * Usage: node scripts/sync-deployments.mjs [base|base_sepolia]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const network = process.argv[2] ?? "base_sepolia";
const chainIds = { base: 8453, base_sepolia: 84532 };
const chainId = chainIds[network];

if (!chainId) {
  console.error(`Unknown network: ${network}`);
  process.exit(1);
}

const broadcastDir = path.join(
  root,
  "broadcast",
  "Deploy.s.sol",
  String(chainId),
);

const runLatest = path.join(broadcastDir, "run-latest.json");
if (!fs.existsSync(runLatest)) {
  console.error(`Broadcast file not found: ${runLatest}`);
  console.error("Run scripts/deploy-contracts.sh first.");
  process.exit(1);
}

const broadcast = JSON.parse(fs.readFileSync(runLatest, "utf8"));
const txs = broadcast.transactions ?? [];

let hubAddress;
let badgeAddress;

for (const tx of txs) {
  if (tx.contractName === "Hub" && tx.contractAddress) {
    hubAddress = tx.contractAddress;
  }
  if (tx.contractName === "BadgeNFT" && tx.contractAddress) {
    badgeAddress = tx.contractAddress;
  }
}

if (!hubAddress || !badgeAddress) {
  console.error("Could not find Hub / BadgeNFT addresses in broadcast file.");
  process.exit(1);
}

const contractTs = path.join(root, "src/config/contract.ts");
const badgeContractTs = path.join(root, "src/config/badgeContract.ts");
const deploymentsJson = path.join(root, "deployments", `${network}.json`);

const hubRe =
  /export const HUB_CONTRACT_ADDRESS: `0x\$\{string\}` =\s*\n\s*"0x[^"]*";/;
const badgeRe =
  /export const BADGE_NFT_ADDRESS: `0x\$\{string\}` =\s*\n\s*"0x[^"]*";/;
const hubBlockRe = /export const HUB_DEPLOY_FROM_BLOCK = \d+n;/;
const rankSignerRe =
  /export const RANK_SIGNER_ADDRESS =\s*\n\s*"0x[^"]*" as const;/;

let contractSrc = fs.readFileSync(contractTs, "utf8");
let badgeSrc = fs.readFileSync(badgeContractTs, "utf8");

contractSrc = contractSrc.replace(
  hubRe,
  `export const HUB_CONTRACT_ADDRESS: \`0x\${string}\` =\n  "${hubAddress}";`,
);
badgeSrc = badgeSrc.replace(
  badgeRe,
  `export const BADGE_NFT_ADDRESS: \`0x\${string}\` =\n  "${badgeAddress}";`,
);

const deployBlock = broadcast.receipts?.[0]?.blockNumber;
const rankSigner = process.env.RANK_SIGNER;

if (deployBlock) {
  contractSrc = contractSrc.replace(
    hubBlockRe,
    `export const HUB_DEPLOY_FROM_BLOCK = ${deployBlock}n;`,
  );
}

fs.writeFileSync(contractTs, contractSrc);
fs.writeFileSync(badgeContractTs, badgeSrc);

const signRankTs = path.join(root, "src/lib/signRankBadge.ts");
if (rankSigner) {
  let signRankSrc = fs.readFileSync(signRankTs, "utf8");
  signRankSrc = signRankSrc.replace(
    rankSignerRe,
    `export const RANK_SIGNER_ADDRESS =\n  "${rankSigner}" as const;`,
  );
  fs.writeFileSync(signRankTs, signRankSrc);
}

fs.mkdirSync(path.dirname(deploymentsJson), { recursive: true });
fs.writeFileSync(
  deploymentsJson,
  JSON.stringify(
    {
      network,
      chainId,
      hub: hubAddress,
      badgeNft: badgeAddress,
      rankSigner: rankSigner ?? null,
      hubDeployFromBlock: deployBlock ?? null,
      syncedAt: new Date().toISOString(),
    },
    null,
    2,
  ) + "\n",
);

console.log("Synced deployment addresses:");
console.log("  Hub:      ", hubAddress);
console.log("  BadgeNFT: ", badgeAddress);
console.log("");
console.log("Updated:");
console.log(" ", path.relative(root, contractTs));
console.log(" ", path.relative(root, badgeContractTs));
console.log(" ", path.relative(root, deploymentsJson));
if (rankSigner) {
  console.log(" ", path.relative(root, signRankTs));
}

if (deployBlock) {
  console.log("");
  console.log(`HUB_DEPLOY_FROM_BLOCK set to ${deployBlock} in contract.ts`);
}
