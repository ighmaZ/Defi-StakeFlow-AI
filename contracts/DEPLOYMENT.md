# DeFi StakeFlow AI - Deployment

## Sepolia Testnet Deployment

**Date:** January 3, 2026
**Block:** #11,155,111

### Deployed Contracts

| Contract | Address | Description |
|----------|----------|-------------|
| **StakeFlowToken** | `0x48bed473a2b23b4421De13e22fB0d4CE5C1D22cc` | ERC-20 token (SFT) |
| **StakeFlowVault** | `0x6c468BB499269C87b9A1f0F610Bc3cD98EFa0135` | Staking vault with 10% APY |

### Deployment Details

- **Network:** Sepolia Testnet (Chain ID: 11155111)
- **Deployer:** `0x7A83c5d4240f7Ba4d9C4bbEf5a67B73640A76460`
- **Gas Used:** 3,665,606
- **Estimated Cost:** 0.000003665664696969696 ETH (~$0.01 @ $2800/ETH)
- **Transactions:** 4
  - Deploy StakeFlowToken
  - Deploy StakeFlowVault
  - Add vault as minter
  - Mint 1,000,000 SFT to deployer

### Token Configuration

- **Name:** StakeFlow Token
- **Symbol:** SFT
- **Decimals:** 18
- **Total Supply:** 10,000,000 SFT
- **Initial Minted:** 1,000,000 SFT (10% of max supply)
- **Deployer Balance:** 1,000,000 SFT
- **Minter Role:** Vault address (`0x6c468BB499269C87b9A1f0F610Bc3cD98EFa0135`)

### Vault Configuration

- **Staking Token:** SFT (`0x48bed473a2b23b4421De13e22fB0d4CE5C1D22cc`)
- **Reward Token:** SFT (same token)
- **Reward Rate:** 10% APY
- **Reward Calculation:** Continuous via reward index
- **Total Staked:** 0 SFT (initial)

## Links

- **Token on Etherscan:** [View](https://sepolia.etherscan.io/address/0x48bed473a2b23b4421De13e22fB0d4CE5C1D22cc)
- **Vault on Etherscan:** [View](https://sepolia.etherscan.io/address/0x6c468BB499269C87b9A1f0F610Bc3cD98EFa0135)
- **Transaction Hash:** `0xee1670c252503ef939b66f0192622b87b0d715cefc17cf86e83653e57f22e9dd`

## How to Use

### Verify Contracts
```bash
cd contracts

# Check token name and symbol
cast call 0x48bed473a2b23b4421De13e22fB0d4CE5C1D22cc "name()(string)" --rpc-url <YOUR_RPC_URL>
cast call 0x48bed473a2b23b4421De13e22fB0d4CE5C1D22cc "symbol()(string)" --rpc-url <YOUR_RPC_URL>

# Check vault configuration
cast call 0x6c468BB499269C87b9A1f0F610Bc3cD98EFa0135 "stakingToken()(address)" --rpc-url <YOUR_RPC_URL>
cast call 0x6c468BB499269C87b9A1f0F610Bc3cD98EFa0135 "rewardToken()(address)" --rpc-url <YOUR_RPC_URL>

# Verify vault is minter
cast call 0x48bed473a2b23b4421De13e22fB0d4CE5C1D22cc "minters(address)(bool)" 0x6c468BB499269C87b9A1f0F610Bc3cD98EFa0135 --rpc-url <YOUR_RPC_URL>
```

### Check Balances
```bash
# Check deployer token balance
cast balance 0x7A83c5d4240f7Ba4d9C4bbEf5a67B73640A76460 --erc20 0x48bed473a2b23b4421De13e22fB0d4CE5C1D22cc --rpc-url <YOUR_RPC_URL>

# Check deployer ETH balance
cast balance 0x7A83c5d4240f7Ba4d9C4bbEf5a67B73640A76460 --rpc-url <YOUR_RPC_URL>
```

### Test Staking Flow
```bash
# 1. Approve vault to spend tokens
cast send 0x48bed473a2b23b4421De13e22fB0d4CE5C1D22cc \
  "approve(address,uint256)" \
  0x6c468BB499269C87b9A1f0F610Bc3cD98EFa0135 10000000000000000000000 \
  --private-key <YOUR_PRIVATE_KEY> \
  --rpc-url <YOUR_RPC_URL>

# 2. Stake tokens
cast send 0x6c468BB499269C87b9A1f0F610Bc3cD98EFa0135 \
  "stake(uint256)" \
  10000000000000000000000 \
  --private-key <YOUR_PRIVATE_KEY> \
  --rpc-url <YOUR_RPC_URL>

# 3. Check staking info
cast call 0x6c468BB499269C87b9A1f0F610Bc3cD98EFa0135 \
  "getStakerInfo(address)" \
  <YOUR_ADDRESS> \
  --rpc-url <YOUR_RPC_URL>
```

## Files Created

- `script/Deploy.s.sol` - Deployment script
- `.env.example` - Environment variables template
- `broadcast/Deploy.s.sol/11155111/run-latest.json` - Transaction details
- `cache/Deploy.s.sol/11155111/run-latest.json` - Deployment artifacts

## Next Steps

1. **Verify on Etherscan** (optional - requires manual verification)
2. **Test staking flow** with the commands above
3. **Connect frontend** to deployed contracts
4. **Write tests** for contract functions
5. **Get Sepolia ETH** for testing users from [faucet](https://sepoliafaucet.com/)

## Important Notes

- **Verification skipped** (no Etherscan API key provided)
- **Contract source code** not automatically verified on Etherscan
- **Can verify manually** later if needed
- **Deployer wallet** now has 1,000,000 SFT for distribution
- **Vault is authorized minter** - can mint rewards for stakers
