# DeFi StakeFlow AI - Agent Instructions

## Project Overview

DeFi staking platform with ERC-20 token, staking vault, Next.js dashboard, AI assistant, and Go client.

---

## Development Commands

### Smart Contracts (Foundry/Solidity)

```bash
# Build contracts
forge build

# Run all tests
forge test

# Run single test (useful for debugging)
forge test --match-test testFunctionName

# Run tests with verbose output
forge test -vvv

# Run tests with gas reporting
forge test --gas-report

# Deploy locally
forge script script/Deploy.s.sol --broadcast

# Format code
forge fmt
```

### Frontend (Next.js/React)

```bash
# Install dependencies
cd frontend && pnpm install

# Start dev server
pnpm run dev

# Build for production
pnpm run build

# Run tests
pnpm test

# Run specific test file
pnpm test -- StakingDashboard.test.js

# Lint code
pnpm run lint

# Format code
pnpm run format

# Type check
pnpm run typecheck
```

### Backend (Go)

```bash
# Build binary
go build -o stakeflow-client ./client.go

# Run tests
go test ./...

# Run specific test
go test -run TestSpecificFunction

# Format code
go fmt ./...

# Lint code
golangci-lint run
```

---

## Code Style Guidelines

### Solidity

- **Imports**: Order: OpenZeppelin contracts → external libraries → internal contracts
- **Naming**:
  - Contracts: PascalCase (e.g., `StakeFlowVault`)
  - Functions: camelCase (e.g., `stakeTokens`)
  - Constants: UPPER_SNAKE_CASE (e.g., `REWARD_RATE`)
  - Variables: camelCase
  - Events: PascalCase (e.g., `TokensStaked`)
- **Visibility**: Explicitly declare (public, private, external, internal)
- **Safety**: Use `onlyOwner` or `onlyVault` modifiers for access control
- **Gas**: Pack struct variables, use `calldata` instead of `memory` for read-only params
- **Error Handling**: Use custom errors (e.g., `InsufficientBalance()` instead of require strings)

### JavaScript/TypeScript (Next.js)

- **Imports**: Order: React → RainbowKit/wagmi/viem → @tanstack/react-query → third-party → internal modules → types
- **Naming**:
  - Components: PascalCase (e.g., `StakingDashboard`)
  - Functions/hooks: camelCase (e.g., `useStakeFlow`)
  - Query keys: PascalCase arrays (e.g., `['StakedAmount', address]`)
  - Constants: UPPER_SNAKE_CASE for exports
- **Types**: Use TypeScript interfaces for props and return types
- **State**: Use TanStack Query for server/Web3 data, Zustand for global app state, useState for local UI state
- **Error Handling**: Use try/catch for async operations, show user-friendly errors, handle Query error states
- **Web3**: Use RainbowKit for wallet connection with wagmi/viem, wrap app with RainbowKitProvider + QueryClientProvider

### Go

- **Imports**: Order: standard library → external → internal
- **Naming**:
  - Public: PascalCase (e.g., `ConnectWallet`)
  - Private: camelCase (e.g., `calculateRewards`)
  - Interfaces: PascalCase (e.g., `StakeFlowClient`)
  - Constants: PascalCase (e.g., `ContractAddress`)
- **Error Handling**: Always check errors, wrap with context using `fmt.Errorf`
- **Formatting**: Run `go fmt` before committing
- **Comments**: Exported functions must have godoc comments

---

## Smart Contract Best Practices

### Security

- Use OpenZeppelin contracts (ERC20, Ownable, ReentrancyGuard)
- Implement ReentrancyGuard for external calls
- Use `SafeERC20` for token transfers
- Check-effects-interactions pattern
- Add emergency pause functionality

### Testing

- Test all functions with positive and negative cases
- Test edge cases (zero amounts, max uint256, etc.)
- Test reentrancy attacks
- Verify events are emitted correctly
- Use fuzz testing where appropriate

### Gas Optimization

- Use `uint256` instead of smaller uints unless packing
- Loop unrolling for fixed-size iterations
- Custom errors over require strings
- Short-circuit boolean logic

---

## Frontend Best Practices

### Component Structure

- One component per file
- Co-locate styles and types with components
- Use composition over complex props
- Keep components under 200 lines

### Web3 Integration

- Use RainbowKit ConnectButton for wallet connection UI
- Always handle wallet connection/disconnection with useAccount hook
- Show loading states during transactions
- Display transaction hashes and confirmations
- Cache contract addresses and ABIs
- Use event listeners for real-time updates
- Configure RainbowKit chains and wallets in providers
- Handle network switching with RainbowKit's built-in support

### AI Integration

- Cache AI responses when appropriate
- Stream responses for better UX
- Handle rate limits gracefully
- Sanitize user inputs before sending to AI

### React Query / TanStack Query

**Setup**
```typescript
// Wrap app with QueryClientProvider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
      retry: 3,
    },
  },
})
```

**Query Hooks (Data Fetching)**
```typescript
// Fetch wallet balance
const useWalletBalance = (address: string) => {
  return useQuery({
    queryKey: ['WalletBalance', address],
    queryFn: () => fetchBalance(address),
    enabled: !!address,
    staleTime: 10000, // 10 seconds
  })
}

// Fetch staked amount
const useStakedAmount = (address: string) => {
  return useQuery({
    queryKey: ['StakedAmount', address],
    queryFn: () => readContract({ address, functionName: 'stakedBalance' }),
    enabled: !!address,
    refetchInterval: 15000, // Poll every 15s for rewards
  })
}
```

**Mutation Hooks (Write Operations)**
```typescript
// Stake tokens
const useStake = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (amount: bigint) => writeContract({ functionName: 'stake', args: [amount] }),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['WalletBalance'] })
      queryClient.invalidateQueries({ queryKey: ['StakedAmount'] })
      queryClient.invalidateQueries({ queryKey: ['Rewards'] })
    },
  })
}

// Unstake tokens
const useUnstake = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (amount: bigint) => writeContract({ functionName: 'unstake', args: [amount] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['StakedAmount'] })
      queryClient.invalidateQueries({ queryKey: ['Rewards'] })
    },
  })
}
```

**Best Practices**
- Use **queryKey arrays** with all dependencies: `['TokenPrice', tokenAddress, chainId]`
- Set **staleTime** appropriately: balances (10s), prices (30s), static data (5min)
- Use **enabled** to pause queries: `enabled: !!address`
- **Invalidate queries** after mutations to keep data in sync
- Use **refetchInterval** for polling rewards/price updates
- Handle **isLoading**, **isError**, **error** states in components
- Use **isFetching** to show subtle loading indicators without blocking UI
- Implement **optimistic updates** for better UX on stake/unstake
- Use **useQueryClient** for manual refetching in event handlers

---

## General Guidelines

### Git Workflow

- Commit messages: imperative mood (e.g., "Add staking function")
- Branch naming: feature/description, bugfix/description
- Never commit sensitive data (private keys, .env files)
- Run lint and tests before pushing

### Environment Variables

- Never hardcode addresses or keys
- Use `.env.local` for development
- Add all `.env*` files to `.gitignore`

### Documentation

- Document complex logic with comments
- Update README when adding features
- Keep changelog of breaking changes
