// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {Hub} from "../src/Hub.sol";
import {BadgeNFT} from "../src/BadgeNFT.sol";
import {AbuseToken} from "../src/AbuseToken.sol";

/// @notice Deploy Hub + $A token + BadgeNFT to Base / Base Sepolia
/// @dev Requires env: PRIVATE_KEY, RANK_SIGNER
contract Deploy is Script {
    uint256 internal constant AIRDROP_SUPPLY = 1_000_000 ether;

    function run() external returns (Hub hub, AbuseToken token, BadgeNFT badges) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address rankSigner = vm.envAddress("RANK_SIGNER");

        vm.startBroadcast(deployerKey);

        hub = new Hub();
        token = new AbuseToken(address(hub), AIRDROP_SUPPLY);
        hub.setAirdropToken(address(token));
        badges = new BadgeNFT(address(hub), rankSigner);

        vm.stopBroadcast();

        console2.log("Hub deployed at:", address(hub));
        console2.log("$A token deployed at:", address(token));
        console2.log("BadgeNFT deployed at:", address(badges));
        console2.log("Airdrop pool:", AIRDROP_SUPPLY / 1 ether, "A tokens");
        console2.log("Rank signer:", rankSigner);
    }
}
