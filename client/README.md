# DeFi StakeFlow AI - Go Client Implementation Plan

## Overview

A Go CLI client for interacting with the StakeFlow staking contracts directly from the terminal. This provides a powerful, fast alternative to the web dashboard for power users and automation.

---

## Why Go for DeFi?

**Advantages of Go:**
1. **Performance:** Compiled to native machine code - incredibly fast execution
2. **Type Safety:** Strong static typing prevents runtime errors
3. **Concurrency:** Built-in goroutines for parallel operations
4. **Cross-platform:** Runs on Windows, Mac, Linux without modification
5. **Small binaries:** Single executable file - easy distribution
6. **Excellent Web3 libraries:** go-ethereum (official Ethereum client)
7. **Great CLI experience:** Libraries like cobra, urfave for command-line interfaces

**Use Cases:**
- Automated staking strategies
- Bot operations (monitoring, auto-compounding)
- Batch operations (stake/unstake multiple users)
- Integration into existing Go infrastructure
- Headless servers (no UI needed)

---

## Project Structure

```
client/
├── cmd/
│   └── stakeflow/
│       └── main.go              # CLI entry point
├── pkg/
│   ├── client/
│   │   ├── wallet.go          # Wallet management
│   │   ├── staking.go        # Staking operations
│   │   └── contracts.go      # Contract interactions
│   ├── config/
│   │   └── config.go         # Configuration loading
│   └── types/
│       ├── contracts.go      # Contract type definitions
│       └── transaction.go     # Transaction types
├── go.mod
├── go.sum
└── README.md
```

**Explanation:**
- `cmd/` - Application entry points (CLI commands)
- `pkg/` - Internal packages (reusable code)
- Separation makes code modular, testable, and maintainable

---

## Architecture Design

### 1. Configuration Layer

**File:** `pkg/config/config.go`

**Purpose:** Load and validate configuration settings from environment variables and command-line flags.

**What it does:**
- Reads RPC URLs from environment
- Loads contract addresses
- Gets private key securely
- Validates required settings
- Provides configuration to other packages

**Why this matters:**
- Security: Never hardcode private keys
- Flexibility: Easy to switch between testnet/mainnet
- Reusability: Same config works for all commands

**Example Code:**
```go
package config

import (
    "os"
    "github.com/ethereum/go-ethereum/common"
)

type Config struct {
    RPCURL         string
    PrivateKey      *ecdsa.PrivateKey
    TokenAddress    common.Address
    VaultAddress   common.Address
    ChainID       *big.Int
}

func Load() (*Config, error) {
    privateKeyHex := os.Getenv("PRIVATE_KEY")
    if privateKeyHex == "" {
        return nil, fmt.Errorf("PRIVATE_KEY environment variable not set")
    }

    privateKey, err := crypto.HexToECDSA(privateKeyHex)
    if err != nil {
        return nil, fmt.Errorf("invalid private key: %w", err)
    }

    return &Config{
        RPCURL:       os.Getenv("RPC_URL"),
        PrivateKey:   privateKey,
        TokenAddress: common.HexToAddress(os.Getenv("TOKEN_ADDRESS")),
        VaultAddress:  common.HexToAddress(os.Getenv("VAULT_ADDRESS")),
        ChainID:      big.NewInt(11155111), // Sepolia
    }, nil
}
```

**Key Concept:** Environment variables are the standard way to handle secrets in Go. Never hardcode private keys in source code.

---

### 2. Wallet Layer

**File:** `pkg/client/wallet.go`

**Purpose:** Manage wallet operations including balance checks and transaction signing.

**What it does:**
- Connects to Ethereum network
- Checks wallet balance (ETH and ERC-20 tokens)
- Signs transactions
- Broadcasts transactions
- Waits for confirmations

**Why this matters:**
- Abstraction: Hide complexity of Ethereum interactions
- Reusability: All commands use the same wallet logic
- Error handling: Centralized place to handle network issues

