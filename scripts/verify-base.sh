#!/usr/bin/env bash
# Verify ABUSE contracts on Basescan (Base mainnet, chain 8453).
# Requires Etherscan API V2 key: https://etherscan.io/myapikey
#
# Usage:
#   export ETHERSCAN_API_KEY=your_key
#   bash scripts/verify-base.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

HUB="0x7f076Fd4E7E18385E9E43ccB59B684B4Bd16dBa1"
TOKEN="0x3E9e193026FD2f8ec0b7718B73CC0244b49598c3"
BADGE="0x8C688c140B65fDb3c0B53E9C0C32885CaE4C4fC6"
STAKE="0xBf9338260f50635EcBFc3d71DE01022790912A32"

DEPLOYER="0x7b190cD6E092b6CC513B411c338Dad0c592F5D39"
RANK_SIGNER="0x1261bc5b8A3CEEe9D17a1Fd0d57a6D34bF48B81a"
# 1_050_000 $A minted to deployer in Remix
TOKEN_SUPPLY="1050000000000000000000000"

API_KEY="${ETHERSCAN_API_KEY:-${BASESCAN_API_KEY:-}}"
if [[ -z "$API_KEY" ]]; then
  echo "Error: set ETHERSCAN_API_KEY (V2 key from https://etherscan.io/myapikey)"
  exit 1
fi

echo "Building contracts (solc 0.8.24, optimizer OFF — matches Remix deploy)..."
forge build --force

VERIFY_ARGS=(
  --chain base
  --verifier etherscan
  --verifier-url "https://api.etherscan.io/v2/api?chainid=8453"
  --etherscan-api-key "$API_KEY"
  --compiler-version 0.8.24
  --num-of-optimizations 0
  --watch
)

verify_one() {
  local addr="$1"
  local contract="$2"
  shift 2
  echo ""
  echo "=== Verifying $contract at $addr ==="
  if forge verify-contract "$addr" "$contract" "${VERIFY_ARGS[@]}" "$@"; then
    echo "OK: $contract"
  else
    echo "FAILED: $contract (see message above)"
    return 1
  fi
}

FAIL=0

verify_one "$HUB" "contracts/src/Hub.sol:Hub" || FAIL=1

TOKEN_ARGS=$(cast abi-encode "constructor(address,uint256)" "$DEPLOYER" "$TOKEN_SUPPLY")
verify_one "$TOKEN" "contracts/src/AbuseToken.sol:AbuseToken" --constructor-args "$TOKEN_ARGS" || FAIL=1

BADGE_ARGS=$(cast abi-encode "constructor(address,address)" "$HUB" "$RANK_SIGNER")
verify_one "$BADGE" "contracts/src/BadgeNFT.sol:BadgeNFT" --constructor-args "$BADGE_ARGS" || FAIL=1

STAKE_ARGS=$(cast abi-encode "constructor(address)" "$TOKEN")
verify_one "$STAKE" "contracts/src/StakePool.sol:StakePool" --constructor-args "$STAKE_ARGS" || FAIL=1

echo ""
echo "Links:"
echo "  https://basescan.org/address/$HUB#code"
echo "  https://basescan.org/address/$TOKEN#code"
echo "  https://basescan.org/address/$BADGE#code"
echo "  https://basescan.org/address/$STAKE#code"

if [[ "$FAIL" -ne 0 ]]; then
  echo ""
  echo "Some contracts failed. Hub/Token usually verify from this repo."
  echo "If Badge/Stake fail with bytecode mismatch, verify them in Remix:"
  echo "  Compiler 0.8.24, Optimization OFF, same constructor args as above."
  exit 1
fi

echo ""
echo "All contracts submitted for verification on Basescan."
