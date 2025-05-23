// src/services/gecko-terminal.ts
const BASE_URL = 'https://api.geckoterminal.com/api/v2';

// Pool addresses constants
const POOL_ADDRESSES = {
  WBTC_SUI_POOL_1: '0xe0c526aa27d1729931d0051a318d795ad0299998898e4287d9da1bf095b49658',
  WBTC_SUI_POOL_2: '0x0fb4ad0e4c2c2b0a45d3f7bc5585cc9cea8486a63e4ef5cb768ddd9414fbb97a',
  SUI_POOL_3: '0xd7d53e235c8a1db5e30bbde563053490db9b876ec8752b9053fee33ed845843b',
  SUI_POOL_4: '0xe71aa89df60e737f1b687f8dfbd51e2a9b35706e9e5540ce9b053bd53fcb9ec3'
} as const;

export interface PoolInfo {
  id: string;
  type: string;
  attributes: {
    base_token_price_usd: string;
    base_token_price_native_currency: string;
    quote_token_price_usd: string;
    quote_token_price_native_currency: string;
    base_token_price_quote_token: string;
    quote_token_price_base_token: string;
    address: string;
    name: string;
    pool_created_at: string | null;
    fdv_usd: string;
    market_cap_usd: string | null;
    price_change_percentage: {
      h1: string;
      h24: string;
    };
    transactions: {
      h1: {
        buys: number;
        sells: number;
        buyers: number;
        sellers: number;
      };
      h24: {
        buys: number;
        sells: number;
        buyers: number;
        sellers: number;
      };
    };
    volume_usd: {
      h1: string;
      h24: string;
    };
    reserve_in_usd: string;
  };
  relationships: {
    base_token: {
      data: {
        id: string;
        type: string;
      };
    };
    quote_token: {
      data: {
        id: string;
        type: string;
      };
    };
    dex: {
      data: {
        id: string;
        type: string;
      };
    };
  };
}

export interface TokenInfo {
  id: string;
  type: string;
  attributes: {
    address: string;
    name: string;
    symbol: string;
    image_url: string;
    coingecko_coin_id: string | null;
    decimals: number;
    total_supply: string | null;
  };
}

export interface PoolsResponse {
  data: PoolInfo[];
  included?: TokenInfo[];
}

export interface NetworksResponse {
  data: Array<{
    id: string;
    type: string;
    attributes: {
      name: string;
      identifier: string;
      chain_identifier: string;
      coingecko_asset_platform_id: string | null;
    };
  }>;
}

export interface TrendingPoolsResponse {
  data: PoolInfo[];
  included?: TokenInfo[];
}

class GeckoTerminalService {
  private baseUrl = BASE_URL;

  private async fetchApi<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('GeckoTerminal API error:', error);
      throw error;
    }
  }

  // Get specific pool information
  async getPool(networkId: string, poolAddress: string): Promise<PoolsResponse> {
    return this.fetchApi<PoolsResponse>(`/networks/${networkId}/pools/${poolAddress}`);
  }

  // Get multiple pools information
  async getPools(networkId: string, poolAddresses: string[]): Promise<PoolsResponse> {
    const addresses = poolAddresses.join(',');
    return this.fetchApi<PoolsResponse>(`/networks/${networkId}/pools/multi/${addresses}`);
  }

  // Get all Sui network pools (our specific pools)
  async getSuiPools(): Promise<PoolsResponse> {
    const poolAddresses = Object.values(POOL_ADDRESSES);
    return this.getPools('sui-network', poolAddresses);
  }

  // Get trending pools for a network
  async getTrendingPools(networkId: string, include?: string, page?: number): Promise<TrendingPoolsResponse> {
    let endpoint = `/networks/${networkId}/trending_pools`;
    const params = new URLSearchParams();
    
    if (include) params.append('include', include);
    if (page) params.append('page', page.toString());
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return this.fetchApi<TrendingPoolsResponse>(endpoint);
  }

  // Get all supported networks
  async getNetworks(): Promise<NetworksResponse> {
    return this.fetchApi<NetworksResponse>('/networks');
  }

  // Get new pools for a network
  async getNewPools(networkId: string, include?: string, page?: number): Promise<PoolsResponse> {
    let endpoint = `/networks/${networkId}/new_pools`;
    const params = new URLSearchParams();
    
    if (include) params.append('include', include);
    if (page) params.append('page', page.toString());
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return this.fetchApi<PoolsResponse>(endpoint);
  }

  // Get token price (used in your existing TokenTable component)
  async getTokenPrice(networkId: string, tokenAddress: string): Promise<any> {
    return this.fetchApi<any>(`/simple/networks/${networkId}/token_price/${encodeURIComponent(tokenAddress)}`);
  }

  // Helper method to get formatted pool data for UI
  async getFormattedSuiPools() {
    try {
      const response = await this.getSuiPools();
      
      return response.data.map(pool => ({
        id: pool.id,
        address: pool.attributes.address,
        name: pool.attributes.name,
        tvl: parseFloat(pool.attributes.reserve_in_usd),
        volume24h: parseFloat(pool.attributes.volume_usd.h24),
        priceChange24h: parseFloat(pool.attributes.price_change_percentage.h24),
        baseTokenPrice: parseFloat(pool.attributes.base_token_price_usd),
        quoteTokenPrice: parseFloat(pool.attributes.quote_token_price_usd),
        transactions24h: {
          buys: pool.attributes.transactions.h24.buys,
          sells: pool.attributes.transactions.h24.sells,
          buyers: pool.attributes.transactions.h24.buyers,
          sellers: pool.attributes.transactions.h24.sellers,
        },
        tokens: {
          base: response.included?.find(token => 
            token.id === pool.relationships.base_token.data.id
          ),
          quote: response.included?.find(token => 
            token.id === pool.relationships.quote_token.data.id
          ),
        }
      }));
    } catch (error) {
      console.error('Error fetching formatted Sui pools:', error);
      return [];
    }
  }
}

export const geckoTerminalService = new GeckoTerminalService();
export { POOL_ADDRESSES };