**Example Code:**
```go
package client

import (
    "context"
    "fmt"
    "math/big"

    "github.com/ethereum/go-ethereum"
    "github.com/ethereum/go-ethereum/common"
    "github.com/ethereum/go-ethereum/crypto"
    "github.com/ethereum/go-ethereum/ethclient"
)

type Wallet struct {
    client      *ethclient.Client
    privateKey  *ecdsa.PrivateKey
    address     common.Address
    chainID     *big.Int
}

func New(ctx context.Context, config *Config) (*Wallet, error) {
    client, err := ethclient.DialContext(ctx, config.RPCURL)
    if err != nil {
        return nil, fmt.Errorf("failed to connect to RPC: %w", err)
    }

    publicKey := privateKey.Public()
    address := crypto.PubkeyToAddress(*publicKey)

    return &Wallet{
        client:     client,
        privateKey:  privateKey,
        address:    address,
        chainID:     config.ChainID,
    }, nil
}

func (w *Wallet) Balance(ctx context.Context) (*big.Int, error) {
    balance, err := w.client.BalanceAt(ctx, w.address)
    if err != nil {
        return nil, fmt.Errorf("failed to get balance: %w", err)
    }
    return balance, nil
}

func (w *Wallet) TokenBalance(ctx context.Context, tokenContract *common.Address) (*big.Int, error) {
    // Call ERC-20 balanceOf function
    data, err := w.client.CallContract(ctx, nil, *tokenContract, nil, false, "balanceOf", []interface{}{w.address})
    if err != nil {
        return nil, fmt.Errorf("failed to get token balance: %w", err)
    }

    balance := new(big.Int)
    balance.SetString(string(data), 10)
    return balance, nil
}
```

**Key Concepts:**
1. **ethclient.Client:** Go's official Ethereum client - handles all RPC communication
2. **Context:** Go's context package for cancellation and timeouts
3. **Big Integers:** Go's `math/big` for handling large numbers (essential for Ethereum - values are 256-bit integers)
4. **Error Wrapping:** `fmt.Errorf` with `%w` verb adds context to errors

---

### 3. Contracts Layer

**File:** `pkg/client/contracts.go`

**Purpose:** Interact with deployed smart contracts (ERC-20 token and staking vault).

**What it does:**
- Loads contract ABIs (Application Binary Interfaces)
- Encodes function calls
- Decodes contract responses
- Handles contract-specific logic

**Why this matters:**
- Type safety: Compile-time checking of contract interactions
- Maintainability: Easy to update when contracts change
- Debugging: Clear separation between contract logic and CLI logic

**Example Code:**
```go
package client

import (
    "context"
    "fmt"
    "math/big"

    "github.com/ethereum/go-ethereum/accounts/abi/bind"
    "github.com/ethereum/go-ethereum/common"
)

type StakeFlowToken struct {
    *bind.StakeFlowToken // Generated from contract ABI
}

type StakeFlowVault struct {
    *bind.StakeFlowVault // Generated from contract ABI
}

func NewToken(ctx context.Context, client *ethclient.Client, address common.Address) (*StakeFlowToken, error) {
    token, err := bind.NewStakeFlowToken(address, client)
    if err != nil {
        return nil, fmt.Errorf("failed to bind token contract: %w", err)
    }
    return token, nil
}

func (t *StakeFlowToken) GetStakedAmount(ctx context.Context, userAddress common.Address) (*big.Int, error) {
    // Call vault's stake function with view mode
    staked := new(big.Int)
    err := t.Call(nil, &staked, "stakes", userAddress)
    if err != nil {
        return nil, fmt.Errorf("failed to get staked amount: %w", err)
    }
    return staked, nil
}

func (v *StakeFlowVault) Stake(ctx context.Context, amount *big.Int) (*types.Transaction, error) {
    auth, err := bind.NewKeyedTransactor(v.privateKey, v.chainID)
    if err != nil {
        return nil, fmt.Errorf("failed to create transactor: %w", err)
    }

    // Approve tokens first
    tokenAddress := common.HexToAddress(os.Getenv("TOKEN_ADDRESS"))
    token, _ := NewToken(ctx, v.client, tokenAddress)
    
    tx, err := token.Approve(auth, v.address, big.NewInt(0).SetUint64(^uint64(2)^64-1))
    if err != nil {
        return nil, fmt.Errorf("failed to approve tokens: %w", err)
    }

    // Wait for approval
    _, err = bind.WaitMined(ctx, v.client, tx.Hash)
    if err != nil {
        return nil, fmt.Errorf("approval transaction failed: %w", err)
    }

    // Stake tokens
    tx, err = v.Stake(auth, amount)
    if err != nil {
        return nil, fmt.Errorf("failed to stake: %w", err)
    }

    return tx, nil
}
```

