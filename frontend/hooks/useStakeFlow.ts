import {
  STAKE_FLOW_TOKEN_ADDRESS,
  STAKE_FLOW_VAULT_ADDRESS,
  STAKEFLOW_TOKEN_ABI,
  STAKEFLOW_VAULT_ABI,
  CHAIN_ID,
} from "@/config/contracts";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount, useReadContract, useWriteContract } from "wagmi";

export function useStakeFlow() {
  const { address, isConnected } = useAccount();

  const queryClient = useQueryClient();

  // wallet balance
  const { data: balance, isLoading: isLoadingBalance } = useReadContract({
    address: STAKE_FLOW_TOKEN_ADDRESS,
    abi: STAKEFLOW_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: CHAIN_ID,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 15000,
    },
  });

  // Staked amount
  const { data: stakerInfo, isLoading: isLoadingStaking } = useReadContract({
    address: STAKE_FLOW_VAULT_ADDRESS,
    abi: STAKEFLOW_VAULT_ABI,
    functionName: "getStakerInfo",
    args: address ? [address] : undefined,
    chainId: CHAIN_ID,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 10000,
    },
  });
  // getStakerInfo returns: [stakedAmount, stakedTimestamp, pendingRewardAmount]
  const stakerInfoArray = stakerInfo as readonly [bigint, bigint, bigint] | undefined;
  const stakedAmount = stakerInfoArray?.[0] || 0n;
  const pendingRewards = stakerInfoArray?.[2] || 0n;

  //check allowance (how much vault can spend)
  const { data: allowance } = useReadContract({
    address: STAKE_FLOW_TOKEN_ADDRESS,
    abi: STAKEFLOW_TOKEN_ABI,
    functionName: "allowance",
    args: address ? [address, STAKE_FLOW_VAULT_ADDRESS] : undefined,
    chainId: CHAIN_ID,
    query: {
      enabled: !!address && isConnected,
    },
  });

  const { writeContract, isPending: isWritePending } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        toast.success("transaction submitted", {
          description: `Hash: ${hash.slice(0, 10)}...`,
        });
        queryClient.invalidateQueries({ queryKey: ["balanceOf"] });
        queryClient.invalidateQueries({ queryKey: ["getStakerInfo"] });
      },
      onError: (error) => {
        toast.error("transaction failed", {
          description: error.message,
        });
      },
    },
  });

  //Approve vault to spend tokens
  const approve = (amount: bigint) => {
    writeContract({
      address: STAKE_FLOW_TOKEN_ADDRESS,
      abi: STAKEFLOW_TOKEN_ABI,
      functionName: "approve",
      args: [STAKE_FLOW_VAULT_ADDRESS, amount],
    });
  };

  //Stake tokens
  const stake = (amount: bigint) => {
    writeContract({
      address: STAKE_FLOW_VAULT_ADDRESS,
      abi: STAKEFLOW_VAULT_ABI,
      functionName: "stake",
      args: [amount],
    });
  };

  // Unstake tokens
  const unstake = (amount: bigint) => {
    writeContract({
      address: STAKE_FLOW_VAULT_ADDRESS,
      abi: STAKEFLOW_VAULT_ABI,
      functionName: "unstake",
      args: [amount],
    });
  };

  // Claim rewards
  const claimRewards = () => {
    writeContract({
      address: STAKE_FLOW_VAULT_ADDRESS,
      abi: STAKEFLOW_VAULT_ABI,
      functionName: "claimRewards",
      args: [],
    });
  };

  return {
    // Data
    balance: balance || 0n,
    stakedAmount,
    pendingRewards,
    allowance: allowance || 0n,
    isLoading: isLoadingBalance || isLoadingStaking,

    // Actions
    approve,
    stake,
    unstake,
    claimRewards,
    isWritePending,

    // Status
    isConnected,
    address,
  };
}
