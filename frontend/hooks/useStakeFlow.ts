import {
  STAKE_FLOW_TOKEN_ADDRESS,
  STAKE_FLOW_VAULT_ADDRESS,
  STAKEFLOW_TOKEN_ABI,
  STAKEFLOW_VAULT_ABI,
} from "@/config/contracts";
import { toast } from "sonner";
import { StakerInfo } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useConnection, useReadContract, useWriteContract } from "wagmi";

export function useStakeFlow() {
  const { address, isConnected } = useConnection();

  const queryClient = useQueryClient();

  // wallet balance
  const { data: balance, isLoading: isLoadingBalance } = useReadContract({
    address: STAKE_FLOW_TOKEN_ADDRESS,
    abi: STAKEFLOW_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
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
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 10000,
    },
  });
  const stakedInfo = stakerInfo as StakerInfo | undefined;
  const stakedAmount = stakedInfo?.stakedAmount || 0n;
  const pendingRewards = stakedInfo?.pendingRewardAmount || 0n;

  //check allowance (how much vault can spend)
  const { data: allowance } = useReadContract({
    address: STAKE_FLOW_TOKEN_ADDRESS,
    abi: STAKEFLOW_TOKEN_ABI,
    functionName: "allowance",
    args: address ? [address, STAKE_FLOW_VAULT_ADDRESS] : undefined,
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
  queryClient.invalidateQueries({ queryKey: ["balanceOf"] });
  queryClient.invalidateQueries({ queryKey: ["getStakerInfo"] });

  // Unstake tokens
  const unstake = (amount: bigint) => {
    writeContract({
      address: STAKE_FLOW_VAULT_ADDRESS,
      abi: STAKEFLOW_VAULT_ABI,
      functionName: "unstake",
      args: [amount],
    });

    queryClient.invalidateQueries({ queryKey: ["getStakerInfo"] });
  };

  // Claim rewards
  const claimRewards = () => {
    writeContract({
      address: STAKE_FLOW_VAULT_ADDRESS,
      abi: STAKEFLOW_VAULT_ABI,
      functionName: "claimRewards",
      args: [],
    });

    queryClient.invalidateQueries({ queryKey: ["balanceOf"] });
    queryClient.invalidateQueries({ queryKey: ["getStakerInfo"] });
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
