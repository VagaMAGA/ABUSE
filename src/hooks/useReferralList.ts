"use client";

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

import { isContractConfigured } from "@/config/contract";
import type { ReferralRedemption } from "@/lib/fetchReferrals";

type ReferralsResponse = {
  configured: boolean;
  referrals: ReferralRedemption[];
  total: number;
  error?: string;
};

async function fetchReferralList(referrer: string): Promise<ReferralsResponse> {
  const res = await fetch(
    `/api/referrals?referrer=${encodeURIComponent(referrer)}`,
    { cache: "no-store" },
  );
  return (await res.json()) as ReferralsResponse;
}

export function useReferralList() {
  const { address } = useAccount();
  const enabled = Boolean(address) && isContractConfigured;

  const query = useQuery({
    queryKey: ["referrals", address?.toLowerCase()],
    queryFn: () => fetchReferralList(address!),
    enabled,
    staleTime: 30_000,
  });

  const refreshReferrals = useCallback(async () => {
    if (!enabled) return;
    await query.refetch();
  }, [enabled, query]);

  return {
    referrals: query.data?.referrals ?? [],
    total: query.data?.total ?? 0,
    error: query.data?.error ?? (query.error instanceof Error ? query.error.message : null),
    isLoading: query.isLoading || query.isFetching,
    refreshReferrals,
  };
}
