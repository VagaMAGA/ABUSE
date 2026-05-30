#!/usr/bin/env bash
# Verify Hub + BadgeNFT on Basescan (Base mainnet, chain 8453).
# Requires Etherscan API V2 key: https://etherscan.io/myapikey
#
# Usage:
#   export ETHERSCAN_API_KEY=your_key
#   bash scripts/verify-base.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

HUB="0x9Bf7f86889CfddEb13440b938f092D2F224Aa803"
BADGE="0xAC8FAb96243AF9B4953B3f3B07555964C656383c"
HUB_ADDR="0x9Bf7f86889CfddEb13440b938f092D2F224Aa803"
RANK_SIGNER="0xb7338bFb3A0654271B69e06C5CC972C1F956A8dB"

API_KEY="${ETHERSCAN_API_KEY:-${BASESCAN_API_KEY:-}}"
if [[ -z "$API_KEY" ]]; then
  echo "Error: set ETHERSCAN_API_KEY (V2 key from https://etherscan.io/myapikey)"
  exit 1
fi

export FOUNDRY_PROFILE=remix

echo "Building remix sources (solc 0.8.24, optimizer OFF — matches Remix deploy)..."
forge build --force

VERIFY_ARGS=(
  --chain base
  --verifier etherscan
  --etherscan-api-key "$API_KEY"
  --compiler-version 0.8.24
  --num-of-optimizations 0
  --watch
)

echo ""
echo "=== Verifying Hub ==="
forge verify-contract \
  "$HUB" \
  Hub.sol:Hub \
  "${VERIFY_ARGS[@]}"

CONSTRUCTOR_ARGS=$(cast abi-encode "constructor(address,address)" "$HUB_ADDR" "$RANK_SIGNER")

echo ""
echo "=== Verifying BadgeNFT ==="
forge verify-contract \
  "$BADGE" \
  BadgeNFT.sol:BadgeNFT \
  --constructor-args "$CONSTRUCTOR_ARGS" \
  "${VERIFY_ARGS[@]}"

echo ""
echo "Done. Check:"
echo "  https://basescan.org/address/$HUB#code"
echo "  https://basescan.org/address/$BADGE#code"
