import { getAddress } from "viem";
import tokenAbi from "./abis/StakeFlowToken.json";
import vaultAbi from "./abis/StakeFlowVault.json";

// Use getAddress to ensure proper checksum formatting
export const STAKE_FLOW_TOKEN_ADDRESS = getAddress(
  "0x48bed473a2b23b4421De13e22fB0d4CE5C1D22cc"
);
export const STAKE_FLOW_VAULT_ADDRESS = getAddress(
  "0x6c468BB499269C87b9A1f0F610Bc3cD98EFa0135"
);

export const STAKEFLOW_TOKEN_ABI = tokenAbi.abi;
export const STAKEFLOW_VAULT_ABI = vaultAbi.abi;

export const CHAIN_ID = 11155111; // Sepolia
