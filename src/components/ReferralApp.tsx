"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

import { AppNav } from "@/components/AppNav";
import { ConnectWallet } from "@/components/ConnectWallet";
import { PreviewBanner } from "@/components/PreviewBanner";
import { DEPLOY_CHAIN_ID } from "@/config/contract";
import { POINTS_PER_REFERRAL } from "@/config/referral";
import {
  isHubLiveMode,
  PREVIEW_CODE,
  PREVIEW_POINTS,
  PREVIEW_REFERRAL_COUNT,
  PREVIEW_REFERRAL_POINTS,
  PREVIEW_REFERRALS,
} from "@/config/preview";
import { useHubStats } from "@/hooks/useHubStats";
import { useReferralCode } from "@/hooks/useReferralCode";
import { useReferralList } from "@/hooks/useReferralList";
import { FARM_SHARE_STORAGE_KEY } from "@/config/farm";
import { copyToClipboard } from "@/lib/copyToClipboard";
import { truncateAddress } from "@/lib/leaderboard";
import { shareOnFarcaster, shareOnX } from "@/lib/shareReferral";
import { useFarcasterMiniApp } from "@/hooks/useFarcasterMiniApp";
import {
  isValidReferralCodeFormat,
  normalizeReferralCodeInput,
  REFERRAL_CODE_LENGTH,
} from "@/lib/referralCode";

