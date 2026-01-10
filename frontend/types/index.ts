export interface StakeInfo {
  readonly amount: bigint;
  readonly timestamp: number;
  readonly rewardIndex: bigint;
}

export interface StakerInfo {
  stakedAmount: bigint;
  stakedTimestamp: number;
  pendingRewardAmount: bigint;
}

export type TransactionType = "stake" | "unstake" | "claim";

export interface Transaction {
  readonly type: TransactionType;
  readonly amount: bigint;
  readonly hash: string;
}

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface StakeFormState {
  amount: string;
  isStaking: boolean;
}

export interface UnstakeFormState {
  amount: string;
  isUnstaking: boolean;
}
