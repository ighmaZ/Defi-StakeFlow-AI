"use client";

import { useState } from "react";
import { useStakeFlow } from "@/hooks/useStakeFlow";
import { formatTokenAmount, parseTokenAmount } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/loading";
import { Coins, ArrowUpCircle, ArrowDownCircle, Gift } from "lucide-react";

export function StakingDashboard() {
  const {
    balance,
    stakedAmount,
    pendingRewards,
    allowance,
    isLoading,
    approve,
    stake,
    unstake,
    claimRewards,
    isWritePending,
    isConnected,
  } = useStakeFlow();

  const [stakeInput, setStakeInput] = useState("");
  const [unstakeInput, setUnstakeInput] = useState("");
  const [activeTab, setActiveTab] = useState<"stake" | "unstake">("stake");

  const stakeAmount = parseTokenAmount(stakeInput);
  const unstakeAmount = parseTokenAmount(unstakeInput);

  const needsApproval = stakeAmount > 0 && (allowance as bigint) < stakeAmount;

  const handleStake = () => {
    if (needsApproval) {
      approve(stakeAmount);
    } else {
      stake(stakeAmount);
      setStakeInput("");
    }
  };

  const handleUnstake = () => {
    unstake(unstakeAmount);
    setUnstakeInput("");
  };

  const handleClaimRewards = () => {
    claimRewards();
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-blue-500/10 p-4">
            <Coins className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-foreground">
            Connect Your Wallet
          </h3>
          <p className="text-muted-foreground">
            Connect your wallet to start staking and earning rewards.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 w-full max-w-4xl mx-auto md:grid-cols-2">
      {/* Stats Cards */}
      <Card gradient>
        <CardHeader>
          <CardDescription>Available Balance</CardDescription>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-blue-500" />
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <span className="text-2xl font-bold">
                {formatTokenAmount(balance as bigint)} SFT
              </span>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card gradient>
        <CardHeader>
          <CardDescription>Currently Staked</CardDescription>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpCircle className="h-6 w-6 text-green-500" />
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <span className="text-2xl font-bold">
                {formatTokenAmount(stakedAmount as bigint)} SFT
              </span>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Pending Rewards Card */}
      <Card className="md:col-span-2 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardDescription>Pending Rewards</CardDescription>
              <CardTitle className="flex items-center gap-2 mt-1">
                <Gift className="h-6 w-6 text-purple-500" />
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <span className="text-2xl font-bold text-purple-400">
                    {formatTokenAmount(pendingRewards as bigint)} SFT
                  </span>
                )}
              </CardTitle>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleClaimRewards}
              disabled={isWritePending || pendingRewards === 0n}
              isLoading={isWritePending}
            >
              Claim Rewards
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Staking Form */}
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("stake")}
              className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
                activeTab === "stake"
                  ? "bg-blue-500 text-white"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              <ArrowUpCircle className="mr-2 inline h-4 w-4" />
              Stake
            </button>
            <button
              onClick={() => setActiveTab("unstake")}
              className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
                activeTab === "unstake"
                  ? "bg-orange-500 text-white"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              <ArrowDownCircle className="mr-2 inline h-4 w-4" />
              Unstake
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === "stake" ? (
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="0.0"
                value={stakeInput}
                onChange={(e) => setStakeInput(e.target.value)}
                suffix="SFT"
                onMax={() => setStakeInput(formatTokenAmount(balance as bigint))}
                label="Amount to stake"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Available:</span>
                <span>{formatTokenAmount(balance as bigint)} SFT</span>
              </div>
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleStake}
                disabled={isWritePending || stakeAmount === 0n || stakeAmount > (balance as bigint)}
                isLoading={isWritePending}
              >
                {needsApproval ? "Approve SFT" : "Stake SFT"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="0.0"
                value={unstakeInput}
                onChange={(e) => setUnstakeInput(e.target.value)}
                suffix="SFT"
                onMax={() => setUnstakeInput(formatTokenAmount(stakedAmount as bigint))}
                label="Amount to unstake"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Staked:</span>
                <span>{formatTokenAmount(stakedAmount as bigint)} SFT</span>
              </div>
              <Button
                variant="destructive"
                size="lg"
                className="w-full"
                onClick={handleUnstake}
                disabled={isWritePending || unstakeAmount === 0n || unstakeAmount > (stakedAmount as bigint)}
                isLoading={isWritePending}
              >
                Unstake SFT
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
