"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { ConnectButton } from "@suiet/wallet-kit";
import Image from "next/image";
import { ArrowDownIcon } from "@phosphor-icons/react";

export const BtcBridge = () => {
  const [sellAmount, setSellAmount] = useState<string>("0");
  const [buyAmount, setBuyAmount] = useState<string>("0");
  const [isSwapped, setIsSwapped] = useState(false);

  const handleSwap = () => {
    setIsSwapped(!isSwapped);
    // Swap the amounts
    const tempAmount = sellAmount;
    setSellAmount(buyAmount);
    setBuyAmount(tempAmount);
  };

  const TopToken = isSwapped ? (
    <div className="flex items-center gap-2">
      <Image src="/sui.png" alt="SUI" width={20} height={20} className="rounded-full"/>
      <span className="text-sm font-medium">SUI</span>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Image src="/btc.svg" alt="BTC" width={20} height={20} />
      <span className="text-sm font-medium">BTC</span>
    </div>
  );

  const BottomToken = isSwapped ? (
    <div className="flex items-center gap-2">
      <Image src="/btc.svg" alt="BTC" width={20} height={20} />
      <span className="text-sm font-medium">BTC</span>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Image src="/sui.png" alt="SUI" width={20} height={20} className="rounded-full"/>
      <span className="text-sm font-medium">SUI</span>
    </div>
  );

  return (
    <div className="button-gradient rounded-2xl p-6 border">
      {/* Sell Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-lg">Sell</span>
          {TopToken}
        </div>
        <div className="relative">
          <Input
            type="number"
            value={sellAmount}
            onChange={(e) => setSellAmount(e.target.value)}
            className="bg-background border-border pr-12"
            placeholder="0"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            BTC
          </span>
        </div>
      </div>

      {/* Swap Icon */}
      <div className="flex justify-center mt-3">
        <button
          onClick={handleSwap}
          className="bg-secondary/50 p-2 rounded-full hover:bg-secondary/70 transition-colors"
        >
          <ArrowDownIcon size={16} />
        </button>
      </div>

      {/* Buy Section */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg">Buy</span>
          {BottomToken}
        </div>
        <div className="relative">
          <Input
            type="number"
            value={buyAmount}
            onChange={(e) => setBuyAmount(e.target.value)}
            className="bg-background border-border pr-12"
            placeholder="0"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            BTC
          </span>
        </div>
      </div>

      {/* Connect Wallet Button */}
      <div className="w-full">
        <div className="[&_.wkit-button]:!w-full [&_.wkit-connected-button]:!w-full">
          <ConnectButton />
        </div>
      </div>
    </div>
  );
};
