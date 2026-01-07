# DeFi StakeFlow AI - Frontend

## Overview

DeFi staking dashboard with real-time data, AI assistant, and seamless Web3 integration.

**Tech Stack:**

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (default)
- **Web3:** RainbowKit + wagmi + viem
- **State Management:** TanStack Query (server data)
- **AI:** Groq API (free, fast inference)

---

## Quick Start

### Prerequisites

- Node.js v18+ (installed)
- pnpm 10+ (installed)
- MetaMask or compatible wallet
- Deployed smart contracts with addresses

### Installation

```bash
cd frontend
pnpm install
```

### Development

```bash
pnpm run dev
```

Visit: http://localhost:3000

---

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # App providers (Wagmi, Query, RainbowKit)
│   │   ├── page.tsx            # Main dashboard
│   │   ├── globals.css         # Tailwind styles
│   │   └── api/
│   │       └── ai/
│   │           └── route.ts  # AI chat endpoint
│   ├── components/
│   │   ├── WalletConnect.tsx    # RainbowKit wallet button
│   │   ├── StakingDashboard.tsx  # Main staking interface
│   │   ├── TokenStats.tsx        # Token statistics display
│   │   ├── AIAssistant.tsx     # AI chat interface
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       └── Loading.tsx
│   ├── config/
│   │   ├── contracts.ts        # Contract addresses & ABIs
│   │   └── wagmi.ts          # Wagmi configuration
│   ├── hooks/
│   │   ├── useStakeFlow.ts     # Main custom hook
│   │   ├── useStake.ts         # Stake mutation
│   │   ├── useUnstake.ts       # Unstake mutation
│   │   └── useRewards.ts       # Rewards query
│   └── lib/
│       ├── utils.ts             # Utility functions
│       └── constants.ts         # Contract constants
├── public/
│   └── favicon.ico
├── .env.local                # Environment variables (NOT committed)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next-env.d.ts
```

---

---

## Key Features

### 1. Wallet Connection

**Component:** `WalletConnect.tsx`

**What it does:**

- Displays RainbowKit Connect Button
- Shows connected address, balance, network
- Handles wallet connection/disconnection
- Provides Web3 context to entire app

**Why RainbowKit:**

- Best-in-class wallet connector
- Supports MetaMask, WalletConnect, Coinbase Wallet, and 50+ others
- Built-in transaction signing
- Beautiful, customizable UI

---

### 2. Staking Dashboard

**Component:** `StakingDashboard.tsx`

**What it does:**

- Display user's token balance
- Show staked amount and rewards earned
- Stake/unstake forms with amount inputs
- Real-time updates via TanStack Query polling
- Transaction history

**Data Flow:**

```
User stakes tokens
→ Click "Stake" button
→ Approve tokens (one-time)
→ Call stake() function
→ Update UI (React Query invalidation)
→ Wait for confirmation
→ Show success message
```

---

### 3. Token Statistics

**Component:** `TokenStats.tsx`

**What it does:**

- Total token supply
- Total staked globally
- Current reward rate (10% APY)
- Network status indicator

---

### 4. AI Assistant (Groq)

**Component:** `AIAssistant.tsx`

**What it does:**

- Chat interface with message history
- Send questions to Groq API
- Receive real-time streaming responses
- Context-aware (knows about user's stakes)

**Why Groq:**

- Free tier with generous limits
- Ultra-fast inference (50ms-100ms)
- Supports multiple models (Llama 3, Mixtral)
- No rate limiting on free tier

**How AI Context Works:**

```
User asks: "How much will I earn if I stake 1000 SFT for 30 days?"

System sends to Groq:
{
  "model": "llama3-70b-8192",
  "messages": [
    {
      "role": "system",
      "content": "You are a DeFi assistant helping with staking calculations..."
    },
    {
      "role": "system",
      "content": "User has staked: 500 SFT. Current APY: 10%..."
    }
  ]
}

Groq responds with calculation explanation
```

---

## React Query Integration

### Query Hooks (Data Fetching)

**What TanStack Query Does:**

- Caches contract read results
- Refetches data automatically
- Manages loading states
- Optimistic updates for better UX
- Invalidates queries after mutations

**Key Queries:**

```typescript
// Fetch wallet balance
useQuery({
  queryKey: ["WalletBalance", address],
  queryFn: () =>
    readContract({
      address: STAKE_FLOW_TOKEN_ADDRESS,
      functionName: "balanceOf",
      args: [address],
    }),
  enabled: !!address,
  staleTime: 10000, // 10 seconds
  refetchInterval: 15000, // Poll every 15s
});

