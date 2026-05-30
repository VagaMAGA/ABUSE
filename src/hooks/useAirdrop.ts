"use client";

import { useCallback, useMemo } from "react";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatUnits } from "viem";

import {
  ABUSE_TOKEN_ADDRESS,
  abuseTokenAbi,
  isAirdropTokenConfigured,
} from "@/config/airdropContract";
import {
  DEPLOY_CHAIN_ID,
  HUB_CONTRACT_ADDRESS,
  hubAbi,
  isContractConfigured,
} from "@/config/contract";
import { AIRDROP_MIN_POINTS, POINTS_PER_A_TOKEN } from "@/config/airdrop";

export function useAirdrop() {
  const { address } = useAccount();
  const enabled = Boolean(address) && isContractConfigured;

  const hubContracts = useMemo(() => {
    if (!address) return [];
    return [
      {
        address: HUB_CONTRACT_ADDRESS,
        abi: hubAbi,
        functionName: "points" as const,
        args: [address] as const,
        chainId: DEPLOY_CHAIN_ID,
      },
      {
        address: HUB_CONTRACT_ADDRESS,
        abi: hubAbi,
        functionName: "airdropClaimed" as const,
        args: [address] as const,
        chainId: DEPLOY_CHAIN_ID,
      },
      {
        address: HUB_CONTRACT_ADDRESS,
        abi: hubAbi,
        functionName: "airdropToken" as const,
        chainId: DEPLOY_CHAIN_ID,
      },
    ];
  }, [address]);

  const { data, refetch: refetchHub } = useReadContracts({
    contracts: hubContracts,
    query: { enabled, staleTime: 0 },
  });

  const points = data?.[0]?.result as bigint | undefined;
  const airdropClaimedWei = data?.[1]?.result as bigint | undefined;
  const onChainAirdropToken = data?.[2]?.result as `0x${string}` | undefined;

  const tokenAddress = useMemo(() => {
    if (isAirdropTokenConfigured) return ABUSE_TOKEN_ADDRESS;
    if (
      onChainAirdropToken &&
      onChainAirdropToken !== "0x0000000000000000000000000000000000000000"
    ) {
      return onChainAirdropToken;
    }
    return undefined;
  }, [onChainAirdropToken]);

  const { data: tokenBalanceWei, refetch: refetchBalance } = useReadContract({
    address: tokenAddress,
    abi: abuseTokenAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: DEPLOY_CHAIN_ID,
    query: {
      enabled: enabled && Boolean(address) && Boolean(tokenAddress),
    },
  });

  const airdropConfigured = Boolean(tokenAddress);

  const {
    data: hash,
    isPending,
    writeContract,
    error: writeError,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claim = useCallback(
    (pointsToSpend: bigint) => {
      writeContract({
        address: HUB_CONTRACT_ADDRESS,
        abi: hubAbi,
        functionName: "claimAirdrop",
        args: [pointsToSpend],
        chainId: DEPLOY_CHAIN_ID,
      });
    },
    [writeContract],
  );

  const refresh = useCallback(async () => {
    if (!enabled) return;
    await Promise.all([refetchHub(), refetchBalance()]);
  }, [enabled, refetchHub, refetchBalance]);

  const tokenBalance = formatUnits(
    (tokenBalanceWei as bigint | undefined) ?? BigInt(0),
    18,
  );
  const totalClaimed = formatUnits(airdropClaimedWei ?? BigInt(0), 18);

  return {
    points,
    airdropConfigured,
    tokenBalance,
    totalClaimed,
    claim,
    refresh,
    isPending,
    isConfirming,
    isSuccess,
    writeError,
    reset,
    minPoints: AIRDROP_MIN_POINTS,
    pointsPerToken: POINTS_PER_A_TOKEN,
  };
}
