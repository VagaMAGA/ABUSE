import Link from "next/link";

type AirdropOrbLinkProps = {
  className?: string;
  size?: number;
};

/** Square ABUSE logo + label → /airdrop */
export function AirdropOrbLink({ className = "", size = 52 }: AirdropOrbLinkProps) {
  return (
    <Link
      href="/stake?tab=claim"
      className={`uni-airdrop-entry ${className}`.trim()}
      aria-label="Claim airdrop"
    >
      <span className="uni-airdrop-entry-logo-pulse">
        <span className="uni-airdrop-entry-logo">
          <span className="uni-airdrop-entry-logo-ring" aria-hidden="true" />
          <img
            src="/icon.svg"
            alt=""
            width={size}
            height={size}
            className="uni-airdrop-entry-logo-img"
            draggable={false}
          />
        </span>
      </span>
      <span className="uni-airdrop-entry-label">claim airdrop</span>
    </Link>
  );
}
