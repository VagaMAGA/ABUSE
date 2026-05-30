import { Attribution } from "ox/erc8021";
import { http, createConfig, createStorage, cookieStorage } from "wagmi";
import { base } from "wagmi/chains";
import { baseAccount, injected } from "wagmi/connectors";

import { APP_NAME, BASE_BUILDER_CODE } from "@/config/app";
import { farcasterMiniApp } from "@/lib/farcasterMiniAppConnector";

export const chains = [base] as const;

function getBuilderDataSuffix(): `0x${string}` | undefined {
  const code =
    process.env.NEXT_PUBLIC_BASE_BUILDER_CODE?.trim() || BASE_BUILDER_CODE;
  if (!code) return undefined;

  return Attribution.toDataSuffix({ codes: [code] });
}

const builderDataSuffix = getBuilderDataSuffix();

export const wagmiConfig = createConfig({
  chains: [...chains],
  connectors: [
    farcasterMiniApp(),
    baseAccount({
      appName: APP_NAME,
    }),
    injected({ target: "metaMask" }),
    injected(),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http("https://mainnet.base.org"),
  },
  ...(builderDataSuffix ? { dataSuffix: builderDataSuffix } : {}),
});

export function getConfig() {
  return wagmiConfig;
}

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
