// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/StakeFlowVault.sol";
import "../src/StakeFlowToken.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MCK") {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}

contract StakeFlowVaultTest is Test {
    StakeFlowVault public vault;
    StakeFLowToken public rewardToken;
    MockERC20 public stakingToken;

    address public owner;
    address public user1;
    address public user2;
    address public user3;

    uint256 constant STAKE_AMOUNT = 100 * 10 ** 18;
    uint256 constant USER_BALANCE = 1000 * 10 ** 18;

    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        user3 = address(0x3);

        rewardToken = new StakeFLowToken();
        stakingToken = new MockERC20();
        vault = new StakeFlowVault(address(stakingToken), address(rewardToken));

        rewardToken.addMinter(address(vault));

        stakingToken.transfer(user1, USER_BALANCE);
        stakingToken.transfer(user2, USER_BALANCE);
        stakingToken.transfer(user3, USER_BALANCE);
    }

    // ===== CONSTRUCTOR TESTS =====

    function test_Deployment() public {
        assertEq(address(vault.stakingToken()), address(stakingToken));
        assertEq(address(vault.rewardToken()), address(rewardToken));
        assertTrue(rewardToken.minters(address(vault)));
    }

    function test_InitialRewardIndex() public {
        assertEq(vault.rewardIndex(), 1e18);
    }

    function test_InitialLastUpdateTime() public {
        assertEq(vault.lastUpdateTime(), block.timestamp);
    }

    // ===== STAKING TESTS =====

    function test_Stake() public {
        vm.startPrank(user1);
        stakingToken.approve(address(vault), STAKE_AMOUNT);
        vault.stake(STAKE_AMOUNT);
        vm.stopPrank();

        (uint256 staked,,) = vault.getStakerInfo(user1);
        assertEq(staked, STAKE_AMOUNT);
        assertEq(vault.totalStaked(), STAKE_AMOUNT);
    }

    function test_StakeZeroAmount() public {
        vm.startPrank(user1);
        stakingToken.approve(address(vault), 0);
        vm.expectRevert(StakeFlowVault.ZeroAmount.selector);
        vault.stake(0);
        vm.stopPrank();
    }

    function test_StakeWithoutAllowance() public {
        vm.prank(user1);
        vm.expectRevert();
        vault.stake(STAKE_AMOUNT);
    }

    function test_StakeMultipleTimes() public {
        vm.startPrank(user1);
        stakingToken.approve(address(vault), STAKE_AMOUNT * 2);
        vault.stake(STAKE_AMOUNT);
        vault.stake(STAKE_AMOUNT);
        vm.stopPrank();

        (uint256 staked,,) = vault.getStakerInfo(user1);
        assertEq(staked, STAKE_AMOUNT * 2);
        assertEq(vault.totalStaked(), STAKE_AMOUNT * 2);
    }

    function test_StakeEmitsEvent() public {
        vm.startPrank(user1);
        stakingToken.approve(address(vault), STAKE_AMOUNT);
        vm.expectEmit(true, true, true, true);
        emit StakeFlowVault.TokensStaked(user1, STAKE_AMOUNT);
        vault.stake(STAKE_AMOUNT);
        vm.stopPrank();
    }

    // ===== UNSTAKING TESTS =====

    function test_Unstake() public {
        vm.startPrank(user1);
        stakingToken.approve(address(vault), STAKE_AMOUNT);
        vault.stake(STAKE_AMOUNT);

        uint256 balanceBefore = stakingToken.balanceOf(user1);
        vault.unstake(STAKE_AMOUNT);
        uint256 balanceAfter = stakingToken.balanceOf(user1);

        assertEq(balanceAfter - balanceBefore, STAKE_AMOUNT);
        assertEq(vault.totalStaked(), 0);
        vm.stopPrank();
    }

    function test_UnstakeZeroAmount() public {
        vm.startPrank(user1);
        stakingToken.approve(address(vault), STAKE_AMOUNT);
        vault.stake(STAKE_AMOUNT);

        vm.expectRevert(StakeFlowVault.ZeroAmount.selector);
        vault.unstake(0);
        vm.stopPrank();
    }

    function test_UnstakeWithNoStake() public {
        vm.prank(user1);
        vm.expectRevert(StakeFlowVault.NoStakeFound.selector);
        vault.unstake(STAKE_AMOUNT);
    }

    function test_UnstakeInsufficientBalance() public {
        vm.startPrank(user1);
        stakingToken.approve(address(vault), STAKE_AMOUNT);
        vault.stake(STAKE_AMOUNT);

        vm.expectRevert(StakeFlowVault.InsufficientBalance.selector);
        vault.unstake(STAKE_AMOUNT * 2);
        vm.stopPrank();
    }

    function test_UnstakePartialAmount() public {
        vm.startPrank(user1);
        stakingToken.approve(address(vault), STAKE_AMOUNT);
        vault.stake(STAKE_AMOUNT);

        uint256 unstakeAmount = STAKE_AMOUNT / 2;
        vault.unstake(unstakeAmount);

        (uint256 staked,,) = vault.getStakerInfo(user1);
        assertEq(staked, STAKE_AMOUNT - unstakeAmount);
        assertEq(vault.totalStaked(), STAKE_AMOUNT - unstakeAmount);
        vm.stopPrank();
    }

    function test_UnstakeEmitsEvent() public {
        vm.startPrank(user1);
        stakingToken.approve(address(vault), STAKE_AMOUNT);
        vault.stake(STAKE_AMOUNT);

        vm.expectEmit(true, true, true, true);
        emit StakeFlowVault.TokensUnstaked(user1, STAKE_AMOUNT);
        vault.unstake(STAKE_AMOUNT);
        vm.stopPrank();
    }

    // ===== CLAIM REWARDS TESTS =====

    function test_ClaimRewards() public {
        vm.startPrank(user1);
        stakingToken.approve(address(vault), STAKE_AMOUNT);
        vault.stake(STAKE_AMOUNT);

        vm.warp(block.timestamp + 365 days);

        uint256 balanceBefore = rewardToken.balanceOf(user1);
        vault.claimRewards();
        uint256 balanceAfter = rewardToken.balanceOf(user1);

        assertGt(balanceAfter, balanceBefore);
        vm.stopPrank();
    }

    function test_ClaimRewardsWithNoRewards() public {
        vm.startPrank(user1);
        stakingToken.approve(address(vault), STAKE_AMOUNT);
        vault.stake(STAKE_AMOUNT);

        uint256 balanceBefore = rewardToken.balanceOf(user1);
        vault.claimRewards();

        assertEq(rewardToken.balanceOf(user1), balanceBefore);
        vm.stopPrank();
    }

    function test_ClaimRewardsEmitsEvent() public {
        vm.startPrank(user1);
        stakingToken.approve(address(vault), STAKE_AMOUNT);
        vault.stake(STAKE_AMOUNT);

        vm.warp(block.timestamp + 365 days);

        uint256 expectedRewards = vault.calculateRewards(user1);

        vm.expectEmit(true, true, true, true);
        emit StakeFlowVault.RewardsClaimed(user1, expectedRewards);
        vault.claimRewards();
        vm.stopPrank();
    }

    // ===== REWARD CALCULATION TESTS =====

    function test_CalculateRewardsWithNoStake() public {
        uint256 rewards = vault.calculateRewards(user1);
        assertEq(rewards, 0);
    }

    function test_CalculateRewardsOverTime() public {
        vm.startPrank(user1);
        stakingToken.approve(address(vault), STAKE_AMOUNT);
        vault.stake(STAKE_AMOUNT);
        vm.stopPrank();

        vm.warp(block.timestamp + 365 days);
        uint256 rewards1Year = vault.calculateRewards(user1);

        assertGt(rewards1Year, 0);
        assertApproxEqRel(rewards1Year, (STAKE_AMOUNT * 1000 / 10000), 1e16);
    }

    function test_CalculateRewardsIncludesPendingTime() public {
        vm.startPrank(user1);
        stakingToken.approve(address(vault), STAKE_AMOUNT);
        vault.stake(STAKE_AMOUNT);
        vm.stopPrank();

        vm.warp(block.timestamp + 180 days);
        uint256 rewards = vault.calculateRewards(user1);

        assertGt(rewards, 0);
        assertLt(rewards, STAKE_AMOUNT * 1000 / 10000);
    }

    // ===== UPDATE REWARD INDEX TESTS =====

    function test_UpdateRewardIndexWithZeroStaked() public {
        uint256 lastUpdate = vault.lastUpdateTime();
        vm.warp(block.timestamp + 365 days);

        vault.updateRewardIndex();

        assertEq(vault.lastUpdateTime(), block.timestamp);
        assertEq(vault.rewardIndex(), 1e18);
    }

    function test_UpdateRewardIndexWithStaked() public {
        vm.startPrank(user1);
        stakingToken.approve(address(vault), STAKE_AMOUNT);
        vault.stake(STAKE_AMOUNT);
        vm.stopPrank();

        uint256 indexBefore = vault.rewardIndex();
        vm.warp(block.timestamp + 365 days);

        vault.updateRewardIndex();

        assertGt(vault.rewardIndex(), indexBefore);
    }

    // ===== INTEGRATION TESTS =====

    function test_FullStakingCycle() public {
        uint256 rewardBalanceBefore = rewardToken.balanceOf(user1);

        vm.startPrank(user1);
        stakingToken.approve(address(vault), STAKE_AMOUNT);
        vault.stake(STAKE_AMOUNT);
        vm.stopPrank();

        vm.warp(block.timestamp + 365 days);

        vm.prank(user1);
        vault.claimRewards();

        assertGt(rewardToken.balanceOf(user1), rewardBalanceBefore);

        vm.prank(user1);
        vault.unstake(STAKE_AMOUNT);

        (uint256 staked,,) = vault.getStakerInfo(user1);
        assertEq(staked, 0);
    }

    function test_MultipleUsersStaking() public {
        vm.startPrank(user1);
        stakingToken.approve(address(vault), STAKE_AMOUNT);
        vault.stake(STAKE_AMOUNT);
        vm.stopPrank();

        vm.startPrank(user2);
        stakingToken.approve(address(vault), STAKE_AMOUNT * 2);
        vault.stake(STAKE_AMOUNT * 2);
        vm.stopPrank();

        vm.startPrank(user3);
        stakingToken.approve(address(vault), STAKE_AMOUNT);
        vault.stake(STAKE_AMOUNT);
        vm.stopPrank();

        assertEq(vault.totalStaked(), STAKE_AMOUNT * 4);

        vm.warp(block.timestamp + 365 days);

        uint256 rewards1 = vault.calculateRewards(user1);
        uint256 rewards2 = vault.calculateRewards(user2);
        uint256 rewards3 = vault.calculateRewards(user3);

        assertGt(rewards1, 0);
        assertGt(rewards2, 0);
        assertGt(rewards3, 0);
        assertApproxEqRel(rewards2, rewards1 * 2, 1e16);
        assertApproxEqRel(rewards3, rewards1, 1e16);
    }

    function test_RewardDistributionAcrossStakers() public {
        vm.startPrank(user1);
        stakingToken.approve(address(vault), STAKE_AMOUNT);
        vault.stake(STAKE_AMOUNT);
        vm.stopPrank();

        vm.startPrank(user2);
        stakingToken.approve(address(vault), STAKE_AMOUNT);
        vault.stake(STAKE_AMOUNT);
        vm.stopPrank();

        vm.warp(block.timestamp + 365 days);

        vm.prank(user1);
        vault.claimRewards();

        vm.prank(user2);
        vault.claimRewards();

        assertEq(rewardToken.balanceOf(user1), rewardToken.balanceOf(user2));
    }

    function test_MultipleStakesAndUnstakes() public {
        vm.startPrank(user1);
        stakingToken.approve(address(vault), STAKE_AMOUNT * 3);

        vault.stake(STAKE_AMOUNT);

        vm.warp(block.timestamp + 180 days);
        vault.stake(STAKE_AMOUNT);

        vm.warp(block.timestamp + 180 days);
        vault.unstake(STAKE_AMOUNT);

        vm.warp(block.timestamp + 180 days);
        vault.unstake(STAKE_AMOUNT);
        vm.stopPrank();

        (uint256 staked,,) = vault.getStakerInfo(user1);
        assertEq(staked, 0);
        assertGt(rewardToken.balanceOf(user1), 0);
    }

    // ===== GET STAKER INFO TESTS =====

    function test_GetStakerInfo() public {
        vm.startPrank(user1);
        stakingToken.approve(address(vault), STAKE_AMOUNT);
        vault.stake(STAKE_AMOUNT);
        vm.stopPrank();

        (uint256 stakedAmount, uint256 stakedTimestamp, uint256 pendingRewards) = vault.getStakerInfo(user1);

        assertEq(stakedAmount, STAKE_AMOUNT);
        assertGt(stakedTimestamp, 0);
        assertEq(pendingRewards, 0);
    }
}
