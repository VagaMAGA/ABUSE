"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

import { AppNav } from "@/components/AppNav";
import { ConnectWallet } from "@/components/ConnectWallet";
import { PreviewBanner } from "@/components/PreviewBanner";
import { DEPLOY_CHAIN_ID } from "@/config/contract";
import {
  isHubLiveMode,
  PREVIEW_LEADERBOARD,
  PREVIEW_USER_RANK,
  PREVIEW_USER_RANK_POINTS,
} from "@/config/preview";
import {
  truncateAddress,
  type LeaderboardRow,
} from "@/lib/leaderboard";

type LeaderboardResponse = {
  configured: boolean;
  entries: LeaderboardRow[];
  total: number;
  error?: string;
};

export function LeaderboardApp() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const wrongChain = isConnected && chainId !== DEPLOY_CHAIN_ID;
  const isLiveMode = isHubLiveMode({ isConnected, wrongChain });

  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isLiveMode) {
      setData({
        configured: false,
        entries: PREVIEW_LEADERBOARD,
        total: PREVIEW_LEADERBOARD.length,
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/leaderboard", { cache: "no-store" });
      const json = (await res.json()) as LeaderboardResponse;
      setData(json);
    } catch {
      setData({
        configured: true,
        entries: [],
        total: 0,
        error: "Could not load leaderboard",
      });
    } finally {
      setLoading(false);
    }
  }, [isLiveMode]);

  useEffect(() => {
    void load();
  }, [load]);

  const entries = useMemo(() => {
    if (!isLiveMode) return PREVIEW_LEADERBOARD;
    return data?.entries ?? [];
  }, [data?.entries, isLiveMode]);

  const myRank = useMemo(() => {
    if (!isLiveMode) {
      return PREVIEW_LEADERBOARD.find((e) => e.rank === PREVIEW_USER_RANK);
    }
    if (!address) return undefined;
    return entries.find(
      (e) => e.address.toLowerCase() === address.toLowerCase(),
    );
  }, [address, entries, isLiveMode]);

  const showYourRank = isLiveMode ? isConnected && myRank : true;

  return (
    <>
      <AppNav />

      <header className="uni-card px-5 py-5">
        <h1 className="uni-title text-2xl">Leaderboard</h1>
        <p className="uni-body mt-2 text-sm">
          All Hub participants ranked by total points.
        </p>
      </header>

      {!isLiveMode && <PreviewBanner />}

      <div className="uni-card px-4 py-5">
        <ConnectWallet />
      </div>

      {wrongChain && (
        <button
          type="button"
          className="uni-btn uni-btn-primary"
          disabled={isSwitching}
          onClick={() => switchChain({ chainId: DEPLOY_CHAIN_ID })}
        >
          {isSwitching ? "Switching…" : "Switch to Base"}
        </button>
      )}

      {showYourRank && myRank && (
        <div className="uni-card px-4 py-4">
          <p className="uni-label">
            Your rank
            {!isLiveMode && (
              <span className="ml-1 text-[10px] font-normal uppercase tracking-wide text-[var(--uni-text-tertiary)]">
                demo
              </span>
            )}
          </p>
          <p className="uni-mono mt-1 text-xl font-semibold uni-text-accent">
            #{myRank.rank} · {myRank.points} pts
          </p>
          <p className="uni-caption mt-1">
            {myRank.gmCount} GM · {myRank.deployCount} deploys
          </p>
        </div>
      )}

      <div className="uni-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--uni-border)] px-4 py-3">
          <p className="uni-label">
            {loading
              ? "Loading…"
              : `${entries.length} participant${entries.length === 1 ? "" : "s"}`}
            {!isLiveMode && (
              <span className="ml-1 text-[10px] font-normal uppercase tracking-wide text-[var(--uni-text-tertiary)]">
                demo
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="uni-btn uni-btn-ghost uni-btn-sm"
          >
            Refresh
          </button>
        </div>

        {isLiveMode && data?.error && (
          <div className="px-4 py-4">
            <p className="uni-body text-sm text-[var(--uni-critical)]">
              {data.error}
            </p>
            <p className="uni-caption mt-2">
              Tip: set <span className="uni-code">BASE_RPC_URL</span> in Vercel
              (Alchemy or Infura), redeploy, then Refresh.
            </p>
          </div>
        )}

        {isLiveMode &&
          !loading &&
          data?.configured &&
          entries.length === 0 && (
            <p className="uni-caption px-4 py-8 text-center">
              No activity yet. Be the first on the App tab.
            </p>
          )}

        {entries.length > 0 && (
          <ul className="divide-y divide-[var(--uni-border)]">
            {entries.map((entry) => {
              const isYou =
                isLiveMode &&
                address?.toLowerCase() === entry.address.toLowerCase();
              const isDemoYou =
                !isLiveMode && entry.rank === PREVIEW_USER_RANK;
              const highlight = isYou || isDemoYou;
              return (
                <li
                  key={`${entry.rank}-${entry.address}`}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    highlight ? "bg-[var(--uni-pink-muted)]" : ""
                  }`}
                >
                  <RankBadge rank={entry.rank} />
                  <div className="min-w-0 flex-1">
                    <p className="uni-mono text-sm font-medium text-[var(--uni-text)]">
                      {truncateAddress(entry.address)}
                      {highlight && (
                        <span className="ml-2 text-xs uni-text-accent">
                          {isLiveMode ? "you" : "demo you"}
                        </span>
                      )}
                    </p>
                    <p className="uni-caption">
                      {entry.gmCount} GM · {entry.deployCount} deploy
                    </p>
                  </div>
                  <p className="uni-mono text-base font-semibold uni-text-accent">
                    {entry.points}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {!isLiveMode && (
        <p className="uni-caption text-center">
          Demo rank #{PREVIEW_USER_RANK} · {PREVIEW_USER_RANK_POINTS} pts
        </p>
      )}
    </>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const top =
    rank === 1
      ? "text-[#FFD700]"
      : rank === 2
        ? "text-[#C0C0C0]"
        : rank === 3
          ? "text-[#CD7F32]"
          : "text-[var(--uni-text-tertiary)]";

  return (
    <span
      className={`uni-mono flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--uni-surface-2)] text-sm font-bold ${top}`}
    >
      {rank}
    </span>
  );
}