// Fetch staked amount
useQuery({
  queryKey: ["StakedAmount", address],
  queryFn: () =>
    readContract({
      address: STAKE_FLOW_VAULT_ADDRESS,
      functionName: "stakes",
      args: [address],
    }),
  enabled: !!address,
  refetchInterval: 10000, // Poll every 10s for rewards
});

// Fetch pending rewards
useQuery({
  queryKey: ["Rewards", address],
  queryFn: () =>
    readContract({
      address: STAKE_FLOW_VAULT_ADDRESS,
      functionName: "calculateRewards",
      args: [address],
    }),
  enabled: !!address,
});
```

**Benefits:**

- ✅ No redundant contract calls
- ✅ Automatic background updates
- ✅ Instant UI updates
- ✅ Better user experience

---

### Mutation Hooks (Write Operations)

**What Mutations Do:**

- Execute contract write functions
- Show optimistic UI updates (immediate feedback)
- Invalidate related queries after success
- Handle errors gracefully

**Key Mutations:**

```typescript
// Stake tokens
useMutation({
  mutationFn: (amount: bigint) =>
    writeContract({
      address: STAKE_FLOW_VAULT_ADDRESS,
      functionName: "stake",
      args: [amount],
    }),
  onSuccess: () => {
    // Invalidate related queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["WalletBalance"] });
    queryClient.invalidateQueries({ queryKey: ["StakedAmount"] });
    queryClient.invalidateQueries({ queryKey: ["Rewards"] });
  },
});

// Unstake tokens
useMutation({
  mutationFn: (amount: bigint) =>
    writeContract({
      address: STAKE_FLOW_VAULT_ADDRESS,
      functionName: "unstake",
      args: [amount],
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["StakedAmount"] });
    queryClient.invalidateQueries({ queryKey: ["Rewards"] });
  },
});

// Claim rewards
useMutation({
  mutationFn: () =>
    writeContract({
      address: STAKE_FLOW_VAULT_ADDRESS,
      functionName: "claimRewards",
      args: [],
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["WalletBalance"] });
    queryClient.invalidateQueries({ queryKey: ["Rewards"] });
  },
});
```

---

## Development Workflow

### Step 1: Setup Project

```bash
# Initialize Next.js
pnpm create next-app@latest frontend --typescript --tailwind --app

# Navigate to project
cd frontend

# Install dependencies
pnpm add @rainbow-me/rainbowkit wagmi viem @tanstack/react-query @tanstack/react-query-devtools

# Copy environment template
cp ../contracts/.env.example .env.local
```

### Step 2: Configure Providers

**Create `src/app/layout.tsx`:**

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import {
  RainbowKitProvider,
  RainbowKitButton,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
      retry: 3,
    },
  },
});

const config = getDefaultConfig({
  appName: "DeFi StakeFlow AI",
  chains: [sepolia],
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### Step 3: Build Components

**Order of implementation:**

1. `WalletConnect.tsx` - Wallet connection
2. `TokenStats.tsx` - Display token info
3. `StakingDashboard.tsx` - Main UI
4. `AIAssistant.tsx` - Chat interface

### Step 4: Create Contract Hooks

**Create `src/hooks/useStakeFlow.ts`:**

```typescript
import { useReadContract, useWriteContract } from "wagmi";
import {
  STAKE_FLOW_TOKEN_ADDRESS,
  STAKE_FLOW_VAULT_ADDRESS,
} from "@/config/contracts";
import { STAKE_FLOW_TOKEN_ABI, STAKE_FLOW_VAULT_ABI } from "@/config/contracts";
import { useAccount } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";

