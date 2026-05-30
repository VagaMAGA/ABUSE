// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20Stake {
    function balanceOf(address account) external view returns (uint256);

    function transfer(address to, uint256 amount) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

/// @title StakePool — stake $A and earn $A rewards from the pool budget
contract StakePool {
    uint256 public constant MIN_STAKE = 500 ether;
    uint256 public constant REWARD_SCALE = 1e18;

    /// @dev Per-staked-token rate on 1e18 scale — 100% APY (doubles stake in ~1 year)
    uint256 public constant REWARD_RATE_PER_STAKED_TOKEN = 31_709_791_983;

    IERC20Stake public immutable stakingToken;
    address public owner;

    uint256 public totalStaked;
    uint256 public rewardRatePerStakedToken;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public pendingRewards;

    error BelowMinStake(uint256 amount, uint256 minimum);
    error InsufficientStake(uint256 requested, uint256 available);
    error ZeroAmount();

    event Staked(address indexed user, uint256 amount, uint256 totalStaked);
    event Unstaked(address indexed user, uint256 amount, uint256 totalStaked);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 newRate);
    event RewardsFunded(address indexed from, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = _currentRewardPerToken();
        lastUpdateTime = block.timestamp;

        if (account != address(0)) {
            pendingRewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    constructor(address token_) {
        require(token_ != address(0), "zero token");
        stakingToken = IERC20Stake(token_);
        owner = msg.sender;
        rewardRatePerStakedToken = REWARD_RATE_PER_STAKED_TOKEN;
        lastUpdateTime = block.timestamp;
    }

    function stake(uint256 amount) external updateReward(msg.sender) {
        if (amount == 0) revert ZeroAmount();
        if (amount < MIN_STAKE) revert BelowMinStake(amount, MIN_STAKE);

        totalStaked += amount;
        stakedBalance[msg.sender] += amount;

        require(
            stakingToken.transferFrom(msg.sender, address(this), amount),
            "transfer failed"
        );

        emit Staked(msg.sender, amount, stakedBalance[msg.sender]);
    }

    function unstake(uint256 amount) external updateReward(msg.sender) {
        if (amount == 0) revert ZeroAmount();

        uint256 balance = stakedBalance[msg.sender];
        if (amount > balance) revert InsufficientStake(amount, balance);

        totalStaked -= amount;
        stakedBalance[msg.sender] = balance - amount;

        require(stakingToken.transfer(msg.sender, amount), "transfer failed");

        emit Unstaked(msg.sender, amount, stakedBalance[msg.sender]);
    }

    function claimReward() external updateReward(msg.sender) {
        uint256 reward = pendingRewards[msg.sender];
        if (reward == 0) return;

        pendingRewards[msg.sender] = 0;
        require(stakingToken.transfer(msg.sender, reward), "reward transfer failed");

        emit RewardClaimed(msg.sender, reward);
    }

    function exit() external updateReward(msg.sender) {
        uint256 reward = pendingRewards[msg.sender];
        if (reward > 0) {
            pendingRewards[msg.sender] = 0;
            require(stakingToken.transfer(msg.sender, reward), "reward transfer failed");
            emit RewardClaimed(msg.sender, reward);
        }

        uint256 balance = stakedBalance[msg.sender];
        if (balance == 0) return;

        totalStaked -= balance;
        stakedBalance[msg.sender] = 0;
        require(stakingToken.transfer(msg.sender, balance), "transfer failed");
        emit Unstaked(msg.sender, balance, 0);
    }

    function fundRewards(uint256 amount) external {
        require(amount > 0, "zero amount");
        require(
            stakingToken.transferFrom(msg.sender, address(this), amount),
            "fund failed"
        );
        emit RewardsFunded(msg.sender, amount);
    }

    function setRewardRate(uint256 newRate) external onlyOwner {
        rewardPerTokenStored = _currentRewardPerToken();
        lastUpdateTime = block.timestamp;
        rewardRatePerStakedToken = newRate;
        emit RewardRateUpdated(newRate);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero owner");
        owner = newOwner;
    }

    function earned(address account) public view returns (uint256) {
        uint256 perToken = _currentRewardPerToken();
        uint256 staked = stakedBalance[account];
        uint256 delta = perToken - userRewardPerTokenPaid[account];
        return (staked * delta) / REWARD_SCALE + pendingRewards[account];
    }

    function rewardPoolBalance() external view returns (uint256) {
        return stakingToken.balanceOf(address(this));
    }

    function _currentRewardPerToken() internal view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }

        uint256 elapsed = block.timestamp - lastUpdateTime;
        return rewardPerTokenStored + elapsed * rewardRatePerStakedToken;
    }
}
