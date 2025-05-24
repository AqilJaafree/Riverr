"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConnectButton, useWallet } from "@suiet/wallet-kit";
import Image from "next/image";
import { ArrowDownIcon, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Transaction } from "@mysten/sui/transactions";

// Contract addresses
const WBTC_PACKAGE_ID = "0x4528bbf3de06e0fa07691cdddad675b70d2c25acb4cdc12011cb87fc54ca0da4";
const WBTC_TREASURY_CAP = "0xca90f8b5200a56c5673305ae266595c9796cc9c6b723b258a74bdaf367ea9913";

interface TransactionStep {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description: string;
  txHash?: string;
}

export const BtcBridge = () => {
  const [btcAmount, setBtcAmount] = useState<string>("0");
  const [wbtcAmount, setWbtcAmount] = useState<string>("0");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [steps, setSteps] = useState<TransactionStep[]>([
    {
      id: 'bridge',
      title: 'Bridge BTC',
      status: 'pending',
      description: 'Converting BTC to wrapped format'
    },
    {
      id: 'mint',
      title: 'Mint WBTC',
      status: 'pending',
      description: 'Minting WBTC tokens to your wallet'
    },
    {
      id: 'complete',
      title: 'Ready for LP',
      status: 'pending',
      description: 'WBTC ready for liquidity provision'
    }
  ]);

  // @ts-ignore - Using wallet without parameters to avoid type errors
  const wallet = useWallet();
  const { connected, account } = wallet;

  // Update WBTC amount when BTC amount changes (1:1 ratio for demo)
  React.useEffect(() => {
    if (btcAmount && !isNaN(parseFloat(btcAmount))) {
      setWbtcAmount(btcAmount);
    } else {
      setWbtcAmount("0");
    }
  }, [btcAmount]);

  const updateStepStatus = (stepIndex: number, status: TransactionStep['status'], txHash?: string) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex 
        ? { ...step, status, txHash } 
        : step
    ));
  };

  const handleBridgeAndMint = async () => {
    if (!connected || !account) {
      // @ts-ignore
      wallet.select();
      return;
    }

    if (!btcAmount || parseFloat(btcAmount) <= 0) {
      alert("Please enter a valid BTC amount");
      return;
    }

    setIsProcessing(true);
    setCurrentStep(0);

    try {
      // Step 1: Simulate BTC Bridge (in a real implementation, this would interact with a BTC bridge)
      updateStepStatus(0, 'processing');
      
      // Simulate bridge delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      updateStepStatus(0, 'completed', 'btc_bridge_simulation');
      setCurrentStep(1);

      // Step 2: Mint WBTC tokens
      updateStepStatus(1, 'processing');
      
      try {
        // Calculate amount in smallest units (8 decimals for WBTC)
        const wbtcAmountInSmallestUnits = Math.floor(parseFloat(btcAmount) * 100000000);
        
        // Create transaction to mint WBTC
        const tx = new Transaction();
        
        tx.moveCall({
          target: `${WBTC_PACKAGE_ID}::wbtc::mint`,
          arguments: [
            tx.object(WBTC_TREASURY_CAP),
            tx.pure.u64(wbtcAmountInSmallestUnits),
            tx.pure.address(account.address),
          ]
        });

        // Execute the transaction
        const result = await wallet.signAndExecuteTransaction({
          transaction: tx,
        });

        updateStepStatus(1, 'completed', result.digest);
        setCurrentStep(2);

        // Step 3: Complete
        updateStepStatus(2, 'completed');
        
        // Show success message
        setTimeout(() => {
          alert(`Successfully minted ${wbtcAmount} WBTC! You can now provide liquidity.`);
        }, 1000);

      } catch (mintError) {
        console.error("WBTC minting error:", mintError);
        updateStepStatus(1, 'error');
        throw mintError;
      }

    } catch (error) {
      console.error("Bridge and mint error:", error);
      updateStepStatus(currentStep, 'error');
      alert(`Error: ${error instanceof Error ? error.message : 'Transaction failed'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetFlow = () => {
    setIsProcessing(false);
    setCurrentStep(0);
    setBtcAmount("0");
    setWbtcAmount("0");
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending', txHash: undefined })));
  };

  const getStepIcon = (status: TransactionStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-400" />;
    }
  };

  return (
    <div className="button-gradient rounded-2xl p-6 border">
      {/* Bridge Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Bridge & Mint</span>
          <span className="text-sm text-sub-text">BTC → WBTC</span>
        </div>

        {/* BTC Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">From BTC</span>
            <div className="flex items-center gap-2">
              <Image src="/btc.svg" alt="BTC" width={20} height={20} />
              <span className="text-sm font-medium">BTC</span>
            </div>
          </div>
          <div className="relative">
            <Input
              type="number"
              value={btcAmount}
              onChange={(e) => setBtcAmount(e.target.value)}
              className="bg-background border-border pr-12"
              placeholder="0.0"
              disabled={isProcessing}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              BTC
            </span>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="bg-secondary/50 p-2 rounded-full">
            <ArrowDownIcon size={16} />
          </div>
        </div>

        {/* WBTC Output */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">To WBTC</span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">W</span>
              </div>
              <span className="text-sm font-medium">WBTC</span>
            </div>
          </div>
          <div className="relative">
            <Input
              type="number"
              value={wbtcAmount}
              className="bg-background border-border pr-12"
              placeholder="0.0"
              disabled
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              WBTC
            </span>
          </div>
        </div>

        {/* Transaction Steps */}
        {isProcessing && (
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-medium">Transaction Progress</h4>
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                {getStepIcon(step.status)}
                <div className="flex-1">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-sub-text">{step.description}</div>
                  {step.txHash && step.txHash !== 'btc_bridge_simulation' && (
                    <a 
                      href={`https://suiexplorer.com/txblock/${step.txHash}?network=testnet`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary underline"
                    >
                      View transaction
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          {!connected ? (
            <div className="[&_.wkit-button]:!w-full [&_.wkit-connected-button]:!w-full">
              <ConnectButton />
            </div>
          ) : (
            <>
              <Button
                variant="gradient"
                className="w-full"
                onClick={handleBridgeAndMint}
                disabled={isProcessing || !btcAmount || parseFloat(btcAmount) <= 0}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {steps[currentStep]?.title || 'Processing...'}
                  </>
                ) : (
                  'Bridge BTC & Mint WBTC'
                )}
              </Button>
              
              {steps.some(step => step.status === 'completed') && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={resetFlow}
                  disabled={isProcessing}
                >
                  Start New Bridge
                </Button>
              )}
            </>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300">
            <strong>How it works:</strong> Your BTC will be bridged and automatically minted as WBTC tokens in your Sui wallet. 
            You can then use these WBTC tokens to provide liquidity in our pools.
          </p>
        </div>

        {/* Success Message */}
        {steps[2]?.status === 'completed' && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="font-medium text-green-400">Bridge Complete!</span>
            </div>
            <p className="text-sm text-green-300">
              {wbtcAmount} WBTC has been minted to your wallet. You can now proceed to provide liquidity in our pools.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 border-green-500 text-green-400 hover:bg-green-500/10"
              onClick={() => {
                // Navigate to LP provision - you can integrate this with your existing LP modal
                window.location.href = '/?action=provide-lp';
              }}
            >
              Provide Liquidity Now →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};