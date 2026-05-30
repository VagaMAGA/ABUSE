"use client";

import { useEffect, useRef, useState } from "react";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatEther, parseUnits } from "viem";

import {
  BOOST_GM_MULTIPLIER,
  DEPLOY_CHAIN_ID,
  DEPLOY_FEE_WEI,
  HUB_CONTRACT_ADDRESS,
  hubAbi,
} from "@/config/contract";
import { pointsForDeploy, POINTS_RULES } from "@/config/points";
import {
  PREVIEW_DEPLOY_COUNT,
  PREVIEW_POINTS,
} from "@/config/preview";
import { useHubStats } from "@/hooks/useHubStats";

function explorerAddressUrl(address: string) {
  return `https://basescan.org/address/${address}`;
}

function explorerTxUrl(hash: string) {
  return `https://basescan.org/tx/${hash}`;
}

type DeployPanelProps = {
  freeDeployAvailable?: boolean;
  deployFeeOnChain?: bigint;
  disabled?: boolean;
  preview?: boolean;
  onSuccess?: () => void;
};

export function DeployPanel({
  freeDeployAvailable = true,
  deployFeeOnChain,
  disabled,
  preview,
  onSuccess,
}: DeployPanelProps) {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [initialSupply, setInitialSupply] = useState("1000000");
  const [deployedToken, setDeployedToken] = useState<string | null>(null);
  const [lastEarned, setLastEarned] = useState<number | null>(null);
  const syncedTxHash = useRef<string | undefined>(undefined);

  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  const { points, deployCount, boostActiveUntil } = useHubStats();

  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const boostActive = preview
    ? true
    : boostActiveUntil != null && Number(boostActiveUntil) > now;

  const feeWei = deployFeeOnChain ?? DEPLOY_FEE_WEI;
  const feeLabel = formatEther(feeWei);
  const isPaidDeploy = preview ? false : !freeDeployAvailable;

  const { data: hash, isPending, writeContract, error: writeError, reset } =
    useWriteContract();

  const { isLoading: isConfirming, isSuccess, data: receipt } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (!isSuccess || !hash || !receipt) return;
    if (syncedTxHash.current === hash) return;
    syncedTxHash.current = hash;

    const tokenLog = receipt.logs.find(
      (log) => log.topics.length >= 3 && log.address !== HUB_CONTRACT_ADDRESS,
    );
    if (tokenLog) {
      setDeployedToken(tokenLog.address);
    }

    onSuccess?.();
  }, [isSuccess, hash, receipt, onSuccess]);

  const handleDeploy = () => {
    const name = tokenName.trim();
    const symbol = tokenSymbol.trim().toUpperCase();
    if (!name || !symbol) return;

    let supply: bigint;
    try {
      supply = parseUnits(initialSupply.trim() || "0", 18);
      if (supply <= BigInt(0)) return;
    } catch {
      return;
    }

    reset();
    setDeployedToken(null);
    setLastEarned(pointsForDeploy(isPaidDeploy, boostActive));
    syncedTxHash.current = undefined;

    writeContract({
      address: HUB_CONTRACT_ADDRESS,
      abi: hubAbi,
      functionName: "deployToken",
      args: [name, symbol, supply],
      chainId: DEPLOY_CHAIN_ID,
      value: isPaidDeploy ? feeWei : BigInt(0),
    });
  };

  const canSubmit =
    tokenName.trim().length > 0 &&
    tokenSymbol.trim().length > 0 &&
    initialSupply.trim().length > 0;

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <DeployStat
          label="Your deploys"
          value={
            preview ? String(PREVIEW_DEPLOY_COUNT) : deployCount?.toString() ?? "0"
          }
        />
        <DeployStat
          label="Points"
          value={preview ? String(PREVIEW_POINTS) : points?.toString() ?? "0"}
        />
      </div>

      {boostActive && (
        <p className="uni-caption text-center text-[var(--uni-success)]">
          {BOOST_GM_MULTIPLIER}× Boost — deploy earns double points
        </p>
      )}

      <p className="uni-caption text-center">
        {preview || freeDeployAvailable
          ? `1 free deploy per day · +${pointsForDeploy(false, boostActive)} pts`
          : `Paid deploy · ${feeLabel} ETH · +${pointsForDeploy(true, boostActive)} pts`}
      </p>

      <div className="uni-card-inset flex flex-col gap-4 p-4">
        <label className="flex flex-col gap-2">
          <span className="uni-label">Token name</span>
          <input
            type="text"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            placeholder="My Token"
            maxLength={32}
            className="uni-input"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="uni-label">Symbol</span>
          <input
            type="text"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
            placeholder="MTK"
            maxLength={11}
            className="uni-input uni-mono uppercase"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="uni-label">Initial supply</span>
          <input
            type="text"
            inputMode="decimal"
            value={initialSupply}
            onChange={(e) => setInitialSupply(e.target.value)}
            placeholder="1000000"
            className="uni-input uni-mono"
          />
          <span className="uni-caption">Whole tokens (18 decimals onchain)</span>
        </label>
      </div>

      <button
        type="button"
        onClick={handleDeploy}
        disabled={disabled || preview || !canSubmit || isPending || isConfirming}
        className="uni-btn uni-btn-primary"
      >
        {isPending
          ? "Confirm in wallet"
          : isConfirming
            ? "Deploying…"
            : isPaidDeploy
              ? `Deploy · ${feeLabel} ETH`
              : "Deploy · Free"}
      </button>

      {writeError && (
        <p className="uni-caption text-center text-[var(--uni-critical)]">
          {writeError.message.split("\n")[0]}
        </p>
      )}

      {isSuccess && hash && (
        <div className="uni-card-inset flex flex-col gap-2 p-4 text-center">
          <p className="uni-label text-[var(--uni-success)]">Token deployed</p>
          {lastEarned != null && (
            <p className="uni-caption text-[var(--uni-success)]">
              +{lastEarned} points earned
            </p>
          )}
          {deployedToken && (
            <a
              href={explorerAddressUrl(deployedToken)}
              target="_blank"
              rel="noreferrer"
              className="uni-link uni-mono break-all text-xs"
            >
              {deployedToken}
            </a>
          )}
          <a
            href={explorerTxUrl(hash)}
            target="_blank"
            rel="noreferrer"
            className="uni-link text-sm"
          >
            View on Basescan
          </a>
        </div>
      )}
    </div>
  );
}

function DeployStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="uni-card-inset px-3 py-2.5">
      <p className="uni-label">{label}</p>
      <p className="uni-mono mt-0.5 text-lg font-semibold text-[var(--uni-text)]">
        {value}
      </p>
    </div>
  );
}
