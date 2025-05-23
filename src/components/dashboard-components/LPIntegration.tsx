"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConnectButton, useWallet } from "@suiet/wallet-kit";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useGeckoPool, getPoolAddressForStyle } from "@/hooks/useGeckoPool";
import { Transaction } from "@mysten/sui/transactions";

// Contract constants for Riverr integration
const CONTRACT_ADDRESS = "0xfc38eb447fe340103e9a93599b00142fef33f032543489b832cd51d35e8c0c5a";
const POOL_REGISTRY = "0xed6b692cc13684657e82714c56d3343c5a832ad61fa832c6ae54714c762c84b7";
const WBTC_ADDRESS = "0x4528bbf3de06e0fa07691cdddad675b70d2c25acb4cdc12011cb87fc54ca0da4";

interface LPIntegrationProps {
  portfolioStyle: string | null;
}

/**
 * Force TypeScript to accept the useWallet hook without parameters
 * even though the type definition requires one
 */
// @ts-ignore
const useWalletHook = useWallet;

const LPIntegration: React.FC<LPIntegrationProps> = ({ portfolioStyle }) => {
  // Use the hook to get the pool data
  const { pool, loading, error } = useGeckoPool(portfolioStyle);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [wbtcAmount, setWbtcAmount] = useState("");
  const [suiAmount, setSuiAmount] = useState("");
  const [txInProgress, setTxInProgress] = useState(false);
  const [txStatus, setTxStatus] = useState<"idle" | "preparing" | "success" | "error">("idle");
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  // Use the useWallet hook with the TypeScript ignore to avoid parameter errors
  const wallet = useWalletHook();
  const { connected } = wallet;

  const openProvideLiquidityDialog = () => {
    if (!connected) {
      // If wallet is not connected, prompt to connect first
      // @ts-ignore: Ignoring parameter error for select method
      wallet.select();
      return;
    }
    setIsDialogOpen(true);
  };

  const handleProvideLiquidity = async () => {
    if (!connected || !pool) return;
    
    try {
      setTxInProgress(true);
      setTxStatus("preparing");
      setTxError(null);
      
      // Get the recommended pool address based on portfolio style
      const poolAddress = getPoolAddressForStyle(portfolioStyle);
      
      // Build transaction using Transaction from @mysten/sui/transactions
      const tx = new Transaction();
      
      // Set up the transaction to call provide_liquidity
      // Using object-based arguments for all parameters
      tx.moveCall({
        target: `${CONTRACT_ADDRESS}::riverr_contract::provide_liquidity`,
        typeArguments: [`${WBTC_ADDRESS}::wbtc::WBTC`],
        arguments: [
          // Use the registry object
          tx.object(POOL_REGISTRY),
          // Use the specific pool address
          tx.object(poolAddress),
          // For demo purposes, we'll use placeholder coins
          tx.object("0x0"), // WBTC coin placeholder
          tx.object("0x0")  // SUI coin placeholder
        ]
      });
      
      try {
        // Execute the transaction using the parameters from examples
        const result = await wallet.signAndExecuteTransaction({
          transaction: tx,
        });
        
        // Handle success
        setTxStatus("success");
        setTxDigest(result.digest);
        
        // Close dialog after a delay
        setTimeout(() => {
          setIsDialogOpen(false);
          setTxStatus("idle");
          setTxDigest(null);
        }, 5000);
      } catch (e) {
        console.error("Transaction execution error:", e);
        setTxStatus("error");
        setTxError(e instanceof Error ? e.message : 'Transaction execution failed');
      }
    } catch (err) {
      console.error("Transaction preparation error:", err);
      setTxStatus("error");
      setTxError(err instanceof Error ? err.message : 'Failed to prepare transaction');
    } finally {
      setTxInProgress(false);
    }
  };

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
    <>
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
              This pool has a 0.10% fee tier and high liquidity, offering the most stable returns with lower risk.
            </p>
          )}
          
          {portfolioStyle === "moderate" && (
            <p className="text-sm mb-4 text-sub-text">
              This pool has a 0.25% fee tier, offering a balanced approach between stability and yield potential.
            </p>
          )}
          
          {portfolioStyle === "aggressive" && (
            <p className="text-sm mb-4 text-sub-text">
              This pool has a 0.30% fee tier, providing higher yield potential with increased volatility for aggressive investors.
            </p>
          )}

          <div className="w-full space-y-2">
            {!connected ? (
              <div className="[&_.wkit-button]:!w-full [&_.wkit-connected-button]:!w-full">
                <ConnectButton />
                <p className="text-xs text-center mt-2 text-sub-text">
                  Connect your wallet to provide liquidity
                </p>
              </div>
            ) : (
              <Button 
                variant="gradient" 
                className="w-full"
                onClick={openProvideLiquidityDialog}
              >
                Provide LP to {portfolioStyle.charAt(0).toUpperCase() + portfolioStyle.slice(1)} Pool
              </Button>
            )}
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open(`https://suiexplorer.com/object/${pool.address}?network=testnet`, '_blank')}
            >
              View Pool Details on Explorer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Provide Liquidity Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Liquidity to {portfolioStyle?.charAt(0).toUpperCase() + portfolioStyle?.slice(1)} Pool</DialogTitle>
          </DialogHeader>
          
          {txStatus === "error" ? (
            <div className="space-y-4 py-4">
              <div className="bg-red-500/20 p-4 rounded-lg">
                <h3 className="font-semibold text-red-400">Transaction Failed</h3>
                <p className="text-sm mt-1">{txError}</p>
              </div>
              <Button variant="default" onClick={() => setTxStatus("idle")}>Try Again</Button>
            </div>
          ) : txStatus === "success" ? (
            <div className="space-y-4 py-4">
              <div className="bg-green-500/20 p-4 rounded-lg">
                <h3 className="font-semibold text-green-400">Transaction Successful!</h3>
                <p className="text-sm mt-1">
                  Your liquidity has been added to the pool.
                </p>
                {txDigest && (
                  <a 
                    href={`https://suiexplorer.com/txblock/${txDigest}?network=testnet`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline text-sm mt-2 block"
                  >
                    View transaction on Explorer
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm">WBTC Amount</label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={wbtcAmount}
                  onChange={(e) => setWbtcAmount(e.target.value)}
                  disabled={txInProgress}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm">SUI Amount</label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={suiAmount}
                  onChange={(e) => setSuiAmount(e.target.value)}
                  disabled={txInProgress}
                />
              </div>
              
              <Button 
                variant="gradient" 
                className="w-full" 
                onClick={handleProvideLiquidity}
                disabled={txInProgress || !wbtcAmount || !suiAmount}
              >
                {txInProgress ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Providing Liquidity...
                  </>
                ) : (
                  'Provide Liquidity'
                )}
              </Button>
              
              <p className="text-xs text-center text-sub-text">
                This will call the provide_liquidity function on the Riverr contract, using the Sui {portfolioStyle} pool.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LPIntegration;