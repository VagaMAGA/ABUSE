// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AbuseToken} from "../src/AbuseToken.sol";
import {StakePool} from "../src/StakePool.sol";

contract StakePoolTest is Test {
    AbuseToken internal token;
    StakePool internal pool;
    uint256 internal aliceKey = 0xA11CE;
    uint256 internal bobKey = 0xB0B;
    address internal alice;
    address internal bob;
    address internal hub;

    function setUp() public {
        alice = vm.addr(aliceKey);
        bob = vm.addr(bobKey);
        hub = makeAddr("hub");
        token = new AbuseToken(hub, 1_000_000 ether);
        pool = new StakePool(address(token));

        vm.startPrank(hub);
        token.approve(address(pool), 50_000 ether);
        pool.fundRewards(50_000 ether);
        token.transfer(alice, 10_000 ether);
        token.transfer(bob, 10_000 ether);
        vm.stopPrank();
    }

    function test_constants_matchFrontend() public view {
        assertEq(pool.MIN_STAKE(), 500 ether);
        assertEq(pool.REWARD_RATE_PER_STAKED_TOKEN(), 31_709_791_983);
    }

    function test_fundRewards_increasesReserve() public {
        assertEq(pool.rewardReserve(), 50_000 ether);

        vm.startPrank(hub);
        token.approve(address(pool), 1_000 ether);
        pool.fundRewards(1_000 ether);
        vm.stopPrank();

        assertEq(pool.rewardReserve(), 51_000 ether);
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

        assertEq(pool.totalActions(), 1);
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

    function test_accrual_stops_when_reserve_depleted() public {
        StakePool smallPool = new StakePool(address(token));

        vm.startPrank(hub);
        token.approve(address(smallPool), 500 ether);
        smallPool.fundRewards(500 ether);
        vm.stopPrank();

        vm.startPrank(alice);
        token.approve(address(smallPool), 500 ether);
        smallPool.stake(500 ether);
        vm.stopPrank();

        vm.warp(block.timestamp + 365 days);
        smallPool.sync();

        uint256 earnedAfterYear = smallPool.earned(alice);
        assertApproxEqRel(earnedAfterYear, 500 ether, 1e15);
        assertLe(smallPool.rewardReserve(), 1e15);

        vm.warp(block.timestamp + 365 days);
        smallPool.sync();
        assertApproxEqRel(smallPool.earned(alice), earnedAfterYear, 1e12);
    }

    function test_high_tvl_claims_do_not_revert() public {
        StakePool smallPool = new StakePool(address(token));

        vm.startPrank(hub);
        token.approve(address(smallPool), 1_000 ether);
        smallPool.fundRewards(1_000 ether);
        vm.stopPrank();

        vm.startPrank(alice);
        token.approve(address(smallPool), 500 ether);
        smallPool.stake(500 ether);
        vm.stopPrank();

        vm.startPrank(bob);
        token.approve(address(smallPool), 500 ether);
        smallPool.stake(500 ether);
        vm.stopPrank();

        vm.warp(block.timestamp + 365 days);
        smallPool.sync();

        assertGt(smallPool.earned(alice), 0);
        assertGt(smallPool.earned(bob), 0);

        vm.prank(alice);
        smallPool.claimReward();

        vm.prank(bob);
        smallPool.claimReward();

        assertLe(smallPool.rewardReserve(), 1e15);
    }

    function test_unstake_works_when_reserve_empty() public {
        StakePool smallPool = new StakePool(address(token));

        vm.startPrank(hub);
        token.approve(address(smallPool), 100 ether);
        smallPool.fundRewards(100 ether);
        vm.stopPrank();

        vm.startPrank(alice);
        token.approve(address(smallPool), 500 ether);
        smallPool.stake(500 ether);
        vm.warp(block.timestamp + 365 days);
        smallPool.sync();
        smallPool.claimReward();
        vm.stopPrank();

        assertEq(smallPool.rewardReserve(), 0);

        vm.prank(alice);
        smallPool.unstake(500 ether);

        assertEq(smallPool.stakedBalance(alice), 0);
        assertEq(token.balanceOf(alice), 10_000 ether + 100 ether);
    }
}
