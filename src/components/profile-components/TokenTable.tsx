"use client"

/* eslint-disable @next/next/no-img-element */
// import React, { useState, useEffect, useCallback, useMemo } from "react";
import React, { useState, useEffect, useCallback} from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SuiClient } from '@mysten/sui/client';
import { useWallet } from '@suiet/wallet-kit';
import Image from "next/image";
import { useWalletValue } from "@/context/WalletValueContext";

// Define interfaces for better type safety
interface TokenData {
    name: string;
    symbol: string;
    balance: string;
    price: string;
    performance: string;
    value: string;
    valueNumber: number; // Numeric value for sorting
    iconUrl?: string;
    coinType: string;
    numericBalance: number;
}

interface CoinMetadata {
    id: string;
    decimals: number;
    name: string;
    symbol: string;
    description: string;
    iconUrl?: string;
}

interface TokenPrice {
    usd: number;
    usd_24h_change: number;
}

export default function TokenTable() {
    const { address, connected } = useWallet();
    const [tokens, setTokens] = useState<TokenData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setTotalValue } = useWalletValue();

    // Calculate total value of all tokens
    // const totalValue = useMemo(() => {
    //     if (!tokens.length) {
    //         return "0";
    //     }
        
    //     const total = tokens.reduce((sum, token) => {
    //         return sum + token.valueNumber;
    //     }, 0);
        
    //     return `$${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    // }, [tokens]);

    // Update context value in an effect, not during render
    useEffect(() => {
        // Extract the numeric value from the totalValue string
        const numericValue = tokens.length 
            ? tokens.reduce((sum, token) => sum + token.valueNumber, 0) 
            : 0;
        
        // Share the total value with other components via context
        setTotalValue(numericValue);
    }, [tokens, setTotalValue]);
    
    // Function to fetch token prices from GeckoTerminal
    const fetchTokenPrices = useCallback(async (tokenList: {symbol: string, coinType: string}[]) => {
        try {
            const prices: Record<string, TokenPrice> = {};
            
            // For each token, make a direct request to get its price
            for (const token of tokenList) {
                try {
                    // URL encode the address
                    const encodedAddress = encodeURIComponent(token.coinType);
                    
                    const response = await fetch(`https://api.geckoterminal.com/api/v2/simple/networks/sui-network/token_price/${encodedAddress}`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        if (data?.data?.attributes?.token_prices) {
                            // Extract the price - in the response it's the object key that matches the token address
                            const priceInfo = Object.values(data.data.attributes.token_prices)[0];
                            if (priceInfo) {
                                const price = parseFloat(String(priceInfo));
                                prices[token.symbol] = {
                                    usd: price,
                                    usd_24h_change: 0 // API doesn't return 24h change in this endpoint
                                };
                            }
                        }
                    }
                } catch (err) {
                    console.warn(`Failed to fetch price for ${token.symbol}:`, err);
                }
            }
            
            return prices;
        } catch (error) {
            console.error('Error fetching token prices:', error);
            return {};
        }
    }, []);

    const fetchWalletBalance = useCallback(async (address: string) => {
        setLoading(true);
        setError(null);
        try {
            // Use a direct RPC URL instead of environment variable
            const rpcUrl = 'https://fullnode.mainnet.sui.io:443';
            const client = new SuiClient({ url: rpcUrl });
            
            // First get all balances to know which coin types the wallet has
            const balances = await client.getAllBalances({ owner: address });
            
            if (!balances || balances.length === 0) {
                setTokens([]);
                return;
            }
            
            // Create a map to store metadata for each coin type
            const coinMetadataMap = new Map<string, CoinMetadata>();
            
            // Fetch metadata for each coin type
            for (const balance of balances) {
                try {
                    const metadata = await client.getCoinMetadata({ coinType: balance.coinType });
                    if (metadata) {
                        coinMetadataMap.set(balance.coinType, {
                            id: balance.coinType,
                            decimals: metadata.decimals,
                            name: metadata.name,
                            symbol: metadata.symbol,
                            description: metadata.description,
                            iconUrl: metadata.iconUrl || undefined
                        });
                    }
                } catch (err) {
                    console.warn(`Failed to fetch metadata for ${balance.coinType}:`, err);
                    // Continue with other coins even if one fails
                }
            }
            
            // Process the balances with metadata (without price data first)
            const tokenDataWithoutPrices = balances.map(balance => {
                const metadata = coinMetadataMap.get(balance.coinType);
                const coinName = metadata?.name || extractTokenName(balance.coinType);
                const symbol = metadata?.symbol || extractTokenName(balance.coinType);
                
                // Calculate the proper balance based on decimals
                const decimals = metadata?.decimals || (balance.coinType === '0x2::sui::SUI' ? 9 : 0);
                const rawBalance = BigInt(balance.totalBalance);
                const divisor = BigInt(10) ** BigInt(decimals);
                
                // Format balance to show very small numbers properly
                const numericBalance = Number(rawBalance) / Number(divisor);
                let formattedBalance;
                
                if (numericBalance < 0.000001 && numericBalance > 0) {
                    // For very small numbers, use fixed decimal notation instead of scientific
                    formattedBalance = numericBalance.toFixed(12).replace(/\.?0+$/, "");
                } else if (numericBalance === 0) {
                    formattedBalance = "0";
                } else {
                    // For larger numbers, use regular formatting but ensure small decimals are visible
                    formattedBalance = numericBalance.toLocaleString(undefined, {
                        maximumFractionDigits: 9,
                        minimumFractionDigits: numericBalance < 0.1 ? 9 : 2
                    });
                }
                
                return {
                    name: coinName,
                    symbol: symbol,
                    balance: formattedBalance,
                    price: "Loading...",
                    performance: "Loading...",
                    value: "Loading...",
                    valueNumber: 0, // Initial value for sorting
                    iconUrl: metadata?.iconUrl,
                    coinType: balance.coinType,
                    numericBalance: numericBalance
                };
            });
            
            // Set initial tokens without price data
            setTokens(tokenDataWithoutPrices);
            
            // Collect token info to fetch prices for
            const tokenInfoList = tokenDataWithoutPrices.map(token => ({
                symbol: token.symbol,
                coinType: token.coinType
            }));
            
            // Fetch price data
            const prices = await fetchTokenPrices(tokenInfoList);
            
            // Update tokens with price data
            const updatedTokens = tokenDataWithoutPrices.map(token => {
                const priceInfo = prices[token.symbol];
                
                if (priceInfo) {
                    const price = priceInfo.usd;
                    const performance = priceInfo.usd_24h_change;
                    const value = token.numericBalance * price;
                    
                    return {
                        ...token,
                        price: `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                        performance: `${performance >= 0 ? '+' : ''}${performance.toFixed(2)}%`,
                        value: `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                        valueNumber: value // Store numeric value for sorting
                    };
                }
                
                return {
                    ...token,
                    price: "N/A",
                    performance: "N/A",
                    value: "N/A",
                    valueNumber: 0
                };
            });
            
            // Sort tokens by value (highest to lowest)
            const sortedTokens = [...updatedTokens].sort((a, b) => b.valueNumber - a.valueNumber);
            
            setTokens(sortedTokens);
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
            setError('Failed to fetch wallet data. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [fetchTokenPrices]);

    useEffect(() => {
        if (connected && address) {
            fetchWalletBalance(address);
        }
    }, [connected, address, fetchWalletBalance]);
    
    // Helper function to extract a readable token name from the coin type
    const extractTokenName = (coinType: string): string => {
        // Example: 0x2::sui::SUI → SUI
        const parts = coinType.split('::');
        if (parts.length >= 3) {
            return parts[2]; // Return the last part
        }
        return coinType; // Fallback to the full type if can't extract
    };

    const getTokenIcon = (token: TokenData) => {
        // Special case for SUI - use local image
        if (token.symbol === "SUI") {
            return <Image src="/sui.png" alt="SUI" width={20} height={20} className="rounded-full" unoptimized/>;
        }
        
        // If token has its own icon URL from metadata, use that
        if (token.iconUrl) {
            return <img src={token.iconUrl} alt={token.symbol} className="w-5 h-5 rounded-full" />;
        }
        
        // Fall back to default token representations
        return (
            <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center text-xs">
                {token.symbol.charAt(0)}
            </div>
        );
    };

    return (
        <Card className="bg-background">
            <CardHeader>
                <CardTitle>Wallet Balance</CardTitle>
                {connected && address ? (
                    <div className="text-sm text-white">
                        Wallet: {address.substring(0, 6)}...{address.substring(address.length - 4)}
                    </div>
                ) : (
                    <div className="text-sm text-white">
                        Connect your wallet to view your tokens
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {loading && tokens.length === 0 ? (
                    <div className="flex justify-center py-8">Loading wallet data...</div>
                ) : error ? (
                    <div className="text-center py-8 text-red-400">{error}</div>
                ) : tokens.length > 0 ? (
                    <>
                        {/* <div className="mb-4 text-primary">
                            <span className="font-bold text-xl">Total Value: {totalValue}</span> 
                        </div> */}
                        <Table className="text-white">
                            <TableHeader>
                                <TableRow>
                                    <TableCell>Token</TableCell>
                                    <TableCell>Balance</TableCell>
                                    <TableCell>Price</TableCell>
                                    
                                    <TableCell>Value</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tokens.map((token, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="flex items-center gap-2">
                                            {getTokenIcon(token)}
                                            <span>{token.name}</span>
                                        </TableCell>
                                        <TableCell>{token.balance} {token.symbol}</TableCell>
                                        <TableCell>{token.price}</TableCell>
                                        
                                        <TableCell>{token.value}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </>
                ) : (
                    <div className="text-center py-8">
                        {connected && address ? "No tokens found in this wallet" : "Connect wallet to view tokens"}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
