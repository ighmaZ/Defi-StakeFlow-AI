import "./globals.css";
import { Providers } from "./providers";
import type { ReactNode } from "react";

export const metadata = {
  title: "DeFi StakeFlow AI",
  description: "AI-Powered DeFi Staking Platform",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
