// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Hub} from "../src/Hub.sol";
import {BadgeNFT} from "../src/BadgeNFT.sol";
import {StakePool} from "../src/StakePool.sol";

/// @dev Keeps Hub/BadgeNFT constants aligned with src/config/*.ts
contract ConfigSyncTest is Test {
    Hub internal hub;
    BadgeNFT internal badges;
    StakePool internal stakePool;

    function setUp() public {
        hub = new Hub();
        badges = new BadgeNFT(address(hub), address(0xBEEF));
        stakePool = new StakePool(address(0xBEEF));
    }

    function test_hubConstants_matchFrontend() public view {
        assertEq(hub.POINTS_PER_FREE_GM(), 10);
        assertEq(hub.POINTS_PER_PAID_GM(), 20);
        assertEq(hub.FREE_GM_PER_DAY(), 3);
        assertEq(hub.GM_FEE(), 0.0001 ether);
        assertEq(hub.MIN_INTERVAL(), 5);
        assertEq(hub.POINTS_PER_FREE_DEPLOY(), 20);
        assertEq(hub.POINTS_PER_PAID_DEPLOY(), 40);
        assertEq(hub.POINTS_PER_REFERRAL(), 200);
        assertEq(hub.FREE_DEPLOY_PER_DAY(), 1);
        assertEq(hub.DEPLOY_FEE(), 0.0001 ether);
        assertEq(hub.FREE_BOOST_PER_DAY(), 1);
        assertEq(hub.BOOST_FEE(), 0.0001 ether);
        assertEq(hub.BOOST_DURATION(), 1 hours);
        assertEq(hub.BOOST_GM_MULTIPLIER(), 2);
        assertEq(hub.AIRDROP_MIN_POINTS(), 1000);
        assertEq(hub.POINTS_PER_A_TOKEN(), 1);
    }

    function test_badgeCount_is24() public view {
        assertEq(badges.badgeThreshold(24), 20);
        assertEq(badges.badgeCategory(24), 6); // CAT_REFERRAL
    }

    function test_stakePoolConstants_matchFrontend() public view {
        assertEq(stakePool.MIN_STAKE(), 500 ether);
        assertEq(stakePool.REWARD_RATE_PER_STAKED_TOKEN(), 31_709_791_983);
    }
}
