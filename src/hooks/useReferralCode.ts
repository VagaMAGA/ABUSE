"use client";

import { useCallback, useMemo, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import {
  HUB_CONTRACT_ADDRESS,
  hubAbi,
  isContractConfigured,
} from "@/config/contract";
import {
  isValidReferralCodeFormat,
  normalizeReferralCodeInput,
  referralCodeFromAddress,
} from "@/lib/referralCode";

export function useReferralCode() {
  const { address, isConnected } = useAccount();
  const [friendCodeInput, setFriendCodeInput] = useState("");

  const enabled = isContractConfigured && isConnected && !!address;

  const myCode = useMemo(
    () => (address ? referralCodeFromAddress(address) : ""),
    [address],
  );

  const { data: codeHash, refetch: refetchCodeHash } = useReadContract({
    address: HUB_CONTRACT_ADDRESS,
    abi: hubAbi,
    functionName: "userReferralCodeHash",
    args: address ? [address] : undefined,
    query: { enabled },
  });

  const { data: hasRedeemed, refetch: refetchRedeemed } = useReadContract({
    address: HUB_CONTRACT_ADDRESS,
    abi: hubAbi,
    functionName: "hasRedeemedReferralCode",
    args: address ? [address] : undefined,
    query: { enabled },
  });

  const isCodeRegistered =
    codeHash != null &&
    codeHash !==
      "0x0000000000000000000000000000000000000000000000000000000000000000";

  const normalizedFriendCode = normalizeReferralCodeInput(friendCodeInput);
  const canRedeemFriendCode =
    enabled &&
    !hasRedeemed &&
    isValidReferralCodeFormat(normalizedFriendCode) &&
    normalizedFriendCode !== myCode;

  const {
    writeContract: writeRegister,
    data: registerHash,
    reset: resetRegister,
    error: registerError,
    isPending: isRegisterPending,
  } = useWriteContract();

  const {
    writeContract: writeRedeem,
    data: redeemHash,
    reset: resetRedeem,
    error: redeemError,
    isPending: isRedeemPending,
  } = useWriteContract();

  const { isLoading: isRegisterConfirming, isSuccess: registerSuccess } =
    useWaitForTransactionReceipt({ hash: registerHash });

  const { isLoading: isRedeemConfirming, isSuccess: redeemSuccess } =
    useWaitForTransactionReceipt({ hash: redeemHash });

  const refresh = useCallback(async () => {
    if (!enabled) return;
    await Promise.all([refetchCodeHash(), refetchRedeemed()]);
  }, [enabled, refetchCodeHash, refetchRedeemed]);

  const registerMyCode = useCallback(() => {
    if (!enabled || isCodeRegistered) return;
    resetRegister();
    writeRegister({
      address: HUB_CONTRACT_ADDRESS,
      abi: hubAbi,
      functionName: "registerReferralCode",
    });
  }, [enabled, isCodeRegistered, resetRegister, writeRegister]);

  const redeemFriendCode = useCallback(() => {
    if (!canRedeemFriendCode) return;
    resetRedeem();
    writeRedeem({
      address: HUB_CONTRACT_ADDRESS,
      abi: hubAbi,
      functionName: "redeemReferralCode",
      args: [normalizedFriendCode],
    });
  }, [canRedeemFriendCode, normalizedFriendCode, resetRedeem, writeRedeem]);

  return {
    myCode,
    isCodeRegistered,
    hasRedeemed: !!hasRedeemed,
    friendCodeInput,
    setFriendCodeInput,
    normalizedFriendCode,
    canRedeemFriendCode,
    registerMyCode,
    redeemFriendCode,
    isRegistering: isRegisterPending || isRegisterConfirming,
    isRedeeming: isRedeemPending || isRedeemConfirming,
    registerSuccess,
    redeemSuccess,
    registerError,
    redeemError,
    refresh,
  };
}
