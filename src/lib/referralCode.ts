import { encodePacked, keccak256, type Address } from "viem";

/** Must match Hub._codeFromHash / referralCodeFor */
const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const REFERRAL_CODE_LENGTH = 6;

/** Deterministic code for a wallet — same as Hub.referralCodeFor */
export function referralCodeFromAddress(address: Address): string {
  const hash = keccak256(
    encodePacked(["string", "address"], ["TBREF:v1", address]),
  );
  let v = BigInt(hash);
  let code = "";
  for (let i = 0; i < REFERRAL_CODE_LENGTH; i++) {
    code += CHARSET[Number(v % 32n)];
    v /= 32n;
  }
  return code;
}

export function normalizeReferralCodeInput(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z2-9]/g, "");
}

export function isValidReferralCodeFormat(code: string): boolean {
  if (code.length !== REFERRAL_CODE_LENGTH) return false;
  return [...code].every((ch) => CHARSET.includes(ch));
}