**Key Concepts:**
1. **Contract Binding:** Use `go-ethereum`'s `abigen` tool to generate Go bindings from Solidity ABIs
2. **Gas Estimation:** Go's `ethclient` can estimate gas before sending
3. **Approval Pattern:** ERC-20 requires approve() before staking - this must be done in two transactions
4. **Transaction Receipts:** Use `WaitMined()` to confirm transactions are on-chain

---

### 4. Staking Operations Layer

**File:** `pkg/client/staking.go`

**Purpose:** High-level staking operations combining wallet and contract interactions.

**What it does:**
- Coordinates approval and staking
- Displays staking information
- Handles error recovery
- Provides human-readable output

**Why this matters:**
- User Experience: Makes complex operations simple for users
- Reliability: Handles edge cases and retries
- Testing: Easier to test high-level logic separately from low-level details

**Example Code:**
```go
package client

import (
    "context"
    "fmt"
    "math/big"

    "github.com/ethereum/go-ethereum/common"
)

type StakingInfo struct {
    StakedAmount  *big.Int
    RewardsEarned *big.Int
    APY           string
}

func Stake(ctx context.Context, wallet *Wallet, vault *StakeFlowVault, amount string) error {
    // Parse amount (supports decimals like "1000" or "1.5k")
    stakeAmount, ok := new(big.Int).SetString(amount)
    if !ok {
        return fmt.Errorf("invalid amount: %s", amount)
    }

    fmt.Printf("Approving %s SFT for staking...\n", stakeAmount.String())
    
    // Stake tokens
    tx, err := vault.Stake(ctx, stakeAmount)
    if err != nil {
        return fmt.Errorf("staking failed: %w", err)
    }

    fmt.Printf("Staking transaction sent: %s\n", tx.Hash().Hex())
    fmt.Printf("Waiting for confirmation...\n")

    // Wait for transaction to be mined
    receipt, err := bind.WaitMined(ctx, wallet.client, tx.Hash())
    if err != nil {
        return fmt.Errorf("transaction failed to mine: %w", err)
    }

    fmt.Printf("✅ Successfully staked %s SFT\n", stakeAmount.String())
    fmt.Printf("Transaction confirmed in block: %d\n", receipt.BlockNumber.Uint64())
    
    return nil
}

func GetStakingInfo(ctx context.Context, wallet *Wallet, vault *StakeFlowVault) (*StakingInfo, error) {
    // Get staked amount
    staked, err := vault.GetStakedAmount(ctx, wallet.address)
    if err != nil {
        return nil, fmt.Errorf("failed to get staked amount: %w", err)
    }

    // Calculate rewards
    // This would call the contract's calculateRewards function
    rewards := big.NewInt(0) // Placeholder - would get from contract

    info := &StakingInfo{
        StakedAmount:  staked,
        RewardsEarned: rewards,
        APY:           "10%",
    }

    return info, nil
}
```

**Key Concepts:**
1. **Input Parsing:** Handle different number formats (with/without decimals, with "k", "M" suffixes)
2. **User Feedback:** Print progress messages so users know what's happening
3. **Error Messages:** Clear, actionable error messages
4. **Transaction Tracking:** Hash and block numbers for verification

---

### 5. CLI Application Layer

**File:** `cmd/stakeflow/main.go`

**Purpose:** Entry point for the CLI application using cobra library.

**What it does:**
- Defines command structure (stake, unstake, balance, info)
- Handles command-line flags
- Orchestrates execution flow
- Provides help text

