import { APP_NAME, PRODUCTION_SITE_URL, TOKEN_SYMBOL } from "@/config/app";
import { CANONICAL_SITE_URL } from "@/config/appAssets";
import { POINTS_PER_REFERRAL } from "@/config/referral";

export type ReferralShareCopy = {
  /** Cast body — app link is attached as embed, not duplicated in text */
  farcasterText: string;
  /** Post body — referral URL is appended by the X intent */
  xText: string;
};

/** Public URL for referral shares (never localhost) */
export function getShareSiteOrigin(): string {
  const canonical = CANONICAL_SITE_URL.replace(/\/$/, "");
  if (
    canonical.includes("localhost") ||
    canonical.includes("127.0.0.1")
  ) {
    return PRODUCTION_SITE_URL.replace(/\/$/, "");
  }
  return canonical;
}

/** Opens referral page with code prefilled for friends */
export function buildReferralShareUrl(
  code: string,
  origin: string = getShareSiteOrigin(),
): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/referral?code=${encodeURIComponent(code)}`;
}

export function buildReferralShareCopy(code: string): ReferralShareCopy {
  const pts = POINTS_PER_REFERRAL;

  const farcasterText = `Join me on ${APP_NAME} on Base

Referral code: ${code}
Redeem once — you and I each get +${pts} points.

GM, Boost, deploy & ${TOKEN_SYMBOL} badge NFTs.`;

  const xText = `Join ${APP_NAME} on Base — code ${code}

+${pts} points each when you redeem (you + me). GM, Boost, deploy & ${TOKEN_SYMBOL} badges.`;

  return { farcasterText, xText };
}
