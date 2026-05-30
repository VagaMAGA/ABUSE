// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {Hub} from "../src/Hub.sol";
import {BadgeNFT} from "../src/BadgeNFT.sol";
import {AbuseToken} from "../src/AbuseToken.sol";
import {StakePool} from "../src/StakePool.sol";

/// @notice Deploy Hub + $A token + BadgeNFT + StakePool to Base / Base Sepolia
/// @dev Requires env: PRIVATE_KEY, RANK_SIGNER
contract Deploy is Script {
    uint256 internal constant AIRDROP_SUPPLY = 1_000_000 ether;
    uint256 internal constant STAKE_REWARD_BUDGET = 50_000 ether;

    function run()
        external
        returns (Hub hub, AbuseToken token, BadgeNFT badges, StakePool stakePool)
    {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address rankSigner = vm.envAddress("RANK_SIGNER");

        vm.startBroadcast(deployerKey);

        hub = new Hub();
        token = new AbuseToken(msg.sender, AIRDROP_SUPPLY + STAKE_REWARD_BUDGET);
        token.transfer(address(hub), AIRDROP_SUPPLY);
        hub.setAirdropToken(address(token));
        badges = new BadgeNFT(address(hub), rankSigner);
        stakePool = new StakePool(address(token));
        token.transfer(address(stakePool), STAKE_REWARD_BUDGET);

        vm.stopBroadcast();

        console2.log("Hub deployed at:", address(hub));
        console2.log("$A token deployed at:", address(token));
        console2.log("BadgeNFT deployed at:", address(badges));
        console2.log("StakePool deployed at:", address(stakePool));
        console2.log("Airdrop pool:", AIRDROP_SUPPLY / 1 ether, "A tokens");
        console2.log("Stake reward budget:", STAKE_REWARD_BUDGET / 1 ether, "A tokens");
        console2.log("Rank signer:", rankSigner);
    }
}