**Why this matters:**
- User Experience: Familiar command-line interface (like git, docker)
- Extensibility: Easy to add new commands
- Professional: Industry-standard CLI patterns

**Example Code:**
```go
package main

import (
    "context"
    "fmt"
    "os"

    "github.com/ighmaZ/Defi-StakeFlow-AI/client/pkg/config"
    "github.com/ighmaZ/Defi-StakeFlow-AI/client/pkg/client"
    "github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
    Use:   "stakeflow",
    Short: "CLI for StakeFlow DeFi staking",
}

var balanceCmd = &cobra.Command{
    Use:   "balance",
    Short: "Check wallet balance",
    Run: func(cmd *cobra.Command, args []string) {
        runBalance()
    },
}

var stakeCmd = &cobra.Command{
    Use:   "stake",
    Short: "Stake tokens",
    Args:  cobra.ExactArgs(1, "amount"),
    Run: func(cmd *cobra.Command, args []string) {
        amount := args[0]
        runStake(amount)
    },
}

func init() {
    balanceCmd.AddCommand(rootCmd)
    stakeCmd.AddCommand(rootCmd)
}

func runBalance() {
    ctx := context.Background()
    config, err := config.Load()
    if err != nil {
        fmt.Printf("Error loading config: %v\n", err)
        os.Exit(1)
    }

    wallet, err := client.New(ctx, config)
    if err != nil {
        fmt.Printf("Error creating wallet: %v\n", err)
        os.Exit(1)
    }

    balance, err := wallet.Balance(ctx)
    if err != nil {
        fmt.Printf("Error getting balance: %v\n", err)
        os.Exit(1)
    }

    fmt.Printf("Wallet Balance: %s ETH\n", balance.String())
}

func runStake(amount string) {
    ctx := context.Background()
    config, err := config.Load()
    if err != nil {
        fmt.Printf("Error loading config: %v\n", err)
        os.Exit(1)
    }

    wallet, err := client.New(ctx, config)
    if err != nil {
        fmt.Printf("Error creating wallet: %v\n", err)
        os.Exit(1)
    }

    vault, err := client.NewVault(ctx, wallet.client, config.VaultAddress)
    if err != nil {
        fmt.Printf("Error connecting to vault: %v\n", err)
        os.Exit(1)
    }

    fmt.Printf("Staking %s SFT...\n", amount)
    err = client.Stake(ctx, wallet, vault, amount)
    if err != nil {
        fmt.Printf("Staking failed: %v\n", err)
        os.Exit(1)
    }

    fmt.Println("✅ Staking complete!")
}
```

**Key Concepts:**
1. **Cobra Library:** Industry-standard for building CLI apps in Go
2. **Commands:** Hierarchical command structure (stake -> balance, info)
3. **Flags:** Command-line arguments for flexibility
4. **Exit Codes:** Different exit codes for success vs. different errors

---

## Implementation Steps

### Step 1: Initialize Go Module

```bash
cd client
go mod init github.com/ighmaZ/Defi-StakeFlow-AI/client
```

**Explanation:**
- `go mod init` creates `go.mod` file
- Defines module path (import path for your code)
- Essential for dependency management

---

### Step 2: Add Dependencies

```bash
# Ethereum client (official)
go get github.com/ethereum/go-ethereum
go get github.com/ethereum/go-ethereum/common

# CLI framework
go get github.com/spf13/cobra

# Environment variable library
go get github.com/joho/godotenv
```

**Why these libraries:**
- `go-ethereum`: Official Ethereum client, battle-tested
- `cobra`: CLI framework used by Docker, Kubernetes, etcd
- `godotenv`: Loads environment variables from `.env` files

---

### Step 3: Generate Contract Bindings

**Generate Go code from Solidity ABIs:**

