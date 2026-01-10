import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Format token amount - convert wei to ether
export function formatTokenAmount(
  amount: bigint,
  decimals: number = 18
): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;

  if (fraction === 0n) {
    return whole.toString();
  }

  return `${whole}.${fraction
    .toString()
    .padStart(decimals, "0")
    .replace(/0+$/, "")}`;
}
// Shorter version for display
export function formatTokenAmountShort(amount: bigint): string {
  const formatted = formatTokenAmount(amount);
  const number = parseFloat(formatted);

  if (number >= 1000000) return `${(number / 1000000).toFixed(2)}M`;
  if (number >= 1000) return `${(number / 1000).toFixed(2)}K`;

  return formatted;
}
// Format date
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
export function calculateAPY(rewardRate: bigint): string {
  // REWARD_RATE = 1000 means 10% (1000/10000)
  return `${(Number(rewardRate) / 100).toFixed(1)}%`;
}
// Parse input string to bigint
export function parseTokenAmount(input: string): bigint {
  if (!input) return 0n;
  const cleaned = input.replace(/[^0-9.]/g, "");
  if (!cleaned) return 0n;

  const parts = cleaned.split(".");
  const whole = BigInt(parts[0] || "0");
  const fraction = parts[1] || "";

  return (
    whole * BigInt(10 ** 18) + BigInt(fraction.padEnd(18, "0").slice(0, 18))
  );
}
