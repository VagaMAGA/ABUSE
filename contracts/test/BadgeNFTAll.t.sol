// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Hub} from "../src/Hub.sol";
import {BadgeNFT} from "../src/BadgeNFT.sol";

/// @dev Verifies all 24 badge types: config, eligibility paths, and mint flows.
contract BadgeNFTAllTest is Test {
    Hub internal hub;
    BadgeNFT internal badges;

    uint256 internal aliceKey = 0xA11CE;
    address internal alice;
    uint256 internal rankSignerKey = 0xBEEF;
    address internal rankSigner;

    uint8 internal constant CAT_GM = 1;
    uint8 internal constant CAT_DEPLOY = 2;
    uint8 internal constant CAT_POINTS = 3;
    uint8 internal constant CAT_RANK = 4;
    uint8 internal constant CAT_COLLECTION = 5;
    uint8 internal constant CAT_REFERRAL = 6;

    function setUp() public {
        alice = vm.addr(aliceKey);
        rankSigner = vm.addr(rankSignerKey);
        hub = new Hub();
        hub.setTreasury(alice);
        badges = new BadgeNFT(address(hub), rankSigner);
        vm.deal(alice, 10 ether);
    }

    function test_allBadgeTypes_configMatchesFrontend() public view {
        _assertBadge(1, CAT_GM, 10);
        _assertBadge(2, CAT_GM, 20);
        _assertBadge(3, CAT_GM, 50);
        _assertBadge(4, CAT_DEPLOY, 10);
        _assertBadge(5, CAT_DEPLOY, 20);
        _assertBadge(6, CAT_DEPLOY, 50);
        _assertBadge(7, CAT_POINTS, 100);
        _assertBadge(8, CAT_POINTS, 500);
        _assertBadge(9, CAT_POINTS, 1000);
        _assertBadge(10, CAT_RANK, 10);
        _assertBadge(11, CAT_RANK, 50);
        _assertBadge(12, CAT_RANK, 100);
        _assertBadge(13, CAT_GM, 100);
        _assertBadge(14, CAT_DEPLOY, 100);
        _assertBadge(15, CAT_POINTS, 5000);
        _assertBadge(16, CAT_RANK, 3);
        _assertBadge(17, CAT_COLLECTION, 4);
        _assertBadge(18, CAT_COLLECTION, 8);
        _assertBadge(19, CAT_COLLECTION, 12);
        _assertBadge(20, CAT_COLLECTION, 16);
        _assertBadge(21, CAT_REFERRAL, 2);
        _assertBadge(22, CAT_REFERRAL, 5);
        _assertBadge(23, CAT_REFERRAL, 10);
        _assertBadge(24, CAT_REFERRAL, 20);
    }

    function test_mintDeployBadge() public {
        _deployMany(alice, 10);
        assertTrue(badges.eligibility(alice, 4));
        vm.prank(alice);
        badges.mint(4);
        assertTrue(badges.hasMintedType(alice, 4));
    }

    function test_mintAllReferralTiers() public {
        vm.prank(alice);
        hub.registerReferralCode();
        string memory code = hub.referralCodeFor(alice);

        address[20] memory friends;
        for (uint256 i = 0; i < 20; i++) {
            friends[i] = makeAddr(string(abi.encodePacked("friend", i)));
            vm.deal(friends[i], 1 ether);
            vm.prank(friends[i]);
            hub.redeemReferralCode(code);
        }

        assertEq(hub.referralCount(alice), 20);

        uint256[4] memory referralBadges = [uint256(21), 22, 23, 24];
        for (uint256 i = 0; i < referralBadges.length; i++) {
            uint256 badgeType = referralBadges[i];
            assertTrue(badges.eligibility(alice, badgeType));
            vm.prank(alice);
            badges.mint(badgeType);
            assertTrue(badges.hasMintedType(alice, badgeType));
        }
    }

    function test_mintAllRankBadges_withSignature() public {
        uint256[4] memory rankBadges = [uint256(10), 11, 12, 16];
        for (uint256 i = 0; i < rankBadges.length; i++) {
            uint256 badgeType = rankBadges[i];
            uint256 deadline = block.timestamp + 1 hours;
            bytes memory sig = _signRank(alice, badgeType, deadline);
            vm.prank(alice);
            badges.mintRankBadge(badgeType, deadline, sig);
            assertTrue(badges.hasMintedType(alice, badgeType));
        }
    }

    function test_revert_mintRankBadge_viaHubMint() public {
        vm.prank(alice);
        vm.expectRevert(BadgeNFT.InvalidBadgeType.selector);
        badges.mint(10);
    }

    function test_revert_mintHubBadge_viaRankMint() public {
        _gmMany(alice, 10);
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _signRank(alice, 1, deadline);
        vm.prank(alice);
        vm.expectRevert(BadgeNFT.InvalidBadgeType.selector);
        badges.mintRankBadge(1, deadline, sig);
    }

    function test_collectionCountsOnlyMilestoneTypes1to16() public {
        _setMinted(alice, 1);
        _setMinted(alice, 2);
        _setMinted(alice, 21);

        assertEq(badges.milestoneMintedCount(alice), 2);
        assertFalse(badges.eligibility(alice, 17));
    }

    function test_mintCollectionBadge_after16Milestones() public {
        for (uint256 t = 1; t <= 16; t++) {
            _setMinted(alice, t);
        }
        assertEq(badges.milestoneMintedCount(alice), 16);
        assertTrue(badges.eligibility(alice, 20));

        vm.prank(alice);
        badges.mint(20);
        assertTrue(badges.hasMintedType(alice, 20));
    }

    function _assertBadge(
        uint256 badgeType,
        uint8 expectedCategory,
        uint256 expectedThreshold
    ) internal view {
        assertEq(badges.badgeCategory(badgeType), expectedCategory);
        assertEq(badges.badgeThreshold(badgeType), expectedThreshold);
    }

    function _setMinted(address user, uint256 badgeType) internal {
        bytes32 base = keccak256(abi.encode(user, uint256(6)));
        bytes32 slot = keccak256(abi.encode(badgeType, base));
        vm.store(address(badges), slot, bytes32(uint256(1)));
    }

    function _gmMany(address user, uint256 times) internal {
        for (uint256 i = 0; i < times; i++) {
            if (hub.freeGmsRemaining(user) > 0) {
                vm.prank(user);
                hub.gm();
            } else {
                vm.startBroadcast(aliceKey);
                hub.gm{value: hub.GM_FEE()}();
                vm.stopBroadcast();
            }
            vm.warp(block.timestamp + hub.MIN_INTERVAL());
        }
    }

    function _deployMany(address user, uint256 times) internal {
        for (uint256 i = 0; i < times; i++) {
            if (hub.freeDeployAvailable(user)) {
                vm.prank(user);
                hub.deployToken("T", "T", 100 ether);
            } else {
                vm.warp(block.timestamp + 1 days);
                vm.prank(user);
                hub.deployToken("T", "T", 100 ether);
            }
        }
    }

    function _signRank(
        address user,
        uint256 badgeType,
        uint256 deadline
    ) internal view returns (bytes memory) {
        bytes32 digest = keccak256(abi.encodePacked(user, badgeType, deadline));
        bytes32 ethHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", digest)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(rankSignerKey, ethHash);
        return abi.encodePacked(r, s, v);
    }
}