```bash
# Copy ABIs from contracts
cp ../contracts/out/StakeFlowToken.sol/StakeFlowToken.json .
cp ../contracts/out/StakeFlowVault.sol/StakeFlowVault.json .

# Install abigen (if not installed)
go install github.com/ethereum/go-ethereum/cmd/abigen@latest

# Generate Go bindings
abigen --abi StakeFlowToken.json --pkg=contracts --type=StakeFlowToken --out=pkg/contracts/stakeflowtoken.go
abigen --abi StakeFlowVault.json --pkg=contracts --type=StakeFlowVault --out=pkg/contracts/stakeflowvault.go
```

**Explanation:**
- `abigen` reads JSON ABI files from smart contracts
- Generates type-safe Go code to interact with contracts
- No need to manually write contract interaction code
- Compile-time guarantees contract functions exist

---

### Step 4: Create Environment File

**Create `.env` in `client/` directory:**

```bash
# RPC URL (Sepolia testnet)
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Private key of deployment wallet
PRIVATE_KEY=0xYOUR_64_CHARACTER_PRIVATE_KEY

# Contract addresses
TOKEN_ADDRESS=0x48bed473a2b23b4421De13e22fB0d4CE5C1D22cc
VAULT_ADDRESS=0x6c468BB499269C87b9A1f0f610Bc3cD98EFa0135

# Chain ID (Sepolia)
CHAIN_ID=11155111
```

**Security Note:** Never commit `.env` to git. Add `.env` to `.gitignore`.

---

### Step 5: Implement Packages

**Order of implementation:**
1. `pkg/config/config.go` - Configuration loading
2. `pkg/client/wallet.go` - Wallet operations
3. `pkg/client/contracts.go` - Contract interactions
4. `pkg/client/staking.go` - Staking logic
5. `cmd/stakeflow/main.go` - CLI application

---

### Step 6: Build and Test

```bash
# Build the CLI
go build -o stakeflow ./cmd/stakeflow

# Run the CLI
./stakeflow --help
./stakeflow balance
./stakeflow stake 1000
```

**What build does:**
- Compiles all Go code into a single binary
- Links all packages and dependencies
- Creates executable with no dependencies

---

## Advanced Features

### 1. Transaction Monitoring

**What it adds:**
- Monitor transaction status in real-time
- Show gas prices
- Display confirmation progress
- Retry failed transactions

**Why it matters:**
- User Experience: Users see what's happening
- Debugging: Easy to track down transactions
- Reliability: Automatic retry on network congestion

### 2. Batch Operations

**What it adds:**
- Process multiple staking operations in parallel
- Use goroutines for concurrency
- Aggregate results

**Why it matters:**
- Performance: Process hundreds of operations quickly
- Cost saving: Batch transactions reduce gas overhead

### 3. Event Listening

**What it adds:**
- Listen to contract events (Staked, Unstaked, RewardsClaimed)
- Real-time notifications
- Event-driven architecture

**Why it matters:**
- Real-time updates without polling
- Accuracy: Events from blockchain are source of truth
- Integration: Can trigger external systems

---

## Deployment

### Build for Different Platforms

**For Linux/Mac:**
```bash
go build -o stakeflow-linux-amd64 ./cmd/stakeflow
```

**For Windows:**
```bash
SET GOOS=windows
SET GOARCH=amd64
go build -o stakeflow.exe ./cmd/stakeflow
```

**For macOS (Apple Silicon):**
```bash
GOOS=darwin GOARCH=arm64 go build -o stakeflow-arm64 ./cmd/stakeflow
```

### Cross-Compilation (single binary):**
```bash
# Install cross-compiler
go install github.com/mitchellh/gox2@latest

# Build for all platforms
gox2 osarch -o stakeflow ./cmd/stakeflow
```

**Why cross-compile:**
- Distribution: Provide binaries for all major platforms
- Convenience: Users don't need Go installed
- Testing: Test on different OS before release

---

## Testing Strategy

### Unit Tests

**Example test file:** `pkg/client/wallet_test.go`

