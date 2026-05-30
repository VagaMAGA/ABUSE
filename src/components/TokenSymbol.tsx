import { LogoLetterA } from "@/components/LogoLetterA";

type TokenSymbolProps = {
  className?: string;
  /** Logo A height in px */
  logoSize?: number;
  dollarClassName?: string;
};

/** $A with logo-style A (not plain text) */
export function TokenSymbol({
  className = "",
  logoSize = 11,
  dollarClassName = "",
}: TokenSymbolProps) {
  return (
    <span
      className={`uni-token-symbol inline-flex items-end gap-px leading-none ${className}`.trim()}
      aria-label="$A"
    >
      <span className={`uni-token-dollar ${dollarClassName}`.trim()}>$</span>
      <LogoLetterA size={logoSize} className="uni-token-logo-a shrink-0" />
    </span>
  );
}
