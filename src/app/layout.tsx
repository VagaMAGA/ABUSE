import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";

import {
  APP_DESCRIPTION,
  BASE_APP_ID,
  TALENT_APP_PROJECT_VERIFICATION,
} from "@/config/app";
import { APP_ICON_PATH, APP_IMAGE_PATH, CANONICAL_SITE_URL } from "@/config/appAssets";
import { buildFcMiniAppEmbed, FARCASTER_APP_NAME } from "@/config/farcaster";
import { getConfig } from "@/config/wagmi";
import { ProvidersShell } from "./providers-loader";
import "./globals.css";

const siteUrl = CANONICAL_SITE_URL;

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fcMiniAppEmbed = JSON.stringify(buildFcMiniAppEmbed(siteUrl));

const metadataOther: Record<string, string> = {
  "fc:miniapp": fcMiniAppEmbed,
  "fc:frame": fcMiniAppEmbed,
};
if (BASE_APP_ID) metadataOther["base:app_id"] = BASE_APP_ID;
if (TALENT_APP_PROJECT_VERIFICATION) {
  metadataOther["talentapp:project_verification"] =
    TALENT_APP_PROJECT_VERIFICATION;
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: FARCASTER_APP_NAME,
  description: APP_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: APP_ICON_PATH, type: "image/png", sizes: "512x512" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: FARCASTER_APP_NAME,
    description: APP_DESCRIPTION,
    images: [{ url: APP_IMAGE_PATH, width: 1200, height: 628 }],
  },
  other: metadataOther,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieHeader = (await headers()).get("cookie") ?? "";
  const initialState = cookieToInitialState(getConfig(), cookieHeader);

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href={APP_ICON_PATH} type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <ProvidersShell initialState={initialState}>{children}</ProvidersShell>
      </body>
    </html>
  );
}
