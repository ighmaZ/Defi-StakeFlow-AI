# StakeFlow Smart Contracts Documentation

This document provides a detailed overview of the core smart contracts used in the StakeFlow DeFi ecosystem: `StakeFLowToken.sol` and `StakeFlowVault.sol`.

## 1. StakeFLowToken.sol

**File Path**: `contracts/src/StakeFlowToken.sol`  
**Contract Name**: `StakeFLowToken`

### Overview
`StakeFLowToken` is an ERC20-compliant token with additional access control features. It allows authorized addresses (minters) to mint new tokens up to a maximum supply.

### Key State Variables

- **`MAX_SUPPLY`**: The maximum number of tokens that can ever exist. Fixed at **10,000,000 SFT** (10 million tokens with 18 decimals).
- **`mintingEnabled`**: A boolean flag that controls whether minting is currently allowed. Defaults to `true`.
- **`minters`**: A mapping that tracks addresses authorized to mint new tokens.

### Functions

#### Administrative
- **`constructor()`**: Initializes the token with name "StakeFlow Token" and symbol "SFT". Sets the deployer as the initial owner.
- **`setMintingEnabled(bool _enabled)`**: Allows the owner to enable or disable minting globally.
- **`addMinter(address _minter)`**: Grants minting privileges to an address. Only callable by the owner.
- **`removeMinter(address _minter)`**: Revokes minting privileges from an address. Only callable by the owner.

#### Core Logic
- **`mint(address to, uint256 amount)`**: Mints `amount` of tokens to address `to`.
  - Requires `msg.sender` to be an authorized minter.
  - Requires `mintingEnabled` to be true.
  - Reverts if the mint would exceed `MAX_SUPPLY`.
- **`burn(uint256 amount)`**: Allows any user to burn their own tokens, reducing the total supply.

### Events

- **`MintingStatusChanged(bool enabled)`**: Emitted when minting is enabled or disabled.
- **`MinterAdded(address indexed minter)`**: Emitted when a new minter is authorized.
- **`MinterRemoved(address indexed minter)`**: Emitted when a minter is revoked.

### Errors

- **`MaxSupplyExceeded()`**: Thrown if a mint operation would cause the total supply to exceed `MAX_SUPPLY`.
- **`MintingDisabled()`**: Thrown if a mint operation is attempted while `mintingEnabled` is false.
- **`NotAuthorizedMinter()`**: Thrown if a non-minter attempts to call `mint`.

---

## 2. StakeFlowVault.sol

**File Path**: `contracts/src/StakeFlowVault.sol`  
**Contract Name**: `StakeFlowVault`

### Overview
`StakeFlowVault` is a staking contract that allows users to stake an ERC20 token (`stakingToken`) and earn rewards in `StakeFLowToken` (`rewardToken`). It uses a mathematical index-based approach to distribute rewards efficiently.

### Key State Variables & Constants

- **`stakingToken`**: The ERC20 token that users stake.
- **`rewardToken`**: The `StakeFLowToken` that users earn as rewards.
- **`REWARD_RATE`**: Set to `1000`. This represents the base rate for reward calculation.
- **`REWARD_DENOMINATOR`**: Set to `10,000`. Used to normalize calculations (effectively making the rate 10%).
- **`rewardIndex`**: A global accumulator used to track rewards per token staked over time. Scaled by 1e18 for precision.
- **`totalStaked`**: The total amount of `stakingToken` currently locked in the vault.
- **`stakes`**: A mapping tracking each user's staked amount, original timestamp, and the `rewardIndex` at the time of their last action.

### Functions

#### Core Logic
- **`stake(uint256 amount)`**: Deposits `stakingToken` into the vault.
  - Claims any pending rewards before updating the stake.
  - Updates the global `rewardIndex` and the user's stake info.
- **`unstake(uint256 amount)`**: Withdraws `stakingToken` from the vault.
  - Claims any pending rewards before processing the withdrawal.
  - Updates `totalStaked` and the user's remaining balance.
- **`claimRewards()`**: Manually triggers the distribution of pending rewards without modifying the stake.

#### View / Helper Functions
- **`updateRewardIndex()`**: Updates the global `rewardIndex` based on the time elapsed since the last update and the current `totalStaked`.
- **`calculateRewards(address user)`**: Returns the pending rewards for a specific user based on the difference between the current `rewardIndex` and the user's stored index.
- **`getStakerInfo(address user)`**: Returns a tuple containing:
  - `stakedAmount`
  - `stakedTimestamp`
  - `pendingRewardAmount`

### Events

- **`TokensStaked(address indexed user, uint256 amount)`**: Emitted when a user deposits tokens.
- **`TokensUnstaked(address indexed user, uint256 amount)`**: Emitted when a user withdraws tokens.
- **`RewardsClaimed(address indexed user, uint256 amount)`**: Emitted when a user claims their yield.

### Errors

- **`ZeroAmount()`**: Thrown if the user tries to stake or unstake 0 tokens.
- **`InsufficientBalance()`**: Thrown if the user tries to unstake more than they have deposited.
- **`NoStakeFound()`**: Thrown if an unstake operation is attempted by a user with no active stake.

---

## 3. System Interaction

1.  **Deployment**:
    - Deploy `StakeFLowToken`.
    - Deploy `StakeFlowVault` with the address of the `stakingToken` (e.g., USDC, WETH) and the `StakeFLowToken`.
2.  **Authorization**:
    - The owner of `StakeFLowToken` must call `addMinter(vaultAddress)` to authorize the Vault to mint rewards.
3.  **User Flow**:
    - **Stake**: User calls `approve` on the staking token, then `StakeFlowVault.stake(amount)`.
    - **Earn**: Rewards accrue automatically over time.
    - **Claim/Unstake**: Calling `claimRewards`, `stake`, or `unstake` triggers the minting of new `StakeFLowToken` directly to the user's wallet.

### Pre-requisites

 `foundry` (https://book.getfoundry.sh/)

 ### Installation

 (curl -L https://foundry.paradigm.xyz | bash)

 ### License

 MIT License

 


 
