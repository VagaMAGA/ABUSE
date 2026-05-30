// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SimpleToken} from "./SimpleToken.sol";

interface IERC20Minimal {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

/// @title Hub — example onchain actions on Base (template)
contract Hub {
    uint256 public constant POINTS_PER_FREE_GM = 10;
    uint256 public constant POINTS_PER_PAID_GM = 20;
    uint256 public constant FREE_GM_PER_DAY = 2;
    uint256 public constant GM_FEE = 0.0001 ether;
    uint256 public constant MIN_INTERVAL = 5;

    uint256 public constant POINTS_PER_FREE_DEPLOY = 20;
    uint256 public constant POINTS_PER_PAID_DEPLOY = 40;
    /// @dev Each side earns this when a friend redeems your referral code (once per wallet).
    uint256 public constant POINTS_PER_REFERRAL = 200;
    uint256 public constant FREE_DEPLOY_PER_DAY = 1;
    uint256 public constant DEPLOY_FEE = 0.0001 ether;

    uint256 public constant FREE_BOOST_PER_DAY = 1;
    uint256 public constant BOOST_FEE = 0.0001 ether;
    uint256 public constant BOOST_DURATION = 1 hours;
    uint256 public constant BOOST_GM_MULTIPLIER = 2;

    /// @dev Minimum points balance required before any $A claim
    uint256 public constant AIRDROP_MIN_POINTS = 1000;
    /// @dev Whole $A tokens (18 decimals) received per this many points spent (1:1 when set to 1)
    uint256 public constant POINTS_PER_A_TOKEN = 1;

    uint256 public totalGms;
    uint256 public totalDeploys;
    uint256 public totalBoosts;
    address public owner;
    address public treasury;

    mapping(address => uint256) public lastGmAt;
    mapping(address => uint256) public lastGmDay;
    mapping(address => uint256) public freeGmsUsedToday;
    mapping(address => uint256) public gmCount;
    mapping(address => uint256) public deployCount;
    mapping(address => uint256) public lastDeployDay;
    mapping(address => uint256) public freeDeploysUsedToday;
    mapping(address => uint256) public points;
    mapping(address => address) public referredBy;
    mapping(address => uint256) public referralCount;

    mapping(bytes32 => address) public referralCodeOwner;
    mapping(address => bytes32) public userReferralCodeHash;
    mapping(address => bool) public hasRedeemedReferralCode;

    mapping(address => uint256) public boostActiveUntil;
    mapping(address => uint256) public lastBoostDay;
    mapping(address => uint256) public freeBoostsUsedToday;
    mapping(address => uint256) public boostCount;

    address public airdropToken;
    mapping(address => uint256) public airdropClaimed;

    event GM(
        address indexed user,
        uint256 gmCount,
        uint256 points,
        bool paid,
        bool boosted,
        uint256 timestamp
    );

    event BoostActivated(
        address indexed user,
        uint256 activeUntil,
        bool paid,
        uint256 timestamp
    );

    event TokenDeployed(
        address indexed user,
        address indexed token,
        string name,
        string symbol,
        uint256 initialSupply,
        bool paid,
        bool boosted,
        uint256 pointsEarned,
        uint256 totalPoints,
        uint256 timestamp
    );

    event ReferralCodeRegistered(address indexed owner, bytes32 indexed codeHash);

    event ReferralCodeRedeemed(
        address indexed referrer,
        address indexed referee,
        uint256 referrerPoints,
        uint256 refereePoints
    );

    event AirdropClaimed(
        address indexed user,
        uint256 pointsSpent,
        uint256 tokensReceived,
        uint256 pointsRemaining
    );

    error GmTooSoon(uint256 availableAt);
    error InvalidReferralCode();
    error ReferralCodeAlreadyRegistered();
    error ReferralCodeAlreadyRedeemed();
    error CannotRedeemOwnCode();
    error UnexpectedPayment();
    error IncorrectFee(uint256 required);
    error EmptyString();
    error ZeroSupply();
    error AirdropNotConfigured();
    error AirdropBelowMinimum(uint256 required, uint256 available);
    error AirdropInsufficientPoints(uint256 requested, uint256 available);
    error AirdropZeroClaim();

    constructor() {
        owner = msg.sender;
        treasury = msg.sender;
    }

    function setTreasury(address newTreasury) external {
        require(msg.sender == owner, "not owner");
        require(newTreasury != address(0), "zero treasury");
        treasury = newTreasury;
    }

    function setAirdropToken(address token) external {
        require(msg.sender == owner, "not owner");
        require(token != address(0), "zero token");
        airdropToken = token;
    }

    /// @notice Points → $A conversion for a given spend amount (18-decimal tokens)
    function previewAirdropTokens(uint256 pointsAmount) public pure returns (uint256) {
        return (pointsAmount * 1e18) / POINTS_PER_A_TOKEN;
    }

    /// @notice Burn Hub points and receive $A from the airdrop pool
    function claimAirdrop(uint256 pointsToSpend) external {
        if (airdropToken == address(0)) revert AirdropNotConfigured();
        if (pointsToSpend == 0) revert AirdropZeroClaim();

        uint256 available = points[msg.sender];
        if (available < AIRDROP_MIN_POINTS) {
            revert AirdropBelowMinimum(AIRDROP_MIN_POINTS, available);
        }
        if (pointsToSpend > available) {
            revert AirdropInsufficientPoints(pointsToSpend, available);
        }

        uint256 tokensOut = previewAirdropTokens(pointsToSpend);
        require(
            IERC20Minimal(airdropToken).balanceOf(address(this)) >= tokensOut,
            "pool empty"
        );

        points[msg.sender] = available - pointsToSpend;
        airdropClaimed[msg.sender] += tokensOut;

        require(IERC20Minimal(airdropToken).transfer(msg.sender, tokensOut), "transfer failed");

        emit AirdropClaimed(msg.sender, pointsToSpend, tokensOut, points[msg.sender]);
    }

    /// @notice Deterministic 6-character code for `user` (must match frontend `referralCodeFromAddress`).
    function referralCodeFor(address user) public pure returns (string memory) {
        bytes32 h = keccak256(abi.encodePacked("TBREF:v1", user));
        return _codeFromHash(h);
    }

    /// @notice One-time on-chain registration so friends can redeem your code.
    function registerReferralCode() external {
        if (userReferralCodeHash[msg.sender] != bytes32(0)) {
            revert ReferralCodeAlreadyRegistered();
        }

        string memory code = referralCodeFor(msg.sender);
        bytes32 h = keccak256(bytes(code));
        referralCodeOwner[h] = msg.sender;
        userReferralCodeHash[msg.sender] = h;

        emit ReferralCodeRegistered(msg.sender, h);
    }

    /// @notice Redeem a friend's code — both wallets receive POINTS_PER_REFERRAL (once per wallet).
    function redeemReferralCode(string calldata code) external {
        bytes32 h = keccak256(bytes(code));
        address referrer = referralCodeOwner[h];
        if (referrer == address(0)) revert InvalidReferralCode();
        if (referrer == msg.sender) revert CannotRedeemOwnCode();
        if (hasRedeemedReferralCode[msg.sender]) revert ReferralCodeAlreadyRedeemed();

        hasRedeemedReferralCode[msg.sender] = true;
        referredBy[msg.sender] = referrer;
        referralCount[referrer] += 1;
        points[referrer] += POINTS_PER_REFERRAL;
        points[msg.sender] += POINTS_PER_REFERRAL;

        emit ReferralCodeRedeemed(
            referrer,
            msg.sender,
            points[referrer],
            points[msg.sender]
        );
    }

    /// @notice Activate 2× GM & deploy points for BOOST_DURATION (1 free per day, then BOOST_FEE).
    ///         While boost is active, another boost extends the window instead of resetting it.
    function boost() external payable {
        uint256 day = _dayId();
        if (lastBoostDay[msg.sender] != day) {
            freeBoostsUsedToday[msg.sender] = 0;
        }
        lastBoostDay[msg.sender] = day;

        bool isFree = freeBoostsUsedToday[msg.sender] < FREE_BOOST_PER_DAY;
        if (isFree) {
            if (msg.value != 0) revert UnexpectedPayment();
            freeBoostsUsedToday[msg.sender] += 1;
        } else {
            if (msg.value != BOOST_FEE) revert IncorrectFee(BOOST_FEE);
            (bool sent, ) = treasury.call{value: msg.value}("");
            require(sent, "treasury transfer failed");
        }

        uint256 base = boostActiveUntil[msg.sender] > block.timestamp
            ? boostActiveUntil[msg.sender]
            : block.timestamp;
        uint256 until = base + BOOST_DURATION;
        boostActiveUntil[msg.sender] = until;
        boostCount[msg.sender] += 1;
        totalBoosts += 1;

        emit BoostActivated(msg.sender, until, !isFree, block.timestamp);
    }

    function boostActive(address user) external view returns (bool) {
        return boostActiveUntil[user] > block.timestamp;
    }

    function freeBoostAvailable(address user) external view returns (bool) {
        uint256 day = _dayId();
        uint256 used = lastBoostDay[user] == day ? freeBoostsUsedToday[user] : 0;
        return used < FREE_BOOST_PER_DAY;
    }

    function gm() external payable {
        _gm(msg.sender);
    }

    function gmTo(address recipient) external payable {
        require(recipient != address(0) && recipient != msg.sender, "invalid recipient");
        _gm(recipient);
    }

    function deployToken(
        string calldata name,
        string calldata symbol,
        uint256 initialSupply
    ) external payable returns (address token) {
        if (bytes(name).length == 0 || bytes(symbol).length == 0) {
            revert EmptyString();
        }
        if (initialSupply == 0) revert ZeroSupply();

        uint256 day = _dayId();
        if (lastDeployDay[msg.sender] != day) {
            freeDeploysUsedToday[msg.sender] = 0;
        }
        lastDeployDay[msg.sender] = day;

        bool isFree = freeDeploysUsedToday[msg.sender] < FREE_DEPLOY_PER_DAY;
        uint256 pointsEarned;

        if (isFree) {
            if (msg.value != 0) revert UnexpectedPayment();
            freeDeploysUsedToday[msg.sender] += 1;
            pointsEarned = POINTS_PER_FREE_DEPLOY;
        } else {
            if (msg.value != DEPLOY_FEE) revert IncorrectFee(DEPLOY_FEE);
            (bool sent, ) = treasury.call{value: msg.value}("");
            require(sent, "treasury transfer failed");
            pointsEarned = POINTS_PER_PAID_DEPLOY;
        }

        bool boosted = boostActiveUntil[msg.sender] > block.timestamp;
        if (boosted) {
            pointsEarned *= BOOST_GM_MULTIPLIER;
        }

        SimpleToken deployed = new SimpleToken(name, symbol, initialSupply, msg.sender);
        token = address(deployed);

        deployCount[msg.sender] += 1;
        totalDeploys += 1;
        points[msg.sender] += pointsEarned;

        emit TokenDeployed(
            msg.sender,
            token,
            name,
            symbol,
            initialSupply,
            !isFree,
            boosted,
            pointsEarned,
            points[msg.sender],
            block.timestamp
        );
    }

    function freeGmsRemaining(address user) external view returns (uint256) {
        uint256 day = _dayId();
        uint256 used = lastGmDay[user] == day ? freeGmsUsedToday[user] : 0;
        if (used >= FREE_GM_PER_DAY) return 0;
        return FREE_GM_PER_DAY - used;
    }

    function freeDeployAvailable(address user) external view returns (bool) {
        uint256 day = _dayId();
        uint256 used = lastDeployDay[user] == day ? freeDeploysUsedToday[user] : 0;
        return used < FREE_DEPLOY_PER_DAY;
    }

    function _dayId() internal view returns (uint256) {
        return block.timestamp / 1 days;
    }

    function _boostedPoints(uint256 base, address user) internal view returns (uint256) {
        if (boostActiveUntil[user] > block.timestamp) {
            return base * BOOST_GM_MULTIPLIER;
        }
        return base;
    }

    function _gm(address user) internal {
        uint256 day = _dayId();
        if (lastGmDay[user] != day) {
            freeGmsUsedToday[user] = 0;
        }
        lastGmDay[user] = day;

        uint256 last = lastGmAt[user];
        if (last != 0 && block.timestamp < last + MIN_INTERVAL) {
            revert GmTooSoon(last + MIN_INTERVAL);
        }

        bool isFree = freeGmsUsedToday[user] < FREE_GM_PER_DAY;
        if (isFree) {
            if (msg.value != 0) revert UnexpectedPayment();
            freeGmsUsedToday[user] += 1;
        } else {
            if (msg.value != GM_FEE) revert IncorrectFee(GM_FEE);
            (bool sent, ) = treasury.call{value: msg.value}("");
            require(sent, "treasury transfer failed");
        }

        uint256 pointsEarned = _boostedPoints(
            isFree ? POINTS_PER_FREE_GM : POINTS_PER_PAID_GM,
            user
        );
        bool boosted = boostActiveUntil[user] > block.timestamp;

        lastGmAt[user] = block.timestamp;
        gmCount[user] += 1;
        points[user] += pointsEarned;
        totalGms += 1;

        emit GM(user, gmCount[user], points[user], !isFree, boosted, block.timestamp);
    }

    function _codeFromHash(bytes32 h) internal pure returns (string memory) {
        bytes memory charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        bytes memory code = new bytes(6);
        uint256 v = uint256(h);
        for (uint256 i = 0; i < 6; i++) {
            code[i] = charset[v % 32];
            v /= 32;
        }
        return string(code);
    }
}
