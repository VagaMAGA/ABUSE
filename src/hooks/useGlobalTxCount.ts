"use client";

import { useMemo } from "react";
import { useReadContracts } from "wagmi";

import {
  BADGE_NFT_ADDRESS,
  badgeNftAbi,
  isBadgeContractConfigured,
} from "@/config/badgeContract";
import {
  DEPLOY_CHAIN_ID,
  HUB_CONTRACT_ADDRESS,
  hubAbi,
  isContractConfigured,
} from "@/config/contract";
import { PREVIEW_TOTAL_TXS } from "@/config/preview";
import {
  isStakePoolConfigured,
  STAKE_POOL_ADDRESS,
  stakePoolAbi,
} from "@/config/stakingContract";

function hubActionsFromReads(
  totalActions: bigint | undefined,
  totalGms: bigint | undefined,
  totalDeploys: bigint | undefined,
  totalBoosts: bigint | undefined,
): bigint {
  if (totalActions != null) {
    return totalActions;
  }
  return (
    (totalGms ?? BigInt(0)) +
    (totalDeploys ?? BigInt(0)) +
    (totalBoosts ?? BigInt(0))
  );
}

export function formatGlobalTxCount(value: bigint): string {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return "0";
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return n.toLocaleString();
}

export function useGlobalTxCount() {
  const hubEnabled = isContractConfigured;
  const badgeEnabled = isBadgeContractConfigured;
  const stakeEnabled = isStakePoolConfigured;

  const contracts = useMemo(() => {
    const list = [];

    if (hubEnabled) {
      list.push(
        {
          address: HUB_CONTRACT_ADDRESS,
          abi: hubAbi,
          functionName: "totalActions" as const,
          chainId: DEPLOY_CHAIN_ID,
        },
        {
          address: HUB_CONTRACT_ADDRESS,
          abi: hubAbi,
          functionName: "totalGms" as const,
          chainId: DEPLOY_CHAIN_ID,
        },
        {
          address: HUB_CONTRACT_ADDRESS,
          abi: hubAbi,
          functionName: "totalDeploys" as const,
          chainId: DEPLOY_CHAIN_ID,
        },
        {
          address: HUB_CONTRACT_ADDRESS,
          abi: hubAbi,
          functionName: "totalBoosts" as const,
          chainId: DEPLOY_CHAIN_ID,
        },
      );
    }

    if (badgeEnabled) {
      list.push({
        address: BADGE_NFT_ADDRESS,
        abi: badgeNftAbi,
        functionName: "totalMinted" as const,
        chainId: DEPLOY_CHAIN_ID,
      });
    }

    if (stakeEnabled) {
      list.push({
        address: STAKE_POOL_ADDRESS,
        abi: stakePoolAbi,
        functionName: "totalActions" as const,
        chainId: DEPLOY_CHAIN_ID,
      });
    }

    return list;
  }, [hubEnabled, badgeEnabled, stakeEnabled]);

  const enabled = contracts.length > 0;

  const { data, isLoading, refetch } = useReadContracts({
    contracts,
    query: {
      enabled,
      staleTime: 30_000,
      refetchInterval: 60_000,
    },
  });

  const totalTx = useMemo(() => {
    if (!hubEnabled) {
      return BigInt(PREVIEW_TOTAL_TXS);
    }

    let index = 0;
    let sum = BigInt(0);

    if (hubEnabled) {
      sum += hubActionsFromReads(
        data?.[index]?.result as bigint | undefined,
        data?.[index + 1]?.result as bigint | undefined,
        data?.[index + 2]?.result as bigint | undefined,
        data?.[index + 3]?.result as bigint | undefined,
      );
      index += 4;
    }

    if (badgeEnabled) {
      sum += (data?.[index]?.result as bigint | undefined) ?? BigInt(0);
      index += 1;
    }

    if (stakeEnabled) {
      sum += (data?.[index]?.result as bigint | undefined) ?? BigInt(0);
    }

    return sum;
  }, [badgeEnabled, data, hubEnabled, stakeEnabled]);

  return {
    totalTx,
    formatted: formatGlobalTxCount(totalTx),
    isLive: hubEnabled,
    isLoading: hubEnabled && isLoading,
    refresh: refetch,
  };
}
