// Enhanced LP Integration with real coin object handling
"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConnectButton, useWallet } from "@suiet/wallet-kit";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { Loader2, AlertTriangle, ExternalLink, Coins } from "lucide-react";
import { useGeckoPool, getPoolAddressForStyle } from "@/hooks/useGeckoPool";
import { Transaction } from "@mysten/sui/transactions";

// Contract constants
const CONTRACT_ADDRESS = "0xfc38eb447fe340103e9a93599b00142fef33f032543489b832cd51d35e8c0c5a";
const POOL_REGISTRY = "0xed6b692cc13684657e82714c56d3343c5a832ad61fa832c6ae54714c762c84b7";
const WBTC_ADDRESS = "0x4528bbf3de06e0fa07691cdddad675b70d2c25acb4cdc12011cb87fc54ca0da4";

interface FixedLPIntegrationProps {
  portfolioStyle: string | null;
}

interface CoinBalance {
  coinObjectId: string;
  balance: string;
  formattedBalance: string;
}

// @ts-ignore
const useWalletHook = useWallet;

const FixedLPIntegration: React.FC<FixedLPIntegrationProps> = ({ portfolioStyle }) => {
  const { pool, loading, error } = useGeckoPool(portfolioStyle);
  
  // Dialog and transaction state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [wbtcAmount, setWbtcAmount] = useState("");
  const [suiAmount, setSuiAmount] = useState("");
  const [txInProgress, setTxInProgress] = useState(false);
  const [txStatus, setTxStatus] = useState<"idle" | "preparing" | "success" | "error">("idle");
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  
  // Balance state
  const [wbtcBalance, setWbtcBalance] = useState<CoinBalance>({ coinObjectId: "", balance: "0", formattedBalance: "0.0" });
  const [suiBalance, setSuiBalance] = useState<CoinBalance>({ coinObjectId: "", balance: "0", formattedBalance: "0.0" });
  const [balancesLoading, setBalancesLoading] = useState(false);

  const wallet = useWalletHook();
  const { connected, account } = wallet;

  // Fetch coin balances when dialog opens
  const fetchBalances = async () => {
    if (!connected || !account) return;
    
    setBalancesLoading(true);
    try {
      // Fetch WBTC coins
      const wbtcResponse = await fetch('/api/sui/get-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: account.address,
          coinType: `${WBTC_ADDRESS}::wbtc::WBTC`
        })
      });
      
      // Fetch SUI coins
      const suiResponse = await fetch('/api/sui/get-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: account.address,
          coinType: '0x2::sui::SUI'
        })
      });

      const wbtcData = await wbtcResponse.json();
      const suiData = await suiResponse.json();

      // Get largest WBTC coin
      if (wbtcData.coins && wbtcData.coins.length > 0) {
        const largestWbtc = wbtcData.coins.reduce((largest: any, current: any) => 
          parseInt(current.balance) > parseInt(largest.balance) ? current : largest
        );
        setWbtcBalance({
          coinObjectId: largestWbtc.coinObjectId,
          balance: largestWbtc.balance,
          formattedBalance: (parseInt(largestWbtc.balance) / 100000000).toFixed(8)
        });
      }

      // Calculate total SUI balance and find best coin for gas
      if (suiData.coins && suiData.coins.length > 0) {
        const totalSuiBalance = suiData.coins.reduce((sum: number, coin: any) => 
          sum + parseInt(coin.balance), 0
        );
        
        // Find largest SUI coin that can cover gas (at least 0.1 SUI)
        const suitableForGas = suiData.coins.filter((coin: any) => 
          parseInt(coin.balance) >= 100000000 // At least 0.1 SUI
        );
        
        if (suitableForGas.length > 0) {
          const bestSui = suitableForGas.reduce((largest: any, current: any) => 
            parseInt(current.balance) > parseInt(largest.balance) ? current : largest
          );
          
          setSuiBalance({
            coinObjectId: bestSui.coinObjectId,
            balance: totalSuiBalance.toString(),
            formattedBalance: (totalSuiBalance / 1000000000).toFixed(9)
          });
        } else {
          // No coin large enough for gas
          setSuiBalance({
            coinObjectId: "",
            balance: totalSuiBalance.toString(),
            formattedBalance: (totalSuiBalance / 1000000000).toFixed(9)
          });
        }
      }

    } catch (err) {
      console.error('Error fetching balances:', err);
    } finally {
      setBalancesLoading(false);
    }
  };

  const openProvideLiquidityDialog = () => {
    if (!connected) {
      // @ts-ignore
      wallet.select();
      return;
    }
    setIsDialogOpen(true);
    fetchBalances();
  };

  const hasEnoughWBTC = () => {
    if (!wbtcAmount) return true;
    const requiredAmount = parseFloat(wbtcAmount);
    const availableAmount = parseFloat(wbtcBalance.formattedBalance);
    return availableAmount >= requiredAmount;
  };

  const hasEnoughSUI = () => {
    if (!suiAmount) return true;
    const requiredAmount = parseFloat(suiAmount);
    const availableAmount = parseFloat(suiBalance.formattedBalance);
    const gasReserve = 0.05; // Reserve 0.05 SUI for gas
    return availableAmount >= (requiredAmount + gasReserve);
  };

  const handleProvideLiquidity = async () => {
    if (!connected || !pool || !hasEnoughWBTC() || !hasEnoughSUI()) return;
    
    if (!wbtcBalance.coinObjectId) {
      setTxError("No WBTC coins found in wallet");
      setTxStatus("error");
      return;
    }
    
    if (!suiBalance.coinObjectId) {
      setTxError("No suitable SUI coins found (need at least 0.1 SUI for gas)");
      setTxStatus("error");
      return;
    }
    
    try {
      setTxInProgress(true);
      setTxStatus("preparing");
      setTxError(null);
      
      // Get the pool address for this portfolio style
      const poolAddress = getPoolAddressForStyle(portfolioStyle);
      
      // Calculate amounts in smallest units
      const wbtcAmountInSmallestUnits = Math.floor(parseFloat(wbtcAmount) * 100000000);
      const suiAmountInSmallestUnits = Math.floor(parseFloat(suiAmount) * 1000000000);
      
      // Build transaction
      const tx = new Transaction();
      
      // Split WBTC coin to exact amount
      const [wbtcCoin] = tx.splitCoins(tx.object(wbtcBalance.coinObjectId), [tx.pure.u64(wbtcAmountInSmallestUnits)]);
      
      // For SUI, split from a different coin or use a smaller amount
      // Don't split from the gas coin - let Sui handle gas automatically
      const [suiCoinForLP] = tx.splitCoins(tx.gas, [tx.pure.u64(suiAmountInSmallestUnits)]);
      
      // Call provide_liquidity
      tx.moveCall({
        target: `${CONTRACT_ADDRESS}::riverr_contract::provide_liquidity`,
        typeArguments: [`${WBTC_ADDRESS}::wbtc::WBTC`],
        arguments: [
          tx.object(POOL_REGISTRY),
          tx.object(poolAddress),
          wbtcCoin,
          suiCoinForLP
        ]
      });
      
      // Execute transaction - let wallet handle gas automatically
      const result = await wallet.signAndExecuteTransaction({
        transaction: tx,
      });
      
      setTxStatus("success");
      setTxDigest(result.digest);
      
      // Refresh balances after successful transaction
      setTimeout(() => {
        fetchBalances();
      }, 2000);
      
      // Close dialog after delay
      setTimeout(() => {
        setIsDialogOpen(false);
        setTxStatus("idle");
        setTxDigest(null);
      }, 5000);
      
    } catch (err) {
      console.error("LP provision error:", err);
      setTxStatus("error");
      setTxError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setTxInProgress(false);
    }
  };

  if (!portfolioStyle) return null;

  if (loading) {
    return (
      <Card className="bg-primary border-primary/30 mt-4">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin h-8 w-8" />
          <span className="ml-2">Loading pool information...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !pool) {
    return (
      <Card className="bg-primary border-primary/30 mt-4">
        <CardContent className="py-6">
          <p className="text-red-400">Error loading pool: {error}</p>
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
            <span>Recommended {portfolioStyle.charAt(0).toUpperCase() + portfolioStyle.slice(1)} Pool</span>
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
          </div>

          <div className="w-full">
            {!connected ? (
              <div className="[&_.wkit-button]:!w-full [&_.wkit-connected-button]:!w-full">
                <ConnectButton />
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
          </div>
        </CardContent>
      </Card>

      {/* Provide Liquidity Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Liquidity</DialogTitle>
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
                <h3 className="font-semibold text-green-400">Success!</h3>
                <p className="text-sm mt-1">Liquidity provided successfully!</p>
                {txDigest && (
                  <a 
                    href={`https://suiscan.xyz/testnet/tx/${txDigest}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline text-sm mt-2 block"
                  >
                    View on Suiscan
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {balancesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="animate-spin h-6 w-6" />
                  <span className="ml-2">Loading balances...</span>
                </div>
              ) : (
                <>
                  {/* Balance Display */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 p-3 bg-background/50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-400">WBTC Balance:</p>
                        <p className="font-mono text-sm">{wbtcBalance.formattedBalance}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">SUI Balance:</p>
                        <p className="font-mono text-sm">{suiBalance.formattedBalance}</p>
                      </div>
                    </div>
                    
                    <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs">
                      <p className="text-blue-300">
                        💡 <strong>Gas Reserve:</strong> 0.05 SUI will be reserved for transaction fees
                      </p>
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="space-y-2">
                    <label className="text-sm">WBTC Amount</label>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={wbtcAmount}
                      onChange={(e) => setWbtcAmount(e.target.value)}
                      disabled={txInProgress}
                      className={!hasEnoughWBTC() && wbtcAmount ? "border-red-500" : ""}
                    />
                    {!hasEnoughWBTC() && wbtcAmount && (
                      <p className="text-xs text-red-400">Insufficient WBTC balance</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm">SUI Amount</label>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={suiAmount}
                      onChange={(e) => setSuiAmount(e.target.value)}
                      disabled={txInProgress}
                      className={!hasEnoughSUI() && suiAmount ? "border-red-500" : ""}
                    />
                    {!hasEnoughSUI() && suiAmount && (
                      <p className="text-xs text-red-400">Insufficient SUI (need extra 0.05 SUI for gas)</p>
                    )}
                  </div>
                  
                  <Button 
                    variant="gradient" 
                    className="w-full" 
                    onClick={handleProvideLiquidity}
                    disabled={txInProgress || !wbtcAmount || !suiAmount || !hasEnoughWBTC() || !hasEnoughSUI()}
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
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FixedLPIntegration;