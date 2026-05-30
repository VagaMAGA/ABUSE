// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Hub} from "../src/Hub.sol";

contract HubTest is Test {
    Hub internal hub;
    uint256 internal aliceKey = 0xA11CE;
    address internal alice;

    function setUp() public {
        alice = vm.addr(aliceKey);
        hub = new Hub();
        hub.setTreasury(alice);
        vm.deal(alice, 1 ether);
    }

    function test_freeGm_awardsPoints() public {
        vm.prank(alice);
        hub.gm();

        assertEq(hub.gmCount(alice), 1);
        assertEq(hub.points(alice), hub.POINTS_PER_FREE_GM());
        assertEq(hub.totalGms(), 1);
    }

    function test_paidGm_afterFreeQuota() public {
        while (hub.freeGmsRemaining(alice) > 0) {
            vm.prank(alice);
            hub.gm();
            vm.warp(block.timestamp + hub.MIN_INTERVAL());
        }

        vm.startBroadcast(aliceKey);
        hub.gm{value: hub.GM_FEE()}();
        vm.stopBroadcast();

        assertEq(hub.gmCount(alice), hub.FREE_GM_PER_DAY() + 1);
        assertEq(
            hub.points(alice),
            hub.FREE_GM_PER_DAY() * hub.POINTS_PER_FREE_GM() +
                hub.POINTS_PER_PAID_GM()
        );
    }

    function test_freeRemaining_afterThreeGms() public {
        while (hub.freeGmsRemaining(alice) > 0) {
            vm.prank(alice);
            hub.gm();
            vm.warp(block.timestamp + hub.MIN_INTERVAL());
        }
        assertEq(hub.freeGmsRemaining(alice), 0);
    }

    function _gmMany(address user, uint256 times) internal {
        uint256 userKey = user == alice ? aliceKey : 0;
        for (uint256 i = 0; i < times; i++) {
            if (hub.freeGmsRemaining(user) > 0) {
                vm.prank(user);
                hub.gm();
            } else {
                require(userKey != 0, "unknown user key");
                vm.startBroadcast(userKey);
                hub.gm{value: hub.GM_FEE()}();
                vm.stopBroadcast();
            }
            vm.warp(block.timestamp + hub.MIN_INTERVAL());
        }
    }

    function test_freeDeploy_awardsPoints() public {
        vm.prank(alice);
        address token = hub.deployToken("Test", "TST", 1_000 ether);

        assertTrue(token != address(0));
        assertEq(hub.deployCount(alice), 1);
        assertEq(hub.points(alice), hub.POINTS_PER_FREE_DEPLOY());
        assertFalse(hub.freeDeployAvailable(alice));
    }

    function test_freeDeploy_resetsNextDay() public {
        vm.prank(alice);
        hub.deployToken("Test", "TST", 1_000 ether);
        assertFalse(hub.freeDeployAvailable(alice));

        vm.warp(block.timestamp + 1 days);
        assertTrue(hub.freeDeployAvailable(alice));

        vm.prank(alice);
        hub.deployToken("Test2", "TS2", 1_000 ether);
        assertEq(hub.deployCount(alice), 2);
        assertEq(
            hub.points(alice),
            hub.POINTS_PER_FREE_DEPLOY() * 2
        );
    }

    function test_revert_gmTooSoon() public {
        vm.startPrank(alice);
        hub.gm();
        vm.expectRevert(
            abi.encodeWithSelector(Hub.GmTooSoon.selector, block.timestamp + hub.MIN_INTERVAL())
        );
        hub.gm();
        vm.stopPrank();
    }

    function test_referralCode_bothGet100OnRedeem() public {
        address bob = makeAddr("bob");
        vm.deal(bob, 1 ether);

        vm.prank(alice);
        hub.registerReferralCode();

        string memory code = hub.referralCodeFor(alice);
        assertEq(bytes(code).length, 6);

        vm.prank(bob);
        hub.redeemReferralCode(code);

        assertEq(hub.points(alice), hub.POINTS_PER_REFERRAL());
        assertEq(hub.points(bob), hub.POINTS_PER_REFERRAL());
        assertEq(hub.referralCount(alice), 1);
        assertTrue(hub.hasRedeemedReferralCode(bob));
        assertEq(hub.referredBy(bob), alice);
    }

    function test_revert_redeemBeforeRegister() public {
        address bob = makeAddr("bob");
        string memory code = hub.referralCodeFor(alice);

        vm.prank(bob);
        vm.expectRevert(Hub.InvalidReferralCode.selector);
        hub.redeemReferralCode(code);
    }

    function test_revert_redeemOwnCode() public {
        vm.prank(alice);
        hub.registerReferralCode();

        string memory code = hub.referralCodeFor(alice);

        vm.prank(alice);
        vm.expectRevert(Hub.CannotRedeemOwnCode.selector);
        hub.redeemReferralCode(code);
    }

    function test_revert_redeemTwice() public {
        address bob = makeAddr("bob");

        vm.prank(alice);
        hub.registerReferralCode();
        string memory code = hub.referralCodeFor(alice);

        vm.prank(bob);
        hub.redeemReferralCode(code);

        vm.prank(bob);
        vm.expectRevert(Hub.ReferralCodeAlreadyRedeemed.selector);
        hub.redeemReferralCode(code);
    }

    function test_revert_registerCodeTwice() public {
        vm.startPrank(alice);
        hub.registerReferralCode();
        vm.expectRevert(Hub.ReferralCodeAlreadyRegistered.selector);
        hub.registerReferralCode();
        vm.stopPrank();
    }

    function test_freeBoost_doublesGmPoints() public {
        vm.prank(alice);
        hub.boost();
        assertTrue(hub.boostActive(alice));

        vm.prank(alice);
        hub.gm();

        assertEq(
            hub.points(alice),
            hub.POINTS_PER_FREE_GM() * hub.BOOST_GM_MULTIPLIER()
        );
    }

    function test_boost_expiresAfterDuration() public {
        vm.prank(alice);
        hub.boost();

        vm.warp(block.timestamp + hub.BOOST_DURATION() + 1);
        assertFalse(hub.boostActive(alice));

        vm.prank(alice);
        hub.gm();

        assertEq(hub.points(alice), hub.POINTS_PER_FREE_GM());
    }

    function test_boost_doublesDeployPoints() public {
        vm.prank(alice);
        hub.boost();

        vm.prank(alice);
        hub.deployToken("Boost", "BST", 1_000 ether);

        assertEq(
            hub.points(alice),
            hub.POINTS_PER_FREE_DEPLOY() * hub.BOOST_GM_MULTIPLIER()
        );
    }

    function test_paidBoost_afterFreeQuota() public {
        vm.prank(alice);
        hub.boost();
        assertFalse(hub.freeBoostAvailable(alice));

        vm.startBroadcast(aliceKey);
        hub.boost{value: hub.BOOST_FEE()}();
        vm.stopBroadcast();

        assertEq(hub.boostCount(alice), 2);
        assertTrue(hub.boostActive(alice));
    }

    function test_gm_doesNotAwardReferralPoints() public {
        address bob = makeAddr("bob");
        vm.deal(bob, 1 ether);

        vm.prank(alice);
        hub.registerReferralCode();

        vm.prank(bob);
        hub.redeemReferralCode(hub.referralCodeFor(alice));

        uint256 alicePts = hub.points(alice);

        vm.prank(bob);
        hub.gm();

        assertEq(hub.points(alice), alicePts);
    }
}
