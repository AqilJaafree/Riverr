/* eslint-disable @next/next/no-img-element */
// src/components/pools/PoolList.tsx - Example usage component
import React from 'react';
import { usePools } from '@/hooks/use-pools';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function PoolList() {
  const { pools, loading, error } = usePools();

  if (loading) {
    return <div className="text-center py-8">Loading pools...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-400">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">BTC Liquidity Pools</h2>
      <div className="grid gap-4">
        {pools.map((pool) => (
          <Card key={pool.id} className="bg-background">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{pool.name}</span>
                <span className={`text-sm ${
                  pool.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {pool.priceChange24h >= 0 ? '+' : ''}{pool.priceChange24h.toFixed(2)}%
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">TVL</p>
                  <p className="font-semibold">${pool.tvl.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">24h Volume</p>
                  <p className="font-semibold">${pool.volume24h.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">24h Buys</p>
                  <p className="font-semibold">{pool.transactions24h.buys}</p>
                </div>
                <div>
                  <p className="text-gray-400">24h Sells</p>
                  <p className="font-semibold">{pool.transactions24h.sells}</p>
                </div>
              </div>
              {pool.tokens.base && pool.tokens.quote && (
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {pool.tokens.base.attributes.image_url && (
                      <img 
                        src={pool.tokens.base.attributes.image_url} 
                        alt={pool.tokens.base.attributes.symbol}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span>{pool.tokens.base.attributes.symbol}</span>
                  </div>
                  <span>/</span>
                  <div className="flex items-center gap-2">
                    {pool.tokens.quote.attributes.image_url && (
                      <img 
                        src={pool.tokens.quote.attributes.image_url} 
                        alt={pool.tokens.quote.attributes.symbol}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span>{pool.tokens.quote.attributes.symbol}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}