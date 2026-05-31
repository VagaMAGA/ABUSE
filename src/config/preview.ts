import { isBadgeContractConfigured } from "@/config/badgeContract";
import { isContractConfigured } from "@/config/contract";

export function isHubLiveMode(opts: {
  isConnected: boolean;
  wrongChain: boolean;
}): boolean {
  return isContractConfigured && opts.isConnected && !opts.wrongChain;
}

export function isBadgeLiveMode(opts: {
  isConnected: boolean;
  wrongChain: boolean;
}): boolean {
  return isHubLiveMode(opts) && isBadgeContractConfigured;
}

export function isAirdropLiveMode(opts: {
  isConnected: boolean;
  wrongChain: boolean;
  airdropConfigured: boolean;
}): boolean {
  return isHubLiveMode(opts) && opts.airdropConfigured;
}

export function isStakingLiveMode(opts: {
  isConnected: boolean;
  wrongChain: boolean;
  stakingConfigured: boolean;
}): boolean {
  return isHubLiveMode(opts) && opts.stakingConfigured;
}
