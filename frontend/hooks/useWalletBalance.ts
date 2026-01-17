import {
  STAKE_FLOW_TOKEN_ADDRESS,
  STAKEFLOW_TOKEN_ABI,
  CHAIN_ID,
} from "@/config/contracts";
import { useAccount, useReadContract } from "wagmi";

export function useWalletBalance() {
  const { address, isConnected } = useAccount();

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
    chainId: CHAIN_ID,
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
