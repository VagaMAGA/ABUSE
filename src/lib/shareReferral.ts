import sdk from "@farcaster/frame-sdk";

import { FARCASTER_MINIAPP_URL } from "@/config/farcaster";
import {
  buildReferralShareCopy,
  buildReferralShareUrl,
} from "@/config/share";

const X_INTENT_POST_URL = "https://x.com/intent/post";
const FARCASTER_COMPOSE_URL = "https://farcaster.xyz/~/compose";

export function buildXIntentUrl(text: string, url: string): string {
  const params = new URLSearchParams({
    text: `${text}\n\n${url}`,
  });
  return `${X_INTENT_POST_URL}?${params.toString()}`;
}

export function buildFarcasterComposeUrl(text: string, embeds: string[]): string {
  const params = new URLSearchParams();
  params.set("text", text);
  for (const embed of embeds.slice(0, 2)) {
    params.append("embeds[]", embed);
  }
  return `${FARCASTER_COMPOSE_URL}?${params.toString()}`;
}

function openSharePopup(url: string) {
  window.open(url, "_blank", "noopener,noreferrer,width=560,height=640");
}

export function shareOnX(referralCode: string) {
  const shareUrl = buildReferralShareUrl(referralCode);
  const { xText } = buildReferralShareCopy(referralCode);
  openSharePopup(buildXIntentUrl(xText, shareUrl));
}

export async function shareOnFarcaster(
  referralCode: string,
  inMiniApp: boolean,
): Promise<void> {
  const shareUrl = buildReferralShareUrl(referralCode);
  const { farcasterText } = buildReferralShareCopy(referralCode);
  const embeds = [FARCASTER_MINIAPP_URL, shareUrl] as [string, string];

  if (inMiniApp && typeof sdk.actions.composeCast === "function") {
    await sdk.actions.composeCast({ text: farcasterText, embeds });
    return;
  }

  openSharePopup(buildFarcasterComposeUrl(farcasterText, embeds));
}
