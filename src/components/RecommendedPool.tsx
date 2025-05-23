"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { geckoTerminalService } from "@/services/gecko-terminal";
import { FormattedPoolData } from "@/types/gecko-terminal";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { ConnectButton } from "@suiet/wallet-kit";

interface RecommendedPoolProps {
  portfolioStyle: string | null;
}

const RecommendedPool: React.FC<RecommendedPoolProps> = ({ portfolioStyle }) => {
  const [pool, setPool] = useState<FormattedPoolData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
              recommendedPool = pools.sort((a, b) => b.volume24h - a.volume24h)[Math.floor(pools.length / 2)];
              break;
            case "aggressive":
              // For aggressive, choose the pool with highest price change (volatility)
              recommendedPool = pools.sort((a, b) => Math.abs(b.priceChange24h) - Math.abs(a.priceChange24h))[0];
              break;
            default:
              recommendedPool = pools[0];
          }
        }
        
        setPool(recommendedPool);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch recommended pool');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedPool();
  }, [portfolioStyle]);

  if (!portfolioStyle) {
    return null;
  }

  if (loading) {
    return (
      <Card className="bg-primary border-primary/30 mt-4">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin h-8 w-8" />
          <span className="ml-2">Finding the best pool for your {portfolioStyle} strategy...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-primary border-primary/30 mt-4">
        <CardContent className="py-6">
          <p className="text-red-400">Error loading recommended pool: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!pool) {
    return (
      <Card className="bg-primary border-primary/30 mt-4">
        <CardContent className="py-6">
          <p>No pools available for your selected strategy. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  const priceChangeClass = pool.priceChange24h >= 0 ? "text-green-400" : "text-red-400";

  return (
    <Card className="button-gradient border-primary/30 mt-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>Recommended {portfolioStyle.charAt(0).toUpperCase() + portfolioStyle.slice(1)} Pool</span>
          </div>
          <span className={`text-sm ${priceChangeClass}`}>
            {pool.priceChange24h >= 0 ? '+' : ''}{pool.priceChange24h.toFixed(2)}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">{pool.name}</h3>
          
          {pool.tokens.base && pool.tokens.quote && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {pool.tokens.base.attributes.image_url ? (
                  <Image 
                    src={pool.tokens.base.attributes.image_url} 
                    alt={pool.tokens.base.attributes.symbol}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
                )}
                <span>{pool.tokens.base.attributes.symbol}</span>
              </div>
              <span>/</span>
              <div className="flex items-center gap-1">
                {pool.tokens.quote.attributes.image_url ? (
                  <Image 
                    src={pool.tokens.quote.attributes.image_url} 
                    alt={pool.tokens.quote.attributes.symbol}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
                )}
                <span>{pool.tokens.quote.attributes.symbol}</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sub-text text-sm">TVL</p>
            <p className="font-semibold">${pool.tvl.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sub-text text-sm">24h Volume</p>
            <p className="font-semibold">${pool.volume24h.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sub-text text-sm">24h Buys</p>
            <p className="font-semibold">{pool.transactions24h.buys}</p>
          </div>
          <div>
            <p className="text-sub-text text-sm">24h Sells</p>
            <p className="font-semibold">{pool.transactions24h.sells}</p>
          </div>
        </div>

        {portfolioStyle === "conservative" && (
          <p className="text-sm mb-4 text-sub-text">
            This pool has high liquidity and stability, making it ideal for a conservative strategy.
          </p>
        )}
        
        {portfolioStyle === "moderate" && (
          <p className="text-sm mb-4 text-sub-text">
            This pool balances good trading volume with reasonable stability, perfect for a moderate risk approach.
          </p>
        )}
        
        {portfolioStyle === "aggressive" && (
          <p className="text-sm mb-4 text-sub-text">
            This pool has high volatility and potential for greater returns, suitable for an aggressive strategy.
          </p>
        )}

        <div className="w-full">
          <div className="[&_.wkit-button]:!w-full [&_.wkit-connected-button]:!w-full">
            <ConnectButton />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedPool;