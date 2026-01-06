// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/StakeFlowToken.sol";
import "../src/StakeFlowVault.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();

        StakeFlowToken token = new StakeFlowToken();
        console.log("=== StakeFlowToken deployed at:", address(token));

        StakeFlowVault vault = new StakeFlowVault(address(token), address(token));
        console.log("=== StakeFlowVault deployed at:", address(vault));

        token.addMinter(address(vault));
        console.log("=== Vault added as minter");

        uint256 initialSupply = 1_000_000 * 10 ** 18;
        token.mint(msg.sender, initialSupply);
        console.log("=== Minted 1,000,000 SFT to deployer:", msg.sender);

        vm.stopBroadcast();

        console.log("=== Deployment Complete ===");
        console.log("Token Address:", address(token));
        console.log("Vault Address:", address(vault));
        console.log("Minted Amount:", initialSupply / 10 ** 18, "SFT");
    }
}
