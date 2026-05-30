# ABUSE

Base + Farcaster mini app scaffold (foundation from EIGHT, without business logic).

## Stack

- Next.js 16 (App Router) + React 19 + Tailwind CSS v4
- wagmi + viem on Base
- Farcaster mini app SDK
- Foundry (contracts scaffold ready)

## Setup

```bash
npm install
git submodule update --init --recursive
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configure

1. `src/config/app.ts` — name, slug, Base App ID, builder code, production URL
2. `src/config/manifest.ts` — Farcaster domain verification
3. `public/` — replace icons and splash assets
4. `src/app/globals.css` — retheme colors

## Contracts

Add Solidity contracts under `contracts/src/`, then:

```bash
npm run compile
npm run test:contracts
```

## Deploy

- Frontend: Vercel
- Set `NEXT_PUBLIC_SITE_URL` in Vercel env
- Register Base mini app + Farcaster manifest after first deploy
