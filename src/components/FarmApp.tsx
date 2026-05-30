"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useChainId, useSwitchChain } from "wagmi";

import { TOKEN_SYMBOL } from "@/config/app";
import { AppNav } from "@/components/AppNav";
import { ConnectWallet } from "@/components/ConnectWallet";
import { PreviewBanner } from "@/components/PreviewBanner";
import { DEPLOY_CHAIN_ID } from "@/config/contract";
import {
  isHubLiveMode,
  PREVIEW_CODE,
  PREVIEW_DAILY_DONE,
  PREVIEW_DAILY_ITEMS,
  PREVIEW_DAILY_TOTAL,
  PREVIEW_FARM_GM,
  PREVIEW_FARM_POINTS,
  PREVIEW_SETUP_DONE,
  PREVIEW_SETUP_ITEMS,
  PREVIEW_SETUP_TOTAL,
} from "@/config/preview";
import {
  DAILY_FREE_POINTS_MAX,
  farmRankForPoints,
  nextFarmRank,
  rankProgressPercent,
  simulateDailyPoints,
  simulateReferralPoints,
} from "@/config/farm";
import { POINTS_PER_REFERRAL } from "@/config/referral";
import type { FarmCheckItem } from "@/hooks/useFarmProgress";
import { useFarmProgress } from "@/hooks/useFarmProgress";
import { useFarcasterMiniApp } from "@/hooks/useFarcasterMiniApp";
import { shareOnFarcaster, shareOnX } from "@/lib/shareReferral";

type Tab = "today" | "setup" | "calc";

