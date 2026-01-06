// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IStakeFlowToken {
    function mint(address to, uint256 amount) external;
}

contract StakeFlowVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken;
    IStakeFlowToken public immutable rewardToken;

    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 rewardIndex;
    }

    uint256 public constant REWARD_RATE = 1000;
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant REWARD_DENOMINATOR = 10_000;

    uint256 public rewardIndex = 1 * 10 ** 18;
    uint256 public lastUpdateTime;
    uint256 public totalStaked;

    mapping(address => Stake) public stakes;

    error ZeroAmount();
    error InsufficientBalance();
    error NoStakeFound();

    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    constructor(address _stakingToken, address _rewardToken) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IStakeFlowToken(_rewardToken);
        lastUpdateTime = block.timestamp;
    }

    function updateRewardIndex() public {
        if (totalStaked == 0) {
            lastUpdateTime = block.timestamp;
            return;
        }

        uint256 timeElapsed = block.timestamp - lastUpdateTime;
        if (timeElapsed == 0) return;

        uint256 rewards = (totalStaked * REWARD_RATE * timeElapsed) / (REWARD_DENOMINATOR * SECONDS_PER_YEAR);
        rewardIndex += (rewards * 1e18) / totalStaked;
        lastUpdateTime = block.timestamp;
    }

    function stake(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();

        updateRewardIndex();

        Stake storage userStake = stakes[msg.sender];

        if (userStake.amount > 0) {
            uint256 pendingRewards = calculateRewards(msg.sender);
            if (pendingRewards > 0) {
                rewardToken.mint(msg.sender, pendingRewards);
            }
        }

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        userStake.amount += amount;
        userStake.timestamp = block.timestamp;
        userStake.rewardIndex = rewardIndex;
        totalStaked += amount;

        emit TokensStaked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();

        updateRewardIndex();

        Stake storage userStake = stakes[msg.sender];
        if (userStake.amount == 0) revert NoStakeFound();
        if (userStake.amount < amount) revert InsufficientBalance();

        uint256 pendingRewards = calculateRewards(msg.sender);
        if (pendingRewards > 0) {
            rewardToken.mint(msg.sender, pendingRewards);
        }

        userStake.amount -= amount;
        totalStaked -= amount;

        if (userStake.amount == 0) {
            delete stakes[msg.sender];
        } else {
            userStake.rewardIndex = rewardIndex;
        }

        stakingToken.safeTransfer(msg.sender, amount);

        emit TokensUnstaked(msg.sender, amount);
    }

    function claimRewards() external nonReentrant {
        updateRewardIndex();

        uint256 pendingRewards = calculateRewards(msg.sender);
        if (pendingRewards == 0) return;

        Stake storage userStake = stakes[msg.sender];
        if (userStake.amount > 0) {
            userStake.rewardIndex = rewardIndex;
        }

        rewardToken.mint(msg.sender, pendingRewards);

        emit RewardsClaimed(msg.sender, pendingRewards);
    }

    function calculateRewards(address user) public view returns (uint256) {
        Stake memory userStake = stakes[user];
        if (userStake.amount == 0) return 0;

        uint256 currentIndex = rewardIndex;

        uint256 timeElapsed = block.timestamp - lastUpdateTime;
        if (totalStaked > 0 && timeElapsed > 0) {
            uint256 pendingRewards = (totalStaked * REWARD_RATE * timeElapsed) / (REWARD_DENOMINATOR * SECONDS_PER_YEAR);
            currentIndex += (pendingRewards * 1e18) / totalStaked;
        }

        uint256 indexDifference = currentIndex - userStake.rewardIndex;
        return (userStake.amount * indexDifference) / 1e18;
    }

    function getStakerInfo(address user)
        external
        view
        returns (uint256 stakedAmount, uint256 stakedTimestamp, uint256 pendingRewardAmount)
    {
        Stake memory userStake = stakes[user];
        stakedAmount = userStake.amount;
        stakedTimestamp = userStake.timestamp;
        pendingRewardAmount = calculateRewards(user);
    }
}
