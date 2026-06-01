"use client";

import { HUB_CONTRACT_ADDRESS, isContractConfigured } from "@/config/contract";
import { useGlobalTxCount } from "@/hooks/useGlobalTxCount";

const HUB_BASESCAN = `https://basescan.org/address/${HUB_CONTRACT_ADDRESS}`;

export function GlobalTxBar() {
  const { totalTx, formatted, isLoading } = useGlobalTxCount();

  if (!isContractConfigured) return null;

  const exact = totalTx.toLocaleString();

  return (
    <div
      className="uni-global-tx-bar"
      role="status"
      aria-live="polite"
      aria-label={`Total on-chain actions: ${exact}`}
    >
      <span className="uni-global-tx-bar-label">Total on-chain actions</span>
      <span className="uni-global-tx-bar-sep" aria-hidden>
        ·
      </span>
      <span
        className="uni-global-tx-bar-value uni-mono"
        title={exact}
      >
        {isLoading ? "…" : formatted}
      </span>
      <span className="uni-global-tx-bar-sep" aria-hidden>
        ·
      </span>
      <span className="uni-global-tx-bar-live">
        <span className="uni-global-tx-bar-pulse" aria-hidden />
        live
      </span>
      <a
        href={HUB_BASESCAN}
        target="_blank"
        rel="noopener noreferrer"
        className="uni-global-tx-bar-link"
        title="View Hub on Basescan"
      >
        Base
      </a>
    </div>
  );
}