```go
package client

import (
    "testing"
    "math/big"

    "github.com/ethereum/go-ethereum/common"
)

func TestBalance(t *testing.T) {
    // Create mock wallet
    wallet := createTestWallet(t)
    
    // Mock ETH balance
    expectedBalance := big.NewInt(1000000000000000000) // 0.001 ETH
    
    // Test balance retrieval
    balance, err := wallet.Balance(context.Background())
    
    if err != nil {
        t.Fatalf("Balance failed: %v", err)
    }
    
    if balance.Cmp(expectedBalance) != 0 {
        t.Errorf("Expected %v, got %v", expectedBalance, balance)
    }
}
```

**Testing Concepts:**
1. **Table-driven tests:** Use Go's testing package with table tests for multiple scenarios
2. **Mocking:** Create fake Ethereum clients for testing without real network
3. **Assertions:** `t.Fatalf` for critical failures, `t.Errorf` for non-critical issues
4. **Test Coverage:** Use `go test -cover` to measure code coverage

### Integration Tests

**Testing with local blockchain:**
```bash
# Start local Ethereum node (Anvil)
anvil &

# Run tests against local node
RPC_URL=http://localhost:8545 go test ./...
```

---

## Performance Considerations

### 1. Gas Optimization

**What it involves:**
- Use contract's batch functions if available
- Optimize transaction ordering
- Cache state locally

**Why it matters:**
- Cost saving: Less gas spent on transactions
- Speed: Faster transaction confirmation
- UX: Snappier interface

### 2. Concurrency

**What it involves:**
- Use goroutines for independent operations
- Use channels for communication
- Limit concurrent RPC calls

**Example:**
```go
// Process multiple user stakes in parallel
func BatchStake(users []string, amounts []*big.Int) {
    var wg sync.WaitGroup
    results := make(chan error, len(users))
    
    for i, user := range users {
        go func(u string, a *big.Int) {
            defer wg.Done()
            err := stake(user, a)
            results <- err
        }(user, amounts[i])
        wg.Add(1)
    }
    
    go func() {
        wg.Wait()
        close(results)
        for err := range results {
            if err != nil {
                log.Println(err)
            }
        }
    }()
}
```

**Key Concepts:**
1. **sync.WaitGroup:** Wait for all goroutines to complete
2. **Channels:** Goroutines communicate via channels (type-safe)
3. **Anonymous functions:** Define functions inline to avoid name collisions

---

## Security Best Practices

### 1. Private Key Management

**✅ DO:**
- Load from environment variables only
- Use `godotenv` library for parsing
- Never log or print private keys
- Add `.env` to `.gitignore`

**❌ DON'T:**
- Hardcode private keys in source code
- Commit `.env` files to git
- Share private keys in chat/forums
- Store in plain text files (use encrypted files only)

### 2. Transaction Safety

**✅ DO:**
- Estimate gas before sending
- Set appropriate gas limits
- Use nonce management (go-ethereum handles this automatically)
- Verify transaction details before broadcasting

**❌ DON'T:**
- Send transactions without confirmation
- Set unreasonably high gas limits
- Skip transaction validation
- Reuse nonces (can cause conflicts)

### 3. Error Handling

**✅ DO:**
- Use Go's error wrapping: `fmt.Errorf("context: %w", err)`
- Provide helpful error messages to users
- Handle network errors gracefully
- Implement retry logic with exponential backoff

**Error Wrapping Explained:**
```go
// Bad: return err
return err

// Good: Add context
return fmt.Errorf("failed to stake: %w", err)
```
**Why context matters:**
- Debugging: Know WHERE error occurred
- Logging: Error messages show the full story
- Recovery: Can be unwrapped at higher levels with %w verb

---

## Common Patterns

### 1. Configuration Pattern

**Standard way to handle config:**
```go
var cfg *Config

func init() {
    var err error
    cfg, err = config.Load()
    if err != nil {
        log.Fatalf("Failed to load config: %v", err)
    }
}
```

**Why global config:** Singleton pattern ensures config loaded once, used everywhere.

### 2. Context Pattern

**Standard way to handle cancellation:**
```go
func Stake(ctx context.Context, amount string) error {
    // Pass ctx to all functions
    tx, err := vault.Stake(ctx, amount)
    receipt, err := bind.WaitMined(ctx, client, tx.Hash())
    
    // Check if context cancelled
    select {
    case <-ctx.Done():
        return ctx.Err()
    default:
        return nil
    }
}
```

