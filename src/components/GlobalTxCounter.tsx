"use client";

import { useGlobalTxCount } from "@/hooks/useGlobalTxCount";

export function GlobalTxCounter() {
  const { formatted, isLive, isLoading } = useGlobalTxCount();

  return (
    <div
      className="uni-global-tx hidden shrink-0 sm:flex sm:flex-col sm:items-end sm:justify-center sm:border-r sm:border-[var(--uni-border)] sm:pr-2.5"
      title="Total on-chain actions across all users (Hub, badges, staking)"
    >
      <span className="uni-label text-[9px] uppercase tracking-[0.12em] text-[var(--uni-text-tertiary)]">
        Total txs
      </span>
      <span className="uni-mono text-sm font-semibold leading-tight text-[var(--uni-pink)]">
        {isLoading ? "…" : formatted}
        {!isLive && (
          <span className="ml-1 text-[9px] font-normal normal-case tracking-normal text-[var(--uni-text-tertiary)]">
            demo
          </span>
        )}
      </span>
    </div>
  );
}
