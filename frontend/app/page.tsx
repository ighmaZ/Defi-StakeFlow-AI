"use client";

import { WalletConnect } from "@/components/WalletConnect";
import { StakingDashboard } from "@/components/StakingDashboard";
import { TokenStats } from "@/components/TokenStats";
import { AIAssistant } from "@/components/AIAssistant";
import { Coins } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-blue-950/20" />
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
              <Coins className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">StakeFlow</h1>
              <p className="text-xs text-muted-foreground">AI-Powered DeFi</p>
            </div>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h2 className="mb-4 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
            Stake, Earn, Grow
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Stake your SFT tokens and earn{" "}
            <span className="font-semibold text-blue-400">10% APY</span> rewards.
            Powered by AI insights for smarter DeFi decisions.
          </p>
        </section>

        {/* Token Stats */}
        <section className="mb-8">
          <TokenStats />
        </section>

        {/* Staking Dashboard */}
        <section>
          <StakingDashboard />
        </section>
      </main>

      {/* AI Assistant (Floating) */}
      <AIAssistant />

      {/* Footer */}
      <footer className="mt-auto border-t border-border/40 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2026 StakeFlow AI. Built on Sepolia Testnet.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/ighmaZ/Defi-StakeFlow-AI"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                GitHub
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Documentation
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
