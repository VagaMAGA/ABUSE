# Vercel environment setup (ABUSE)

In **Vercel → Project → Settings → Environment Variables**, add these three variables for **Production**, **Preview**, and **Development**.

## Required

| Name | Value | What breaks without it |
|------|--------|-------------------------|
| `NEXT_PUBLIC_SITE_URL` | `https://abuse-iota.vercel.app` | Wrong share links, Farcaster/embed URLs |
| `BASE_RPC_URL` | `https://base-mainnet.g.alchemy.com/v2/…` | Leaderboard slow/empty; referrals API fails under load |
| `BADGE_RANK_SIGNER_PRIVATE_KEY` | Private key for `0x1261bc5b8A3CEEe9D17a1Fd0d57a6D34bF48B81a` | Rank badges cannot mint (API returns signer error) |

### Rank signer key

This must be the **same wallet** you passed as `rankSigner` when deploying `BadgeNFT` in Remix.

Check locally (do not paste key into chat):

```bash
cast wallet address --private-key "$BADGE_RANK_SIGNER_PRIVATE_KEY"
# must print: 0x1261bc5b8A3CEEe9D17a1Fd0d57a6D34bF48B81a
```

If you lost the key, deploy a new `BadgeNFT` with a new rank signer wallet and update `src/config/badgeContract.ts` + `src/lib/signRankBadge.ts`.

### Alchemy / Infura

1. Create app on **Base Mainnet**
2. Copy HTTPS URL
3. Paste as `BASE_RPC_URL`

## Already in code (no env needed)

- Hub, $A token, BadgeNFT, StakePool addresses
- `HUB_DEPLOY_FROM_BLOCK` = `46725882`
- Base App ID, Builder Code, Talent verification meta
- Farcaster `accountAssociation` in `src/config/manifest.ts`

## Works without Vercel env (client-only)

- GM, Deploy, Boost (wallet + public Base RPC)
- Milestone badges
- Stake / airdrop (after wallet connect)
- Global tx counter bar

## After adding variables

1. **Redeploy** (Deployments → … → Redeploy)
2. Test:
   - https://abuse-iota.vercel.app/api/leaderboard
   - https://abuse-iota.vercel.app/.well-known/farcaster.json
   - Badges → rank tab → mint (needs signer key)
