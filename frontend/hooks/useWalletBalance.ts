import {
  STAKE_FLOW_TOKEN_ADDRESS,
  STAKEFLOW_TOKEN_ABI,
} from "@/config/contracts";
import { useConnection, useReadContract } from "wagmi";

export function useWalletBalance() {
  const { address, isConnected } = useConnection();

  const {
    data: balance,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: STAKE_FLOW_TOKEN_ADDRESS,
    abi: STAKEFLOW_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 15000,
      staleTime: 10000,
    },
  });

  return {
    balance: balance || 0n,
    isLoading,
    error,
    refetch,
    isConnected,
  };
}
