import {
  APP_NAME,
  FARCASTER_DESCRIPTION,
  FARCASTER_SUBTITLE,
} from "@/config/app";
import {
  CANONICAL_SITE_URL,
  getAppHeroUrl,
  getAppIconUrl,
  getAppImageUrl,
  getAppSplashUrl,
} from "@/config/appAssets";

/** Fill after domain verification at /.well-known/farcaster.json */
export const FARCASTER_ACCOUNT_ASSOCIATION: {
  header: string;
  payload: string;
  signature: string;
} = {
  header:
    "eyJmaWQiOjc3NzcyNiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGFGNTAxNkQ2REU4YjI3NUY0NEU0NjA2NzgzOTUwM0ZjMzg1RDIwZGQifQ",
  payload: "eyJkb21haW4iOiJhYnVzZS1pb3RhLnZlcmNlbC5hcHAifQ",
  signature:
    "bRkx2Ic3NR2np3tPXTffLDb/8+MwxPMI40/2NYzVjHdVTsyQclbfSRAtHbVOuosze3O8HG08kBo3k2CBQBiGXBs=",
};

export const FARCASTER_BUTTON_TITLE = "Open app";
export const FARCASTER_SPLASH_BACKGROUND_COLOR = "#0a0608";

function buildMiniappMetadata(origin: string) {
  return {
    version: "1",
    name: APP_NAME,
    homeUrl: origin,
    iconUrl: getAppIconUrl(origin),
    imageUrl: getAppImageUrl(origin),
    heroImageUrl: getAppHeroUrl(origin),
    buttonTitle: FARCASTER_BUTTON_TITLE,
    splashImageUrl: getAppSplashUrl(origin),
    splashBackgroundColor: FARCASTER_SPLASH_BACKGROUND_COLOR,
    webhookUrl: `${origin}/api/webhook`,
    description: FARCASTER_DESCRIPTION,
    subtitle: FARCASTER_SUBTITLE,
    primaryCategory: "social",
    tags: ["base", "miniapp"],
    noindex: false,
  } as const;
}

export function buildFarcasterManifest() {
  const origin = CANONICAL_SITE_URL.replace(/\/$/, "");
  const metadata = buildMiniappMetadata(origin);

  return {
    accountAssociation: FARCASTER_ACCOUNT_ASSOCIATION,
    miniapp: metadata,
    frame: metadata,
  };
}
