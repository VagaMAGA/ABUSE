"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppLogo } from "@/components/AppLogo";
import { APP_NAME, TOKEN_SYMBOL } from "@/config/app";

const links = [
  { href: "/", label: "App" },
  { href: "/farm", label: "Farm", highlight: true as const },
  { href: "/referral", label: "Refer" },
  { href: "/badges", label: "Badges" },
  { href: "/leaderboard", label: "Leaders" },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="uni-card mb-3 flex w-full items-center gap-2 px-2 py-2 sm:px-3">
      <Link
        href="/"
        className="uni-nav-brand-link flex shrink-0 items-center border-r border-[var(--uni-border)] pr-2 no-underline sm:pr-2.5"
        aria-label={`${APP_NAME} home`}
      >
        <AppLogo size={32} />
      </Link>
      <div className="uni-tabs uni-tabs-compact min-w-0 flex-1 basis-0">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
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
                  Farm{" "}
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
  );
}