export function useStakeFlow() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  // Read: Wallet balance
  const { data: balance } = useReadContract({
    address: STAKE_FLOW_TOKEN_ADDRESS,
    abi: STAKE_FLOW_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 15000,
    },
  });

  // Read: Staked amount
  const { data: stakedAmount } = useReadContract({
    address: STAKE_FLOW_VAULT_ADDRESS,
    abi: STAKE_FLOW_VAULT_ABI,
    functionName: "stakes",
    args: address ? [address] : ["amount"],
    query: {
      enabled: !!address,
      refetchInterval: 10000,
    },
  });

  // Read: Pending rewards
  const { data: rewards } = useReadContract({
    address: STAKE_FLOW_VAULT_ADDRESS,
    abi: STAKE_FLOW_VAULT_ABI,
    functionName: "calculateRewards",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Write: Stake tokens
  const { writeContract: stake } = useWriteContract();
  const stakeMutation = useMutation({
    mutationFn: (amount: bigint) =>
      stake({
        address: STAKE_FLOW_VAULT_ADDRESS,
        abi: STAKE_FLOW_VAULT_ABI,
        functionName: "stake",
        args: [amount],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["WalletBalance"] });
      queryClient.invalidateQueries({ queryKey: ["StakedAmount"] });
      queryClient.invalidateQueries({ queryKey: ["Rewards"] });
    },
  });

  // Write: Unstake tokens
  const { writeContract: unstake } = useWriteContract();
  const unstakeMutation = useMutation({
    mutationFn: (amount: bigint) =>
      unstake({
        address: STAKE_FLOW_VAULT_ADDRESS,
        abi: STAKE_FLOW_VAULT_ABI,
        functionName: "unstake",
        args: [amount],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["StakedAmount"] });
      queryClient.invalidateQueries({ queryKey: ["Rewards"] });
    },
  });

  return {
    balance,
    stakedAmount,
    rewards,
    stake: stakeMutation.mutate,
    unstake: unstakeMutation.mutate,
    isConnected,
    address,
  };
}
```

### Step 5: Create AI API Route

**Create `src/app/api/ai/route.ts`:**

```typescript
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            {
              role: "system",
              content:
                "You are a DeFi assistant helping with staking calculations and blockchain concepts. Keep answers clear, concise, and helpful.",
            },
            {
              role: "system",
              content:
                context ||
                "User is asking about the StakeFlow DeFi staking platform.",
            },
            {
              role: "user",
              content: message,
            },
          ],
          stream: false,
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json({
      message: data.choices[0].message.content,
    });
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
```

---

## Testing the Application

### Local Testing with Deployed Contracts

1. **Start development server:**

   ```bash
   cd frontend
   pnpm run dev
   ```

2. **Visit http://localhost:3000**

3. **Connect your wallet:**

   - Click "Connect Wallet" button
   - Select MetaMask
   - Switch to Sepolia testnet

4. **Get testnet tokens:**

   - From deployed contracts, transfer SFT to your test address
   - Or use the deployer address which already has 1M SFT

5. **Test staking flow:**
   - Approve tokens
   - Stake tokens
   - Watch rewards accumulate
   - Claim rewards

---

## Troubleshooting

### Common Issues

**Issue: Wallet connection fails**

- Solution: Ensure MetaMask is unlocked and on correct network
- Check: Browser extensions have access

**Issue: Contract read errors**

- Solution: Verify contract addresses in `.env.local`
- Check: ABI files are correctly formatted

**Issue: AI not responding**

- Solution: Verify `GROQ_API_KEY` in `.env.local`
- Check: Groq API status (https://status.groq.com)

**Issue: React Query cache issues**

- Solution: Use React Query DevTools to inspect cache
- Clear cache: Click "Clear all" in DevTools

---

## Deployment

### Build for Production

```bash
pnpm run build
```

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
pnpm run build
netlify deploy --prod --dir=out
```

---

## Next Steps After Frontend

1. **Add comprehensive tests**

   - Unit tests for React components
   - Integration tests for contract interactions
   - E2E tests for AI chat

2. **Add more AI features**

   - Streaming responses
   - Message history persistence
   - Context injection (user's staking data)

3. **Add analytics**

   - Track staking volume
   - Monitor user engagement
   - AI usage statistics

4. **Add dark mode**
   - Toggle between light/dark themes
   - Persist user preference

---

## Resources

- **Next.js Documentation:** https://nextjs.org/docs
- **RainbowKit Docs:** https://www.rainbowkit.com/docs
- **Wagmi Docs:** https://wagmi.sh/
- **TanStack Query Docs:** https://tanstack.com/query/latest
- **Groq API:** https://console.groq.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## Support & Community

- **GitHub Issues:** https://github.com/ighmaZ/Defi-StakeFlow-AI/issues
- **Discord:** (add your Discord link here)
- **Documentation:** See this README and `../contracts/README.md`

---

**Built with ❤️ for DeFi users**