export function ReferralApp() {
  const searchParams = useSearchParams();
  const { inMiniApp } = useFarcasterMiniApp();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const wrongChain = isConnected && chainId !== DEPLOY_CHAIN_ID;
  const isLiveMode = isHubLiveMode({ isConnected, wrongChain });

  const { referralCount, points, refreshStats } = useHubStats();
  const {
    myCode,
    isCodeRegistered,
    hasRedeemed,
    friendCodeInput,
    setFriendCodeInput,
    normalizedFriendCode,
    canRedeemFriendCode,
    registerMyCode,
    redeemFriendCode,
    isRegistering,
    isRedeeming,
    registerSuccess,
    redeemSuccess,
    registerError,
    redeemError,
    refresh,
  } = useReferralCode();

  const {
    referrals,
    error: referralsError,
    isLoading: referralsLoading,
    refreshReferrals,
  } = useReferralList();

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fromLink = searchParams.get("code");
    if (!fromLink || hasRedeemed) return;
    const normalized = normalizeReferralCodeInput(fromLink);
    if (isValidReferralCodeFormat(normalized)) {
      setFriendCodeInput(normalized);
    }
  }, [searchParams, hasRedeemed, setFriendCodeInput]);

  const referralPointsEarned = useMemo(() => {
    if (!isLiveMode) return PREVIEW_REFERRAL_POINTS;
    const count = Number(referralCount ?? BigInt(0));
    return count * POINTS_PER_REFERRAL;
  }, [isLiveMode, referralCount]);

  const displayReferralCount = isLiveMode
    ? referralCount?.toString() ?? "0"
    : String(PREVIEW_REFERRAL_COUNT);
  const displayPoints = isLiveMode
    ? points?.toString() ?? "0"
    : String(PREVIEW_POINTS);
  const displayCode = isLiveMode ? myCode : PREVIEW_CODE;
  const displayReferrals = isLiveMode ? referrals : PREVIEW_REFERRALS;
  const displayCodeRegistered = isLiveMode ? isCodeRegistered : true;
  const displayHasRedeemed = isLiveMode ? hasRedeemed : false;
  const actionsDisabled = !isLiveMode;

  useEffect(() => {
    if (!isLiveMode) return;
    if (registerSuccess || redeemSuccess) {
      void refresh();
      void refreshStats();
      void refreshReferrals();
    }
  }, [
    isLiveMode,
    registerSuccess,
    redeemSuccess,
    refresh,
    refreshStats,
    refreshReferrals,
  ]);

  useEffect(() => {
    if (!isLiveMode || !isConnected || referralCount == null) return;
    void refreshReferrals();
  }, [isLiveMode, isConnected, referralCount, refreshReferrals]);

  const markFarmShared = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(FARM_SHARE_STORAGE_KEY, "1");
    }
  }, []);

  const handleCopyCode = useCallback(async () => {
    if (!displayCode) return;
    const ok = await copyToClipboard(displayCode);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }, [displayCode]);

  const handleShareX = useCallback(() => {
    if (!displayCode || actionsDisabled) return;
    shareOnX(displayCode);
    markFarmShared();
  }, [displayCode, actionsDisabled, markFarmShared]);

  const handleShareFc = useCallback(() => {
    if (!displayCode || actionsDisabled) return;
    void shareOnFarcaster(displayCode, inMiniApp).then(markFarmShared);
  }, [displayCode, actionsDisabled, inMiniApp, markFarmShared]);

  const codeInputInvalid =
    friendCodeInput.trim().length > 0 &&
    !isValidReferralCodeFormat(normalizedFriendCode);

  return (
    <>
      <AppNav />

      <header className="uni-card px-5 py-5 text-center">
        <p className="uni-eyebrow">Invite friends · Base</p>
        <h1 className="uni-title mt-2 text-3xl">Referral code</h1>
        <p className="uni-body mt-2 text-sm">
          Share your personal code. When a friend enters it, you both get{" "}
          <span className="uni-text-accent font-semibold">
            +{POINTS_PER_REFERRAL} points
          </span>{" "}
          instantly.
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

      {(isLiveMode ? isConnected && !wrongChain : true) && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <ReferralStat
              label="Friends joined"
              value={displayReferralCount}
              demo={!isLiveMode}
            />
            <ReferralStat
              label="Points from codes"
              value={referralPointsEarned.toString()}
              accent
              demo={!isLiveMode}
            />
          </div>

          <div className="uni-card px-4 py-4">
            <div className="flex items-center justify-between gap-2">
              <p className="uni-label">Friends who joined</p>
              {isLiveMode && (
                <button
                  type="button"
                  className="uni-link text-xs"
                  disabled={referralsLoading}
                  onClick={() => void refreshReferrals()}
                >
                  {referralsLoading ? "Loading…" : "Refresh"}
                </button>
              )}
            </div>
            <p className="uni-caption mt-1">
              Wallets that redeemed your code (+{POINTS_PER_REFERRAL} pts each)
            </p>

            {isLiveMode && referralsError && (
              <p className="uni-caption mt-3 text-[var(--uni-critical)]">
                {referralsError}
              </p>
            )}

            {isLiveMode &&
              !referralsLoading &&
              !referralsError &&
              Number(referralCount ?? BigInt(0)) === 0 && (
                <p className="uni-caption mt-4 text-center">
                  No friends yet — share your code to get started.
                </p>
              )}

            {isLiveMode &&
              !referralsLoading &&
              !referralsError &&
              Number(referralCount ?? BigInt(0)) > 0 &&
              referrals.length === 0 && (
                <p className="uni-caption mt-4 text-center">
                  Syncing referral history…
                </p>
              )}

            {displayReferrals.length > 0 && (
              <ul className="mt-3 divide-y divide-[var(--uni-border)] border border-[var(--uni-border)]">
                {displayReferrals.map((entry) => (
                  <li
                    key={`${entry.referee}-${entry.transactionHash}`}
                    className="flex items-center justify-between gap-3 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <a
                        href={`https://basescan.org/address/${entry.referee}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="uni-mono text-sm uni-link"
                      >
                        {truncateAddress(entry.referee)}
                      </a>
                      <p className="uni-caption mt-0.5">
                        Redeemed your code
                      </p>
                    </div>
                    <p className="uni-mono text-sm font-semibold uni-text-accent">
                      +{POINTS_PER_REFERRAL}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="uni-card px-4 py-4">
            <p className="uni-label">Your code</p>
            <p className="uni-mono mt-2 text-center text-3xl font-bold tracking-[0.2em] text-[var(--uni-pink)]">
              {displayCode || "——"}
            </p>
            <p className="uni-caption mt-2 text-center">
              Unique to your wallet — share with friends
            </p>
            <button
              type="button"
              className="uni-btn uni-btn-secondary mt-4 w-full"
              onClick={() => void handleCopyCode()}
            >
              {copied ? "Copied!" : "Copy code"}
            </button>
            {!displayCodeRegistered && (
              <>
                <p className="uni-caption mt-3 text-center">
                  Activate once on-chain so others can redeem your code.
                </p>
                <button
                  type="button"
                  className="uni-btn uni-btn-primary mt-3 w-full"
                  disabled={actionsDisabled || isRegistering}
                  onClick={registerMyCode}
                >
                  {isRegistering ? "Confirm in wallet…" : "Activate my code"}
                </button>
                {registerError && (
                  <p className="uni-caption mt-2 text-center text-[var(--uni-critical)]">
                    {registerError.message.split("\n")[0]}
                  </p>
                )}
              </>
            )}
            {displayCodeRegistered && (
              <p className="uni-caption mt-3 text-center text-[var(--uni-success)]">
                Code active — friends can redeem it
              </p>
            )}
            {displayCode && displayCodeRegistered && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="uni-btn uni-btn-secondary uni-btn-sm"
                  disabled={actionsDisabled}
                  onClick={handleShareX}
                >
                  Share on X
                </button>
                <button
                  type="button"
                  className="uni-btn uni-btn-secondary uni-btn-sm"
                  disabled={actionsDisabled}
                  onClick={() => void handleShareFc()}
                >
                  Share on Farcaster
                </button>
              </div>
            )}
          </div>

          <div className="uni-card px-4 py-4">
            <p className="uni-label">Enter a friend&apos;s code</p>
            <p className="uni-caption mt-1">
              {REFERRAL_CODE_LENGTH} characters · letters &amp; numbers
            </p>
            <input
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              maxLength={REFERRAL_CODE_LENGTH}
              placeholder="ABC123"
              value={friendCodeInput}
              disabled={actionsDisabled || displayHasRedeemed || isRedeeming}
              onChange={(e) => setFriendCodeInput(e.target.value)}
              className="uni-input uni-mono mt-3 text-center text-xl tracking-[0.15em] uppercase"
              aria-label="Friend referral code"
            />
            {codeInputInvalid && (
              <p className="uni-caption mt-2 text-center text-[var(--uni-critical)]">
                Enter a valid {REFERRAL_CODE_LENGTH}-character code
              </p>
            )}
            {displayHasRedeemed ? (
              <p className="uni-caption mt-3 text-center text-[var(--uni-success)]">
                You already used a referral code (+{POINTS_PER_REFERRAL} pts)
              </p>
            ) : (
              <button
                type="button"
                className="uni-btn uni-btn-primary mt-4 w-full"
                disabled={
                  actionsDisabled || !canRedeemFriendCode || isRedeeming
                }
                onClick={redeemFriendCode}
              >
                {isRedeeming ? "Confirm in wallet…" : "Redeem code"}
              </button>
            )}
            {redeemError && (
              <p className="uni-caption mt-2 text-center text-[var(--uni-critical)]">
                {redeemError.message.split("\n")[0]}
              </p>
            )}
            {redeemSuccess && (
              <p className="uni-caption mt-2 text-center text-[var(--uni-success)]">
                Success! You and your friend each got +{POINTS_PER_REFERRAL}{" "}
                points.
              </p>
            )}
          </div>

          <div className="uni-card-inset px-4 py-3">
            <p className="uni-label">How it works</p>
            <ol className="uni-caption mt-2 list-decimal space-y-1 pl-4">
              <li>Tap Activate my code (one-time).</li>
              <li>Share your 6-character code with a friend.</li>
              <li>They enter it here and tap Redeem code.</li>
              <li>
                You both receive +{POINTS_PER_REFERRAL} points immediately.
              </li>
            </ol>
          </div>

          <p className="uni-caption text-center">
            Total points:{" "}
            <span className="uni-mono uni-text-accent">
              {displayPoints}
            </span>
            {!isLiveMode && (
              <span className="text-[var(--uni-text-tertiary)]"> (demo)</span>
            )}
          </p>
        </>
      )}
    </>
  );
}

function ReferralStat({
  label,
  value,
  accent,
  demo,
}: {
  label: string;
  value: string;
  accent?: boolean;
  demo?: boolean;
}) {
  return (
    <div className="uni-card-inset px-3 py-2.5">
      <p className="uni-label">
        {label}
        {demo && (
          <span className="ml-1 text-[10px] font-normal uppercase tracking-wide text-[var(--uni-text-tertiary)]">
            demo
          </span>
        )}
      </p>
      <p
        className={`uni-mono mt-0.5 text-lg font-semibold ${accent ? "uni-text-accent" : "text-[var(--uni-text)]"}`}
      >
        {value}
      </p>
    </div>
  );
}
