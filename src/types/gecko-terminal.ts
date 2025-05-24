import { TokenInfo } from "@/services/gecko-terminal";

export interface FormattedPoolData {
  id: string;
  address: string;
  name: string;
  tvl: number;
  volume24h: number;
  priceChange24h: number;
  baseTokenPrice: number;
  quoteTokenPrice: number;
  transactions24h: {
    buys: number;
    sells: number;
    buyers: number;
    sellers: number;
  };
  tokens: {
    base?: TokenInfo;
    quote?: TokenInfo;
  };
}