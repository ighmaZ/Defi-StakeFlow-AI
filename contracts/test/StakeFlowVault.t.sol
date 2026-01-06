// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/StakeFlowVault.sol";
import "../src/StakeFlowToken.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock Token for staking
contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MCK") {
        _mint(msg.sender, 1000000 * 10**18);
    }
}

contract StakeFlowVaultTest is Test {
    StakeFlowVault public vault;
    StakeFlowToken public rewardToken;
    MockERC20 public stakingToken;

    address public owner;
    address public user;

    function setUp() public {
        owner = address(this);
        user = address(0x1);

        // Deploy tokens 
        rewardToken = new StakeFlowToken();
        stakingToken = new MockERC20();

        // Deploy Vault
        vault = new StakeFlowVault(address(stakingToken), address(rewardToken));

        // Authorize Vault to mint rewards
        rewardToken.addMinter(address(vault));

        // Fund user
        stakingToken.transfer(user, 1000 * 10**18);
    }

    function test_Deployment() public {
        assertEq(address(vault.stakingToken()), address(stakingToken));
        assertEq(address(vault.rewardToken()), address(rewardToken));
        assertTrue(rewardToken.minters(address(vault)));
    }

    function test_Stake() public {
        uint256 stakeAmount = 100 * 10**18;

        vm.startPrank(user);
        stakingToken.approve(address(vault), stakeAmount);
        vault.stake(stakeAmount);
        vm.stopPrank();

        (uint256 staked,,) = vault.getStakerInfo(user);
        assertEq(staked, stakeAmount);
        assertEq(vault.totalStaked(), stakeAmount);
    }
}
