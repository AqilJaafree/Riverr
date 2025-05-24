import { useState, useEffect } from 'react';
import { geckoTerminalService } from '@/services/gecko-terminal';
import { FormattedPoolData } from '@/types/gecko-terminal';

// Contract constants from the Riverr smart contract
const WBTC_SUI_POOL_1 = "0xe0c526aa27d1729931d0051a318d795ad0299998898e4287d9da1bf095b49658";
const WBTC_SUI_POOL_2 = "0x0fb4ad0e4c2c2b0a45d3f7bc5585cc9cea8486a63e4ef5cb768ddd9414fbb97a";
const SUI_POOL_3 = "0xd7d53e235c8a1db5e30bbde563053490db9b876ec8752b9053fee33ed845843b";
const SUI_POOL_4 = "0xe71aa89df60e737f1b687f8dfbd51e2a9b35706e9e5540ce9b053bd53fcb9ec3";

/**
 * A hook that fetches a recommended pool from GeckoTerminal based on portfolio style
 */
export function useGeckoPool(portfolioStyle: string | null) {
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
        
        // Map pool addresses to contract-specific addresses for accurate matching
        let recommendedPool: FormattedPoolData | null = null;
        
        if (pools.length > 0) {
          switch (portfolioStyle) {
            case "conservative":
              // For conservative, recommend the pool with highest TVL and lowest fee (0.10%)
              recommendedPool = pools.find(p => p.address.toLowerCase() === SUI_POOL_4.toLowerCase()) || 
                                pools.sort((a, b) => b.tvl - a.tvl)[0];
              break;
            case "moderate":
              // For moderate, recommend WBTC/SUI with 0.25% fee
              recommendedPool = pools.find(p => p.address.toLowerCase() === WBTC_SUI_POOL_2.toLowerCase()) || 
                                pools.sort((a, b) => b.volume24h - a.volume24h)[Math.floor(pools.length / 2)];
              break;
            case "aggressive":
              // For aggressive, recommend WBTC/SUI with 0.30% fee (higher risk/reward)
              recommendedPool = pools.find(p => p.address.toLowerCase() === WBTC_SUI_POOL_1.toLowerCase()) || 
                                pools.sort((a, b) => Math.abs(b.priceChange24h) - Math.abs(a.priceChange24h))[0];
              break;
            default:
              recommendedPool = pools[0];
          }
        }
        
        setPool(recommendedPool);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch recommended pool');
        console.error('Error fetching pool data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedPool();
  }, [portfolioStyle]);

  return {
    pool,
    loading,
    error
  };
}

/**
 * A hook that returns the appropriate pool address for the selected portfolio style
 */
export function getPoolAddressForStyle(portfolioStyle: string | null): string {
  switch(portfolioStyle) {
    case "conservative": 
      return SUI_POOL_4;
    case "moderate": 
      return WBTC_SUI_POOL_2;
    case "aggressive": 
      return WBTC_SUI_POOL_1;
    default: 
      return WBTC_SUI_POOL_1;
  }
}

export const POOL_ADDRESSES = {
  WBTC_SUI_POOL_1,
  WBTC_SUI_POOL_2,
  SUI_POOL_3,
  SUI_POOL_4
};