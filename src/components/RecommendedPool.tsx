"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { geckoTerminalService } from "@/services/gecko-terminal";
import { FormattedPoolData } from "@/types/gecko-terminal";
import { Loader2 } from "lucide-react";
import { ConnectButton, useWallet } from "@suiet/wallet-kit";
import { ArrowSquareInIcon, CheckIcon, PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import AddLiquidityDialog from "./AddLiquidityDialog";

interface RecommendedPoolProps {
  portfolioStyle: string | null;
}

const RecommendedPool: React.FC<RecommendedPoolProps> = ({
  portfolioStyle,
}) => {
  const [pool, setPool] = useState<FormattedPoolData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For estimated earnings calculation
  const [investmentAmount] = useState(10000); // Default $10,000 investment
  const [estimatedDailyEarnings, setEstimatedDailyEarnings] = useState(0);

  // Get wallet connection state
  const { connected } = useWallet();

  // State for liquidity dialog
  const [isAddLiquidityDialogOpen, setIsAddLiquidityDialogOpen] =
    useState(false);

  useEffect(() => {
    const fetchRecommendedPool = async () => {
      if (!portfolioStyle) return;

      setLoading(true);
      setError(null);

      try {
        const pools = await geckoTerminalService.getFormattedSuiPools();

        // Select pool based on portfolio style
        let recommendedPool: FormattedPoolData | null = null;

        if (pools.length > 0) {
          switch (portfolioStyle) {
            case "conservative":
              // For conservative, choose the pool with highest TVL (most liquidity)
              recommendedPool = pools.sort((a, b) => b.tvl - a.tvl)[0];
              break;
            case "moderate":
              // For moderate, choose a mid-range pool with good volume
              recommendedPool = pools.sort((a, b) => b.volume24h - a.volume24h)[
                Math.floor(pools.length / 2)
              ];
              break;
            case "aggressive":
              // For aggressive, choose the pool with highest price change (volatility)
              recommendedPool = pools.sort(
                (a, b) =>
                  Math.abs(b.priceChange24h) - Math.abs(a.priceChange24h)
              )[0];
              break;
            default:
              recommendedPool = pools[0];
          }
        }

        setPool(recommendedPool);

        // Calculate estimated daily earnings (simplified example)
        if (recommendedPool) {
          // Using volume as a proxy for fee generation
          // Assuming 0.3% fee and that 10% of volume contributes to LP earnings
          const dailyFees = recommendedPool.volume24h * 0.003;
          const dailyEarningsRate = dailyFees / recommendedPool.tvl;
          const estimatedEarnings = investmentAmount * dailyEarningsRate;
          setEstimatedDailyEarnings(estimatedEarnings);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch recommended pool"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedPool();
  }, [portfolioStyle, investmentAmount]);

  if (!portfolioStyle) {
    return null;
  }

  if (loading) {
    return (
      <Card className="bg-primary border-primary/30 mt-4">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin h-8 w-8" />
          <span className="ml-2">
            Finding the best pool for your {portfolioStyle} strategy...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-primary border-primary/30 mt-4">
        <CardContent className="py-6">
          <p className="text-red-400">
            Error loading recommended pool: {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!pool) {
    return (
      <Card className="bg-primary border-primary/30 mt-4">
        <CardContent className="py-6">
          <p>
            No pools available for your selected strategy. Please try again
            later.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get reasons based on portfolio style
  const getWhyThisPool = () => {
    // Base reasons for all styles
    const reasons = [
      `Revenue maximizer — ${(pool.priceChange24h / 100).toFixed(
        2
      )}% annualized yield outperforms most alternatives in the ecosystem.`,
      `Active trading — $${pool.volume24h.toLocaleString()} daily volume indicates strong market participation and ease of exit.`,
      `Consistent revenue — $${(pool.volume24h * 0.003).toFixed(
        2
      )} collected in fees yesterday demonstrates real earning potential.`,
      `Sustainable activity — trading frequency supports reliable returns without excessive volatility.`,
    ];

    // Style-specific reason
    if (portfolioStyle === "conservative") {
      reasons.push(
        `Capital preservation focus — lower volatility profile aligns with your safety-first approach.`
      );
    } else if (portfolioStyle === "moderate") {
      reasons.push(
        `Growth with guardrails — this pool balances upside potential with downside protection.`
      );
    } else {
      reasons.push(
        `Opportunistic positioning — designed for investors seeking maximum capital appreciation.`
      );
    }

    return reasons;
  };

  // Get risk considerations
  const getRisks = () => {
    return [
      `Market dynamics vary — future performance may differ from historical data as trading conditions evolve.`,
      `Impermanent loss risk — higher returns come with increased exposure to impermanent loss during market swings.`,
      `Protocol considerations — while thoroughly audited, all DeFi interactions carry inherent smart contract risk.`,
      `Amplified movements — this pool may experience larger price fluctuations during market volatility.`,
    ];
  };

  // Handle add liquidity action
  const handleAddLiquidity = () => {
    setIsAddLiquidityDialogOpen(true);
  };

  // Handle portfolio style selection
  const handleSelectPortfolioStyle = (style: string) => {
    // Any additional logic needed when style is selected
    console.log(`Selected style: ${style}`);
  };

  return (
    <div className="space-y-2">
      <div className="bg-background p-4 rounded-lg border">
        <div className="flex lg:flex-row flex-col items-center justify-between">
          <h3 className="text-lg font-semibold mb-2">
            {portfolioStyle === "aggressive" ? "wBTC-SUI" : "wBTC-SUI"}
          </h3>
          <div className="flex lg:flex-row flex-col items-center gap-2">
            <div className="bg-[#0c3a4b] text-[#1BE3C2] px-4 py-1 rounded-full text-sm flex items-center gap-1 lg:w-fit w-full">
              <span className="flex items-center gap-1">
                Audited <ArrowSquareInIcon size={16} />
              </span>
            </div>
            <div className="bg-[#363032]  px-4 py-1 rounded-full text-sm lg:w-fit w-full">
              Impermanent Loss Risk:{" "}
              <span className="text-[#EFB54B] font-bold">Moderate</span>
            </div>
          </div>
        </div>

        <div className="flex lg:flex-row flex-col lg:items-center justify-between mt-4 lg:gap-0 gap-4">
          <div className="flex flex-col items-start gap-1">
            <h2 className="lg:text-4xl text-2xl  font-bold text-primary">3.42%</h2>
            <span className="text-white text-sm">Pool APY</span>
          </div>
          <div className="flex flex-wrap items-center lg:gap-6 gap-4 mb-2">
              <div>
                <p className="text-white text-sm">Total Value Locked</p>
                <p className="font-semibold">${pool.tvl.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-white text-sm">Trading Volume</p>
                <p className="font-semibold">
                  ${pool.volume24h.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-white text-sm">24h Fee</p>
                <p className="font-semibold">
                  ${(pool.volume24h * 0.003).toFixed(2)}
                </p>
              </div>
            </div>
        </div>

        <div className="w-full">
          {connected ? (
            <Button
              variant="default"
              size="default"
              onClick={handleAddLiquidity}
              className="px-4 py-2 bg-primary text-white rounded-full font-medium w-full mt-6"
            >
              <PlusIcon className="mr-2" size={16} />
              Add Liquidity
            </Button>
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>
  
      {/* Estimated Earnings Card */}
      <div className="bg-white rounded-lg p-4 w-fit mt-4">
        <div className="text-background font-bold mb-2">
          Your Estimated Earnings:
        </div>
        <div className="text-primary">
          <div className="flex items-end gap-1 text-3xl mb-2 font-bold">
            ${estimatedDailyEarnings.toFixed(2)}{" "}
            <span className="text-base font-normal">Daily Earnings</span>
          </div>
          <div className="text-background">
            Amount Invest: ${investmentAmount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Why This Pool Card */}
      <div className="bg-primary/50 p-4 mt-4 rounded-lg">
        <div className="font-bold mb-2 text-white">Why this pool?</div>
        <div className="space-y-2">
          {getWhyThisPool().map((reason, index) => (
            <div key={index} className="flex items-start gap-2">
              <CheckIcon
                className="text-primary mt-1 flex-shrink-0"
                size={20}
              />
              <span className="text-white">{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Before You Dive In Card */}

      <div className="font-bold mb-2 mt-4 ">Before You Dive In:</div>
      <ul className="list-disc list-inside space-y-1">
        {getRisks().map((risk, index) => (
          <li key={index}>{risk}</li>
        ))}
      </ul>

      {/* Add Liquidity Dialog */}
      <AddLiquidityDialog
        isOpen={isAddLiquidityDialogOpen}
        onClose={() => setIsAddLiquidityDialogOpen(false)}
        portfolioStyle={portfolioStyle}
        onSelectStyle={handleSelectPortfolioStyle}
      />
    </div>
  );
};

export default RecommendedPool;
