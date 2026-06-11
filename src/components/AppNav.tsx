"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useChainId } from "wagmi";

import { AppLogo } from "@/components/AppLogo";
import { FarmBoostButton } from "@/components/FarmBoostButton";
import { GlobalTxBar } from "@/components/GlobalTxBar";
import { APP_NAME, TOKEN_SYMBOL } from "@/config/app";
import { DEPLOY_CHAIN_ID, isContractConfigured } from "@/config/contract";
import { isHubLiveMode } from "@/config/preview";

const links = [
  { href: "/", label: "Farm", highlight: true as const },
  { href: "/stake", label: "Token", tokenMark: true as const },
  { href: "/referral", label: "Refer" },
  { href: "/badges", label: "Badges" },
  { href: "/leaderboard", label: "Leaders" },
] as const;

export function AppNav() {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const wrongChain = isConnected && chainId !== DEPLOY_CHAIN_ID;
  const canBoost = isHubLiveMode({ isConnected, wrongChain });

  return (
    <header className="uni-app-nav-shell mb-2 w-full">
      <nav className="uni-card uni-app-nav uni-app-nav--compact flex w-full items-center gap-1.5 px-1.5 py-1 sm:px-2">
        <div className="uni-nav-brand-cluster flex shrink-0 items-center gap-1 border-r border-[var(--uni-border)] pr-1.5 sm:pr-2">
          <Link
            href="/"
            className="uni-nav-brand-link flex shrink-0 items-center no-underline"
            aria-label={`${APP_NAME} home`}
          >
            <AppLogo size={26} />
          </Link>
          {isContractConfigured && (
            <FarmBoostButton variant="nav" disabled={!canBoost} />
          )}
        </div>
        <div className="uni-tabs uni-tabs-compact min-w-0 flex-1 basis-0">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/" || pathname.startsWith("/farm")
              : pathname.startsWith(link.href) ||
                (link.href === "/stake" && pathname.startsWith("/airdrop"));
          const pulseFarm =
            "highlight" in link && link.highlight && !active;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`uni-tab ${active ? "uni-tab-active" : ""} ${pulseFarm ? "uni-tab-farm-pulse" : ""}`}
            >
              {"highlight" in link && link.highlight ? (
                <>
                  {link.label}{" "}
                  <span className="uni-tab-tb-mark">{TOKEN_SYMBOL}</span>
                </>
              ) : "tokenMark" in link && link.tokenMark ? (
                <>
                  {link.label}{" "}
                  <span className="uni-tab-tb-mark">{TOKEN_SYMBOL}</span>
                </>
              ) : (
                link.label
              )}
            </Link>
          );
        })}
        </div>
      </nav>
      <GlobalTxBar />
    </header>
  );
}