**Why context matters:**
- Cancellation: User can Ctrl+C to stop long operations
- Timeouts: Contexts can have deadlines
- Propagation: Context passes through all function calls

### 3. Error Handling Pattern

**Standard way to handle errors:**
```go
func Stake(ctx context.Context, amount string) (err error) {
    // Handle multiple potential errors
    config, err := config.Load()
    if err != nil {
        return fmt.Errorf("config error: %w", err)
    }
    
    wallet, err := client.New(ctx, config)
    if err != nil {
        return fmt.Errorf("wallet error: %w", err)
    }
    
    vault, err := client.NewVault(ctx, wallet.client, config.VaultAddress)
    if err != nil {
        return fmt.Errorf("vault error: %w", err)
    }
    
    _, err = client.Stake(ctx, wallet, vault, amount)
    if err != nil {
        return fmt.Errorf("staking error: %w", err)
    }
    
    return nil
}
```

**Why this pattern matters:**
- Clarity: Each step has its own error handling
- Context: Errors wrap previous errors with `%w`, showing full stack
- User Experience: Specific error messages help users fix issues

---

## Troubleshooting

### Common Issues

**Issue: "module github.com/... not found"**

**Solution:**
```bash
go mod tidy
```

**Issue: "abi: has not exported name..."**

**Solution:**
- Verify `abigen` generated correct bindings
- Check package name in generated file matches imports
- Re-run `abigen` if needed

**Issue: "invalid private key"**

**Solution:**
- Ensure private key starts with `0x`
- Ensure private key is exactly 64 hex characters
- Check for extra spaces or newlines in environment variable

**Issue: "insufficient funds for gas"**

**Solution:**
- Check wallet has ETH: `stakeflow balance`
- Get testnet ETH from faucet
- Check RPC URL is correct and node is syncing

**Issue: "transaction reverted"**

**Solution:**
- Check contract address is correct
- Verify function signature matches contract
- Check you're using the correct network (testnet vs mainnet)
- Check token approval (ERC-20 approve before stake)

---

## Go Tools and Ecosystem

### Essential Tools

1. **go-ethereum** (official client)
   - Best-in-class Ethereum library
   - Used by major DeFi protocols
   - Well-maintained and documented

2. **cobra** (CLI framework)
   - Industry standard
   - Used by Docker, Kubernetes, etcd
   - Powerful flag parsing

3. **abigen** (contract binding generator)
   - Type-safe Go bindings from ABIs
   - Generates all necessary code automatically

### Development Tools

- **Delve**: Go debugger (like GDB for Go)
- **golangci-lint**: Linting tool (enforces code quality)
- **go mod**: Dependency manager (built into Go)
- **go test**: Built-in testing framework

---

## Next Steps

### Phase 1: Core Functionality
1. ✅ Set up project structure
2. ✅ Implement wallet connection
3. ✅ Add balance checking
4. ✅ Implement staking operations
5. ✅ Create CLI interface

### Phase 2: Advanced Features
1. ⏳ Add transaction monitoring
2. ⏳ Implement event listening
3. ⏳ Add batch operations
4. ⏳ Add configuration file support

### Phase 3: Testing & Polish
1. ⏳ Write comprehensive unit tests
2. ⏳ Add integration tests
3. ⏳ Optimize gas usage
4. ⏳ Add documentation

---

## Resources

- **Effective Go:** https://effectivego.com/ (Best practices)
- **Go by Example:** https://gobyexample.com/ (Code examples)
- **go-ethereum Docs:** https://geth.ethereum.org/docs/ (Official docs)
- **A Tour of Go:** https://go.dev/tour/welcome/1 (Interactive tutorial)

---

## Support

- **GitHub Issues:** Report bugs and feature requests
- **Documentation:** See this README for detailed guides
- **Examples:** See `examples/` directory for usage patterns

---

**Built with Go for DeFi power users**
