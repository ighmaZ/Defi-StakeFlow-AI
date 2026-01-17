"use client";

import "@rainbow-me/rainbowkit/styles.css";

import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sepolia } from "wagmi/chains";
import { WagmiProvider, type Config } from "wagmi";
import { Toaster } from "sonner";
import { useState, useEffect, type ReactNode } from "react";

// Create config lazily to avoid SSR issues with indexedDB
let config: Config | null = null;

function getConfig() {
  if (!config) {
    config = getDefaultConfig({
      appName: "DeFi StakeFlow AI",
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
      chains: [sepolia],
      ssr: false, // Disable SSR for wagmi
    });
  }
  return config;
}

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 30000,
            retry: 3,
          },
        },
      })
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything that uses wagmi hooks until client-side
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const wagmiConfig = getConfig();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#3b82f6",
            accentColorForeground: "white",
            borderRadius: "large",
          })}
          modalSize="compact"
          initialChain={sepolia}
        >
          {children}
          <Toaster position="bottom-right" richColors />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
