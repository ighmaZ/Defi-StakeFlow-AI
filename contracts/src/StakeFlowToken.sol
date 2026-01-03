//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakeFLowToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10 ** 18;
    bool public mintingEnabled = true;

    error MaxSupplyExceeded();
    error MintingDisabled();

    event MintingStatusChanged(bool enabled);

    constructor() ERC20("StakeFlow Token", "SFT") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        if (!mintingEnabled) revert MintingDisabled();
        if (totalSupply() + amount > MAX_SUPPLY) revert MaxSupplyExceeded();
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function setMintingEnabled(bool _enabled) external onlyOwner {
        mintingEnabled = _enabled;
        emit MintingStatusChanged(_enabled);
    }
}
