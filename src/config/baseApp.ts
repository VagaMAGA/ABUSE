import { CANONICAL_SITE_URL } from "@/config/appAssets";

/** Base App deep link host — opens mini app inside Base App */
export const BASE_APP_HOST = "https://base.app";

/** Canonical launch URL, e.g. https://base.app/app/https://your-app.vercel.app */
export function buildBaseAppLaunchUrl(path = ""): string {
  const site = CANONICAL_SITE_URL.replace(/\/$/, "");
  const normalizedPath =
    path === "" ? "" : path.startsWith("/") ? path : `/${path}`;

  return `${BASE_APP_HOST}/app/${site}${normalizedPath}`;
}
