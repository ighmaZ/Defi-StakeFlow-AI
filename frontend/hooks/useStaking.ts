import {
  STAKE_FLOW_VAULT_ADDRESS,
  STAKEFLOW_VAULT_ABI,
} from "@/config/contracts";
import { useAccount, useReadContract } from "wagmi";
import { StakerInfo } from "@/types";

export function useStaking() {
  const { address, isConnected } = useAccount();

  //fetch staked amount

  const {
    data: stakerInfo,
    isLoading: isLoadingStaking,
    error: stakingError,
    refetch: refetchStaking,
  } = useReadContract({
    address: STAKE_FLOW_VAULT_ADDRESS,
    abi: STAKEFLOW_VAULT_ABI,
    functionName: "getStakerInfo",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 10000,
      staleTime: 10000,
    },
  });

  const stakedInfo = stakerInfo as StakerInfo | undefined;
  const stakedAmount = stakedInfo?.stakedAmount || 0n;
  const stakedTimestamp = stakedInfo?.stakedTimestamp || 0;
  const pendingRewards = stakedInfo?.pendingRewardAmount || 0n;
  return {
    stakedAmount,
    stakedTimestamp,
    pendingRewards,
    isLoading: isLoadingStaking,
    refetchStaking,
    error: stakingError,
  };
}
