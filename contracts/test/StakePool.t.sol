// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AbuseToken} from "../src/AbuseToken.sol";
import {StakePool} from "../src/StakePool.sol";

contract StakePoolTest is Test {
    AbuseToken internal token;
    StakePool internal pool;
    uint256 internal aliceKey = 0xA11CE;
    address internal alice;
    address internal hub;

    function setUp() public {
        alice = vm.addr(aliceKey);
        hub = makeAddr("hub");
        token = new AbuseToken(hub, 1_000_000 ether);
        pool = new StakePool(address(token));

        vm.prank(hub);
        token.transfer(address(pool), 50_000 ether);
        vm.prank(hub);
        token.transfer(alice, 10_000 ether);
    }

    function test_constants_matchFrontend() public view {
        assertEq(pool.MIN_STAKE(), 500 ether);
        assertEq(pool.REWARD_RATE_PER_STAKED_TOKEN(), 31_709_791_983);
    }

    function test_apy_100_percent_over_one_year() public {
        vm.startPrank(alice);
        token.approve(address(pool), 500 ether);
        pool.stake(500 ether);
        vm.stopPrank();

        vm.warp(block.timestamp + 365 days);

        uint256 pending = pool.earned(alice);
        assertApproxEqRel(pending, 500 ether, 1e15);
    }

    function test_stake_unstake_and_claimRewards() public {
        vm.startPrank(alice);
        token.approve(address(pool), 500 ether);
        pool.stake(500 ether);
        vm.stopPrank();

        assertEq(pool.stakedBalance(alice), 500 ether);
        assertEq(pool.totalStaked(), 500 ether);

        vm.warp(block.timestamp + 30 days);

        uint256 pending = pool.earned(alice);
        assertGt(pending, 0);

        vm.prank(alice);
        pool.claimReward();

        assertGt(token.balanceOf(alice), 10_000 ether - 500 ether);
        assertEq(pool.earned(alice), 0);

        vm.prank(alice);
        pool.unstake(500 ether);

        assertEq(pool.stakedBalance(alice), 0);
        assertEq(pool.totalStaked(), 0);
    }

    function test_revert_stake_belowMinimum() public {
        vm.startPrank(alice);
        token.approve(address(pool), 100 ether);
        vm.expectRevert(
            abi.encodeWithSelector(StakePool.BelowMinStake.selector, 100 ether, 500 ether)
        );
        pool.stake(100 ether);
        vm.stopPrank();
    }

    function test_exit_claimsAndUnstakes() public {
        vm.startPrank(alice);
        token.approve(address(pool), 500 ether);
        pool.stake(500 ether);
        vm.warp(block.timestamp + 7 days);
        pool.exit();
        vm.stopPrank();

        assertEq(pool.stakedBalance(alice), 0);
        assertGt(token.balanceOf(alice), 10_000 ether);
    }
}
