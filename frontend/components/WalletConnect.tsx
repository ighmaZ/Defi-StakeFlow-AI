"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Badge } from "@/components/ui/badge";
export function WalletConnect() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");
        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Connect Wallet
                  </button>
                );
              }
              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Wrong network
                  </button>
                );
              }
              return (
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    {chain.name}
                  </Badge>
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    {chain.hasIcon && (
                      <div className="h-4 w-4">
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            className="h-4 w-4"
                          />
                        )}
                      </div>
                    )}
                  </button>
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    {account.displayName}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