export function FarmApp() {
  const [tab, setTab] = useState<Tab>("today");
  const [friendSlider, setFriendSlider] = useState(3);
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { inMiniApp } = useFarcasterMiniApp();

  const {
    isConnected,
    pointsNum: livePointsNum,
    gmCount: liveGmCount,
    myCode: liveMyCode,
    dailyItems: liveDailyItems,
    setupItems: liveSetupItems,
    dailyDone: liveDailyDone,
    dailyTotal: liveDailyTotal,
    setupDone: liveSetupDone,
    setupTotal: liveSetupTotal,
    markShared,
  } = useFarmProgress();

  const wrongChain = isConnected && chainId !== DEPLOY_CHAIN_ID;
  const isLiveMode = isHubLiveMode({ isConnected, wrongChain });
  const showFarm = isLiveMode ? isConnected && !wrongChain : true;

  const pointsNum = isLiveMode ? livePointsNum : PREVIEW_FARM_POINTS;
  const gmCount = isLiveMode ? liveGmCount : PREVIEW_FARM_GM;
  const myCode = isLiveMode ? liveMyCode : PREVIEW_CODE;
  const dailyItems = isLiveMode ? liveDailyItems : PREVIEW_DAILY_ITEMS;
  const setupItems = isLiveMode ? liveSetupItems : PREVIEW_SETUP_ITEMS;
  const dailyDone = isLiveMode ? liveDailyDone : PREVIEW_DAILY_DONE;
  const dailyTotal = isLiveMode ? liveDailyTotal : PREVIEW_DAILY_TOTAL;
  const setupDone = isLiveMode ? liveSetupDone : PREVIEW_SETUP_DONE;
  const setupTotal = isLiveMode ? liveSetupTotal : PREVIEW_SETUP_TOTAL;
  const rank = farmRankForPoints(pointsNum);
  const nextRank = nextFarmRank(pointsNum);
  const ringPct = rankProgressPercent(pointsNum);
  const dailyPct =
    dailyTotal > 0 ? Math.round((dailyDone / dailyTotal) * 100) : 0;

  const projectedDaily = simulateDailyPoints(3, true);
  const projectedFriends = simulateReferralPoints(friendSlider);
  const projectedTotal = pointsNum + projectedDaily + projectedFriends;

  const nextStep = useMemo(() => {
    const pending = [...dailyItems, ...setupItems].find((i) => !i.done);
    return pending ?? null;
  }, [dailyItems, setupItems]);

  const handleShareX = useCallback(() => {
    if (!myCode) return;
    shareOnX(myCode);
    markShared();
  }, [myCode, markShared]);

  const handleShareFc = useCallback(() => {
    if (!myCode) return;
    void shareOnFarcaster(myCode, inMiniApp).then(markShared);
  }, [myCode, inMiniApp, markShared]);

  return (
    <>
      <AppNav />

      <header className="uni-card px-5 py-5 text-center">
        <p className="uni-eyebrow">Guide · Base</p>
        <h1 className="uni-title mt-2 text-3xl">Farm {TOKEN_SYMBOL}</h1>
        <p className="uni-body mt-2 text-sm">
          Live checklist tied to your wallet. More points = stronger{" "}
          <span className="uni-text-accent font-semibold">{TOKEN_SYMBOL}</span> farm story.
        </p>
      </header>

      {!isLiveMode && <PreviewBanner />}

      <div className="uni-card px-4 py-5">
        <ConnectWallet />
      </div>

      {wrongChain && isLiveMode && (
        <button
          type="button"
          className="uni-btn uni-btn-primary"
          disabled={isSwitching}
          onClick={() => switchChain({ chainId: DEPLOY_CHAIN_ID })}
        >
          {isSwitching ? "Switching…" : "Switch to Base"}
        </button>
      )}

      {wrongChain && !isLiveMode && (
        <button
          type="button"
          className="uni-btn uni-btn-primary"
          disabled={isSwitching}
          onClick={() => switchChain({ chainId: DEPLOY_CHAIN_ID })}
        >
          {isSwitching ? "Switching…" : "Switch to Base (for live play)"}
        </button>
      )}

      {showFarm && (
        <>
          <div className="uni-card flex items-center gap-4 px-4 py-4">
            <FarmRing percent={ringPct} />
            <div className="min-w-0 flex-1">
              <p className="uni-label">Farm rank</p>
              <p className="uni-title text-2xl">{rank.label}</p>
              <p className="uni-mono mt-1 text-lg font-semibold text-[var(--uni-pink)]">
                {pointsNum.toLocaleString()} pts
                {!isLiveMode && (
                  <span className="ml-1 text-xs font-normal text-[var(--uni-text-tertiary)]">
                    demo
                  </span>
                )}
              </p>
              {nextRank ? (
                <p className="uni-caption mt-1">
                  {ringPct}% to {nextRank.label} ({nextRank.minPoints} pts)
                </p>
              ) : (
                <p className="uni-caption mt-1 text-[var(--uni-success)]">
                  Max rank — keep farming
                </p>
              )}
            </div>
          </div>

          {nextStep && (
            <div className="uni-airdrop-callout px-4 py-3">
              <p className="uni-label">Do this next</p>
              <p className="uni-airdrop-text mt-1 text-left">
                <span className="font-semibold">{nextStep.title}</span>
                {nextStep.pointsLabel ? (
                  <span className="uni-text-accent"> · {nextStep.pointsLabel}</span>
                ) : null}
              </p>
              <Link
                href={nextStep.href}
                className="uni-btn uni-btn-primary uni-btn-sm mt-3 inline-flex w-full justify-center"
              >
                Go →
              </Link>
            </div>
          )}

          <div className="uni-tabs">
            {(
              [
                ["today", "Today"],
                ["setup", "Setup"],
                ["calc", "Calculator"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`uni-tab ${tab === id ? "uni-tab-active" : ""}`}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "today" && (
            <>
              <DailyProgress done={dailyDone} total={dailyTotal} pct={dailyPct} />
              <Checklist
                title="Daily acid loop"
                subtitle={`Up to +${DAILY_FREE_POINTS_MAX} pts/day from free actions`}
                items={dailyItems}
              />
              {dailyPct === 100 && (
                <p className="uni-caption text-center text-[var(--uni-success)]">
                  Perfect acid day — come back tomorrow UTC
                </p>
              )}
            </>
          )}

          {tab === "setup" && (
            <Checklist
              title="One-time power moves"
              subtitle="Biggest boosts for new farmers"
              items={setupItems}
              shareCode={myCode ?? undefined}
              onShareX={myCode ? handleShareX : undefined}
              onShareFc={myCode ? handleShareFc : undefined}
              onShareMark={markShared}
            />
          )}

          {tab === "calc" && (
            <div className="flex flex-col gap-3">
              <div className="uni-card px-4 py-4">
                <p className="uni-label">Referral simulator</p>
                <p className="uni-caption mt-1">
                  Friends who redeem your code: +{POINTS_PER_REFERRAL} pts each
                  (you)
                </p>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={friendSlider}
                  onChange={(e) => setFriendSlider(Number(e.target.value))}
                  className="mt-4 w-full accent-[var(--uni-pink)]"
                />
                <p className="uni-mono mt-2 text-center text-lg font-semibold">
                  {friendSlider} friends → +{projectedFriends} pts
                </p>
              </div>

              <div className="uni-card-inset px-4 py-3">
                <p className="uni-label">If you also max today</p>
                <ul className="uni-caption mt-2 space-y-1">
                  <li>Current: {pointsNum.toLocaleString()} pts</li>
                  <li>+{projectedDaily} from perfect daily</li>
                  <li>+{projectedFriends} from referrals above</li>
                  <li className="uni-text-accent font-semibold">
                    ≈ {projectedTotal.toLocaleString()} pts total
                  </li>
                </ul>
              </div>

              <p className="uni-caption text-center opacity-80">
                Points are in-app score for {TOKEN_SYMBOL} narrative — not a token guarantee.
              </p>
            </div>
          )}

          <div className="uni-card-inset px-4 py-3 text-center">
            <p className="uni-caption">
              {gmCount} GMs total
              {myCode ? (
                <>
                  {" "}
                  · code{" "}
                  <span className="uni-mono uni-text-accent">{myCode}</span>
                </>
              ) : null}
            </p>
          </div>
        </>
      )}
    </>
  );
}

function FarmRing({ percent }: { percent: number }) {
  return (
    <div
      className="relative h-20 w-20 shrink-0 rounded-full"
      style={{
        background: `conic-gradient(var(--uni-pink) ${percent}%, var(--uni-surface-2) 0)`,
      }}
    >
      <div className="absolute inset-[5px] flex items-center justify-center rounded-full bg-[var(--uni-surface-1)] text-sm font-bold text-[var(--uni-text)]">
        {percent}%
      </div>
    </div>
  );
}

function DailyProgress({
  done,
  total,
  pct,
}: {
  done: number;
  total: number;
  pct: number;
}) {
  return (
    <div className="uni-card px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="uni-label">Today&apos;s farm</p>
        <p className="uni-mono text-sm font-semibold text-[var(--uni-pink)]">
          {done}/{total}
        </p>
      </div>
      <div className="uni-badges-collection-bar mt-2">
        <div
          className="uni-badges-collection-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Checklist({
  title,
  subtitle,
  items,
  shareCode,
  onShareX,
  onShareFc,
  onShareMark,
}: {
  title: string;
  subtitle: string;
  items: FarmCheckItem[];
  shareCode?: string;
  onShareX?: () => void;
  onShareFc?: () => void;
  onShareMark?: () => void;
}) {
  return (
    <div className="uni-card px-4 py-4">
      <p className="uni-heading">{title}</p>
      <p className="uni-caption mt-1">{subtitle}</p>
      <ul className="mt-4 flex flex-col gap-2">
        {items.map((item) => (
          <ChecklistRow
            key={item.id}
            item={item}
            shareCode={item.id === "share-code" ? shareCode : undefined}
            onShareX={item.id === "share-code" ? onShareX : undefined}
            onShareFc={item.id === "share-code" ? onShareFc : undefined}
            onShareMark={item.id === "share-code" ? onShareMark : undefined}
          />
        ))}
      </ul>
    </div>
  );
}

function ChecklistRow({
  item,
  shareCode,
  onShareX,
  onShareFc,
  onShareMark,
}: {
  item: FarmCheckItem;
  shareCode?: string;
  onShareX?: () => void;
  onShareFc?: () => void;
  onShareMark?: () => void;
}) {
  return (
    <li
      className={`flex gap-3 rounded-xl border px-3 py-3 transition-colors ${
        item.done
          ? "border-[var(--uni-success)]/30 bg-[var(--uni-success)]/5"
          : "border-[var(--uni-border)] bg-[var(--uni-bg-elevated)]"
      }`}
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          item.done
            ? "bg-[var(--uni-success)] text-[#0a0f08]"
            : "border border-[var(--uni-border-strong)] text-[var(--uni-text-tertiary)]"
        }`}
        aria-hidden
      >
        {item.done ? "✓" : ""}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-semibold ${item.done ? "text-[var(--uni-text-secondary)] line-through" : "text-[var(--uni-text)]"}`}
        >
          {item.title}
          {item.optional ? (
            <span className="uni-caption ml-1 font-normal">(optional)</span>
          ) : null}
        </p>
        <p className="uni-caption mt-0.5">{item.description}</p>
        {item.pointsLabel && !item.done && (
          <p className="uni-caption mt-1 text-[var(--uni-pink)]">
            {item.pointsLabel}
          </p>
        )}
        {!item.done && (
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              href={item.href}
              className="uni-btn uni-btn-secondary uni-btn-sm"
            >
              Open
            </Link>
            {shareCode && onShareX && onShareFc && (
              <>
                <button
                  type="button"
                  className="uni-btn uni-btn-secondary uni-btn-sm"
                  onClick={onShareX}
                >
                  Share on X
                </button>
                <button
                  type="button"
                  className="uni-btn uni-btn-secondary uni-btn-sm"
                  onClick={() => void onShareFc()}
                >
                  Share on Farcaster
                </button>
              </>
            )}
            {onShareMark && (
              <button
                type="button"
                className="uni-btn uni-btn-ghost uni-btn-sm"
                onClick={onShareMark}
              >
                Mark shared
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
