import type { Address } from "viem";
import { isAddress } from "viem";

import {
  HUB_CONTRACT_ADDRESS,
  HUB_DEPLOY_FROM_BLOCK,
  hubAbi,
  isContractConfigured,
} from "@/config/contract";
import { createBasePublicClient, type BasePublicClient } from "@/lib/baseRpc";

const LOG_CHUNK_SIZE = 10_000n;
const CHUNK_DELAY_MS = 80;
const MAX_CHUNK_RETRIES = 3;

export type ReferralRedemption = {
  referee: Address;
  blockNumber: string;
  transactionHash: `0x${string}`;
};

function hubDeployFromBlock(): bigint {
  const raw = process.env.HUB_DEPLOY_FROM_BLOCK;
  if (raw) {
    try {
      return BigInt(raw);
    } catch {
      /* fall through */
    }
  }
  return HUB_DEPLOY_FROM_BLOCK;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(error: unknown): boolean {
  const msg =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  return /rate limit|429|too many requests|exceeded/i.test(msg);
}

export function friendlyReferralsError(error: unknown): string {
  if (isRateLimitError(error)) {
    return "Base RPC rate limit — add BASE_RPC_URL (Alchemy/Infura) in env, then retry.";
  }
  if (error instanceof Error) return error.message;
  return "Failed to load referrals";
}

async function getLogsWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_CHUNK_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < MAX_CHUNK_RETRIES - 1) {
        await sleep(300 * (attempt + 1));
      }
    }
  }
  throw lastError;
}

async function fetchReferralEventsChunked(
  client: BasePublicClient,
  referrer: Address,
  fromBlock: bigint,
) {
  const latest = await client.getBlockNumber();
  const start = fromBlock > latest ? latest : fromBlock;

  const logs: Awaited<ReturnType<BasePublicClient["getContractEvents"]>> = [];

  for (let chunkStart = start; chunkStart <= latest; chunkStart += LOG_CHUNK_SIZE) {
    const chunkEnd =
      chunkStart + LOG_CHUNK_SIZE - 1n > latest
        ? latest
        : chunkStart + LOG_CHUNK_SIZE - 1n;

    const chunk = await getLogsWithRetry(() =>
      client.getContractEvents({
        address: HUB_CONTRACT_ADDRESS,
        abi: hubAbi,
        eventName: "ReferralCodeRedeemed",
        args: { referrer },
        fromBlock: chunkStart,
        toBlock: chunkEnd,
      }),
    );

    logs.push(...chunk);

    if (chunkEnd < latest) {
      await sleep(CHUNK_DELAY_MS);
    }
  }

  return logs;
}

export async function fetchReferralsForReferrer(
  referrer: string,
): Promise<{ configured: boolean; referrals: ReferralRedemption[] }> {
  if (!isContractConfigured) {
    return { configured: false, referrals: [] };
  }

  if (!isAddress(referrer)) {
    throw new Error("Invalid wallet address");
  }

  const client = createBasePublicClient();
  const fromBlock = hubDeployFromBlock();
  const logs = await fetchReferralEventsChunked(
    client,
    referrer as Address,
    fromBlock,
  );

  type ReferralLog = {
    args: {
      referee?: Address;
    };
    blockNumber: bigint;
    transactionHash: `0x${string}`;
  };

  const referrals = (logs as ReferralLog[])
    .map((log) => {
      const referee = log.args.referee;
      if (!referee) return null;
      return {
        referee,
        blockNumber: log.blockNumber.toString(),
        transactionHash: log.transactionHash,
      };
    })
    .filter((entry): entry is ReferralRedemption => entry != null)
    .sort((a, b) => {
      const blockDiff = BigInt(b.blockNumber) - BigInt(a.blockNumber);
      if (blockDiff > BigInt(0)) return 1;
      if (blockDiff < BigInt(0)) return -1;
      return b.transactionHash.localeCompare(a.transactionHash);
    });

  return { configured: true, referrals };
}
