"use client";

import { useCallback, useMemo } from "react";
import {
  useAccount,
  usePublicClient,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatUnits, maxUint256 } from "viem";

import {
  ABUSE_TOKEN_ADDRESS,
  abuseTokenAbi,
  isAirdropTokenConfigured,
} from "@/config/airdropContract";
import { DEPLOY_CHAIN_ID } from "@/config/contract";
import { MIN_STAKE_WEI } from "@/config/staking";
import {
  STAKE_POOL_ADDRESS,
  isStakePoolConfigured,
  stakePoolAbi,
} from "@/config/stakingContract";

export function useStaking() {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: DEPLOY_CHAIN_ID });
  const enabled =
    Boolean(address) && isStakePoolConfigured && isAirdropTokenConfigured;

  const contracts = useMemo(() => {
    if (!address) return [];
    return [
      {
        address: STAKE_POOL_ADDRESS,
        abi: stakePoolAbi,
        functionName: "stakedBalance" as const,
        args: [address] as const,
        chainId: DEPLOY_CHAIN_ID,
      },
      {
        address: STAKE_POOL_ADDRESS,
        abi: stakePoolAbi,
        functionName: "earned" as const,
        args: [address] as const,
        chainId: DEPLOY_CHAIN_ID,
      },
      {
        address: STAKE_POOL_ADDRESS,
        abi: stakePoolAbi,
        functionName: "totalStaked" as const,
        chainId: DEPLOY_CHAIN_ID,
      },
      {
        address: STAKE_POOL_ADDRESS,
        abi: stakePoolAbi,
        functionName: "rewardPoolBalance" as const,
        chainId: DEPLOY_CHAIN_ID,
      },
      {
        address: ABUSE_TOKEN_ADDRESS,
        abi: abuseTokenAbi,
        functionName: "balanceOf" as const,
        args: [address] as const,
        chainId: DEPLOY_CHAIN_ID,
      },
      {
        address: ABUSE_TOKEN_ADDRESS,
        abi: abuseTokenAbi,
        functionName: "allowance" as const,
        args: [address, STAKE_POOL_ADDRESS] as const,
        chainId: DEPLOY_CHAIN_ID,
      },
    ];
  }, [address]);

  const { data, refetch } = useReadContracts({
    contracts,
    query: { enabled, staleTime: 0 },
  });

  const stakedWei = data?.[0]?.result as bigint | undefined;
  const earnedWei = data?.[1]?.result as bigint | undefined;
  const totalStakedWei = data?.[2]?.result as bigint | undefined;
  const rewardPoolWei = data?.[3]?.result as bigint | undefined;
  const walletBalanceWei = data?.[4]?.result as bigint | undefined;
  const allowanceWei = data?.[5]?.result as bigint | undefined;

  const {
    data: hash,
    isPending,
    writeContractAsync,
    error: writeError,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const refresh = useCallback(async () => {
    if (!enabled) return;
    await refetch();
  }, [enabled, refetch]);

  const stake = useCallback(
    async (amount: bigint) => {
      if (!address || !publicClient) return;

      const allowance = allowanceWei ?? BigInt(0);
      if (allowance < amount) {
        const approveHash = await writeContractAsync({
          address: ABUSE_TOKEN_ADDRESS,
          abi: abuseTokenAbi,
          functionName: "approve",
          args: [STAKE_POOL_ADDRESS, maxUint256],
          chainId: DEPLOY_CHAIN_ID,
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }

      await writeContractAsync({
        address: STAKE_POOL_ADDRESS,
        abi: stakePoolAbi,
        functionName: "stake",
        args: [amount],
        chainId: DEPLOY_CHAIN_ID,
      });
    },
    [address, allowanceWei, publicClient, writeContractAsync],
  );

  const unstake = useCallback(
    async (amount: bigint) => {
      await writeContractAsync({
        address: STAKE_POOL_ADDRESS,
        abi: stakePoolAbi,
        functionName: "unstake",
        args: [amount],
        chainId: DEPLOY_CHAIN_ID,
      });
    },
    [writeContractAsync],
  );

  const claimReward = useCallback(async () => {
    await writeContractAsync({
      address: STAKE_POOL_ADDRESS,
      abi: stakePoolAbi,
      functionName: "claimReward",
      chainId: DEPLOY_CHAIN_ID,
    });
  }, [writeContractAsync]);

  const exit = useCallback(async () => {
    await writeContractAsync({
      address: STAKE_POOL_ADDRESS,
      abi: stakePoolAbi,
      functionName: "exit",
      chainId: DEPLOY_CHAIN_ID,
    });
  }, [writeContractAsync]);

  return {
    stakingConfigured: isStakePoolConfigured && isAirdropTokenConfigured,
    staked: formatUnits(stakedWei ?? BigInt(0), 18),
    earned: formatUnits(earnedWei ?? BigInt(0), 18),
    totalStaked: formatUnits(totalStakedWei ?? BigInt(0), 18),
    rewardPool: formatUnits(rewardPoolWei ?? BigInt(0), 18),
    walletBalance: formatUnits(walletBalanceWei ?? BigInt(0), 18),
    stakedWei: stakedWei ?? BigInt(0),
    earnedWei: earnedWei ?? BigInt(0),
    totalStakedWei: totalStakedWei ?? BigInt(0),
    walletBalanceWei: walletBalanceWei ?? BigInt(0),
    minStakeWei: MIN_STAKE_WEI,
    stake,
    unstake,
    claimReward,
    exit,
    refresh,
    isPending,
    isConfirming,
    isSuccess,
    writeError,
    reset,
  };
}
