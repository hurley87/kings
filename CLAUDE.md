# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ralph's Forge is a full-stack starter kit for Farcaster Mini Apps. It combines a Next.js frontend (from Farcaster Mini App Starter by Builders Garden) with a Foundry smart contract environment (from LazerForge by Lazer Technologies).

## Setup Guide

When a user asks for help setting up the project, follow these steps in order:

### 1. Install Dependencies
```bash
pnpm install                           # Frontend dependencies
cd contracts && forge install && cd .. # Smart contract dependencies
```

### 2. Create Environment File
```bash
cp .env.example .env.local
```

### 3. Generate JWT Secret
```bash
openssl rand -hex 32
```
Add this to `.env.local` as `JWT_SECRET`.

### 4. Get Neynar API Key
1. Sign up at https://neynar.com
2. Create an app and copy the API key
3. Set as `NEYNAR_API_KEY` in `.env.local`

### 5. Set Up Redis (Upstash)
1. Create a free database at https://upstash.com
2. Copy the REST URL and token
3. Set as `REDIS_URL` and `REDIS_TOKEN` in `.env.local`

### 6. Set Up Cloudflare Tunnel
Farcaster Mini Apps require a publicly accessible URL. Guide the user to:
1. Install cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
2. Run: `cloudflared tunnel --url http://localhost:3000`
3. Copy the generated URL (e.g., `https://xxx-xxx-xxx.trycloudflare.com`)
4. Set this as `NEXT_PUBLIC_URL` in `.env.local`

### 7. Start Development Server
```bash
pnpm run dev
```
The app will be available at http://localhost:3000.

To test as a Farcaster Mini App, open the preview URL in your browser:
```
https://farcaster.xyz/~/developers/mini-apps/preview?url=YOUR_CLOUDFLARE_URL
```
Replace `YOUR_CLOUDFLARE_URL` with the tunnel URL from step 6 (e.g., `https://xxx-xxx-xxx.trycloudflare.com`).

### 8. Create Your PRD
Now that the starter app is running, define what you want to build:
1. Open `ralph/PRD.md`
2. Write your product requirements with user stories and acceptance criteria
3. Use Claude plan mode to generate an implementation plan:
   ```
   /blueprint [describe your feature]
   ```
4. Run `pnpm run ralph` to start the autonomous development loop

See the README for more details on the Ralph workflow.

## Commands

### Frontend Development
```bash
pnpm run dev       # Start Next.js dev server
pnpm run build     # Build production bundle
pnpm run lint      # Run ESLint
```

### Smart Contracts
```bash
pnpm run forge:build   # Compile contracts
pnpm run forge:test    # Run Foundry tests
pnpm run forge:deploy  # Deploy and sync ABI to frontend

# Direct Foundry commands (from contracts/ directory)
forge test -vvv                    # Verbose test output
forge test --match-test testName   # Run specific test
forge test --match-contract Name   # Run tests in specific contract
forge snapshot                     # Generate gas snapshots
FOUNDRY_PROFILE=CI forge test      # Run with CI profile (more fuzz runs)
```

## Architecture

### Frontend Stack
- **Next.js 16** with App Router (React Server Components)
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Wagmi/Viem** for wallet connections
- **React Query** for data fetching

### Farcaster Integration
The app detects its environment and behaves differently:
- **In Farcaster Mini App**: Full Mini App SDK features, native auth
- **In Browser**: Shows landing page with QR code and launch buttons

Key Farcaster packages: `@farcaster/miniapp-sdk`, `@farcaster/quick-auth`, `@farcaster/miniapp-wagmi-connector`

### Provider Architecture (components/providers/index.tsx)
Layered providers wrap the app in order:
1. `EnvironmentProvider` - Browser vs Mini App detection
2. `ErudaProvider` - Mobile debugging (dev only)
3. `WagmiProvider` - Wallet management
4. `QueryClientProvider` - React Query
5. `FarcasterProvider` - Mini App SDK
6. `UserProvider` - Auth state

### Context Hooks
- `useEnvironment()` - `isInBrowser`, `isInFarcasterMiniApp`, `isLoading`
- `useFarcaster()` - Mini App context, capabilities, safe area insets
- `useUser()` - User data, sign-in methods, auth state

### API Integration
Custom hooks in `/hooks/`:
- `useApiQuery` - GET requests with auth support
- `useApiMutation` - POST/PUT/DELETE with optimistic updates

### Authentication Flow
JWT-based auth using Farcaster Quick Auth:
- `/api/auth/sign-in` - Verify user identity
- `/api/auth/check` - Validate session
- `/api/users/me` - Get user profile (protected)

### Smart Contracts (contracts/)
Foundry-based with batteries included:
- **Solidity 0.8.28** with high optimizer settings
- **Dependencies**: OpenZeppelin, Solady, Uniswap v2/v3/v4
- **Deterministic testing**: Fixed block number (17722462) and timestamp

Foundry profiles:
- `default` - Standard dev with gas optimizations
- `CI` - More fuzz runs (1024)
- `via_ir` - Slow but highly optimized compilation
- `anvil` - Local testing with Prague EVM

### Key Directories

**Frontend (app/)**
```
app/api/        # API routes (auth, users, webhooks, notifications)
components/     # React components (pages/, providers/, shared/)
contexts/       # React contexts (environment, farcaster, user)
hooks/          # Custom hooks (useApiQuery, useApiMutation)
lib/            # Utils (env.ts with Zod validation, wagmi config, etc.)
```

**Smart Contracts (contracts/)**
```
contracts/src/      # Contract source files
contracts/test/     # Foundry tests
contracts/script/   # Deployment scripts
contracts/lib/      # Dependencies (git submodules)
```

## Environment Variables

Required for local development (see .env.example):
- `NEXT_PUBLIC_URL` - App URL for frame metadata
- `NEYNAR_API_KEY`, `JWT_SECRET` - Authentication
- `REDIS_URL`, `REDIS_TOKEN` - Notifications (Upstash)

Required for production deployment:
- `NEXT_PUBLIC_FARCASTER_HEADER/PAYLOAD/SIGNATURE` - Frame account association (generate at https://farcaster.xyz/~/developers/mini-apps/manifest)

For contracts deployment, set RPC URLs and API keys in environment.

## Solidity Import Remappings

Available imports in contracts:
```solidity
import "@openzeppelin/contracts/...";
import "solady/...";
import "@uniswap/v2-core/...";
import "@uniswap/v3-core/...";
import "@uniswap/v4-core/...";
import "forge-std/...";
```
