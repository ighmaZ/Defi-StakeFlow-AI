"use client";

import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BadgeProps } from "@/components/ui/badge";
import { Activity, Percent, Shield, Zap } from "lucide-react";

export function TokenStats() {
  const { isConnected, chain } = useAccount();

  const stats: Array<{
    label: string;
    value: string;
    icon: typeof Activity;
    color: string;
    badge?: string;
    badgeVariant?: BadgeProps["variant"];
    description?: string;
  }> = [
    {
      label: "Network",
      value: chain?.name || "Not Connected",
      icon: Activity,
      color: isConnected ? "text-green-500" : "text-yellow-500",
      badge: isConnected ? "Connected" : "Disconnected",
      badgeVariant: isConnected ? "default" : "outline",
    },
    {
      label: "Reward Rate",
      value: "10%",
      icon: Percent,
      color: "text-blue-500",
      description: "Annual Percentage Yield",
    },
    {
      label: "Token",
      value: "SFT",
      icon: Shield,
      color: "text-purple-500",
      description: "StakeFlow Token",
    },
    {
      label: "Status",
      value: "Active",
      icon: Zap,
      color: "text-emerald-500",
      description: "Staking Pool",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="relative overflow-hidden">
            <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-2xl" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <Icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stat.value}</span>
                {stat.badge && (
                  <Badge variant={stat.badgeVariant}>{stat.badge}</Badge>
                )}
              </div>
              {stat.description && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
