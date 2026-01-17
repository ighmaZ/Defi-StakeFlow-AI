# StakeFlow AI

<div align="center">

![StakeFlow Logo](https://img.shields.io/badge/StakeFlow-AI%20Powered%20DeFi-blue?style=for-the-badge)

**AI-Powered DeFi Staking Protocol on Ethereum Sepolia**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Foundry](https://img.shields.io/badge/Foundry-v0.2.0-ffcf4c?logo=rust)](https://getfoundry.sh/)

[Website](#) • [Documentation](#) • [Demo](#)

</div>

---

## Overview

StakeFlow AI is a modern DeFi staking platform that allows users to stake SFT tokens and earn rewards with **10% APY**. Built with cutting-edge Web3 technologies and enhanced with AI-powered insights for smarter DeFi decisions.

### Features

- **Smart Staking**: Secure staking vault with instant deposits and withdrawals
- **10% APY Rewards**: Competitive reward distribution on staked tokens
- **AI Assistant**: Integrated AI chatbot for real-time DeFi guidance
- **Multi-Wallet Support**: Connect with MetaMask, WalletConnect, Rainbow, and more
- **Real-Time Updates**: Live balance tracking and reward calculations
- **Gas Optimization**: Efficient smart contract design for lower transaction costs
- **Secure Architecture**: OpenZeppelin contracts with reentrancy protection

## Tech Stack

### Frontend
- **Framework**: Next.js 16.1 with App Router
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Web3**: RainbowKit + Wagmi v2.19 + Viem v2.21
- **State Management**: TanStack Query (React Query)
- **Icons**: Lucide React
- **Notifications**: Sonner for toast notifications

### Smart Contracts
- **Development**: Foundry (Forge, Cast, Anvil)
- **Language**: Solidity ^0.8.20
- **Security**: OpenZeppelin Contracts
- **Standards**: ERC-20 token implementation

## Architecture

```
StakeFlow AI/
├── contracts/           # Foundry smart contracts
│   ├── src/
│   │   ├── StakeFlowToken.sol    # ERC20 staking token
│   │   └── StakeFlowVault.sol    # Staking vault contract
│   ├── script/
│   │   └── Deploy.s.sol          # Deployment scripts
│   └── test/                     # Foundry tests
├── frontend/            # Next.js dApp
│   ├── app/             # Next.js app directory
│   ├── components/      # React components
│   │   ├── ui/          # Base UI components
│   │   ├── AIAssistant.tsx
│   │   ├── StakingDashboard.tsx
│   │   └── TokenStats.tsx
│   ├── hooks/           # Custom React hooks
│   │   ├── useStakeFlow.ts
│   │   ├── useStaking.ts
│   │   └── useWalletBalance.ts
│   └── config/          # Contract addresses & ABIs
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** 20+ and pnpm
- **Foundry** for smart contract development
- **MetaMask** or compatible wallet
- **Ethereum Sepolia** testnet ETH for transactions

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ighmaZ/Defi-StakeFlow-AI.git
   cd Defi-StakeFlow-AI
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   pnpm install

   # Smart contracts (Foundry)
   cd ../contracts
   forge install
   ```

3. **Configure environment variables**

   Create `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_CHAIN_ID=11155111
   NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   NEXT_PUBLIC_TOKEN_ADDRESS=0x...
   NEXT_PUBLIC_VAULT_ADDRESS=0x...
   ```

4. **Run the development server**
   ```bash
   cd frontend
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Smart Contract Deployment

### Local Testing

```bash
cd contracts

# Run tests
forge test

# Build contracts
forge build

# Run local node
anvil

# Deploy to local node
forge script script/Deploy.s.sol:Deploy --rpc-url http://localhost:8545 --broadcast
```

### Testnet Deployment

```bash
# Deploy to Sepolia
forge script script/Deploy.s.sol:Deploy \
  --rpc-url https://sepolia.infura.io/v3/YOUR_KEY \
  --private-key YOUR_PRIVATE_KEY \
  --broadcast \
  --verify
```

## Smart Contract Functions

### StakeFlowToken (ERC20)

| Function | Description |
|----------|-------------|
| `mint(address, uint256)` | Mint new SFT tokens (minter only) |
| `burn(uint256)` | Burn tokens from caller |
| `addMinter(address)` | Add authorized minter (owner only) |
| `setMintingEnabled(bool)` | Enable/disable token minting |

### StakeFlowVault

| Function | Description |
|----------|-------------|
| `stake(uint256)` | Deposit tokens into the vault |
| `unstake(uint256)` | Withdraw staked tokens |
| `claimRewards()` | Claim accumulated rewards |
| `getStakerInfo(address)` | Get staker balance and rewards |
| `updateRewardIndex()` | Update global reward index |

## Key Features Explained

### 10% APY Staking

The vault distributes rewards at a constant rate of **10% APY**:
- Rewards are calculated based on staked amount and duration
- Reward index ensures fair distribution across all stakers
- Rewards can be claimed anytime without unstaking

### AI Assistant

The integrated AI assistant provides:
- Real-time market insights and analysis
- Staking strategy recommendations
- Risk assessment and portfolio suggestions
- Educational content about DeFi concepts

### Security Features

- **ReentrancyGuard**: Protects against reentrancy attacks
- **SafeERC20**: Safe token transfers
- **Access Control**: Owner and minter role restrictions
- **Max Supply Cap**: 10,000,000 SFT token limit

## Testing

### Frontend Tests

```bash
cd frontend
pnpm test
```

### Smart Contract Tests

```bash
cd contracts
forge test -vv
forge test --gas-report
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Use semantic commit messages

## Project Status

- [x] Smart contract implementation
- [x] Frontend UI development
- [x] Wallet integration
- [x] Staking functionality
- [x] AI assistant integration
- [ ] Mainnet deployment
- [ ] Additional wallet support
- [ ] Mobile app development

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) for secure smart contract libraries
- [RainbowKit](https://www.rainbowkit.com/) for beautiful wallet UI
- [Foundry](https://getfoundry.sh/) for the development toolkit
- [Next.js](https://nextjs.org/) for the React framework

## Support

- 📧 Email: support@stakeflow.ai
- 💬 Discord: [Join our community](#)
- 📖 Documentation: [docs.stakeflow.ai](#)

---

<div align="center">

Built with ❤️ by the StakeFlow AI Team

[⬆ Back to Top](#stakeflow-ai)

</div>
