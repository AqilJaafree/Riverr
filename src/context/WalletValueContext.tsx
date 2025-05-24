"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WalletValueContextType {
  totalValue: number;
  setTotalValue: (value: number) => void;
}

const WalletValueContext = createContext<WalletValueContextType | undefined>(undefined);

export function WalletValueProvider({ children }: { children: ReactNode }) {
  const [totalValue, setTotalValue] = useState<number>(0);

  return (
    <WalletValueContext.Provider value={{ totalValue, setTotalValue }}>
      {children}
    </WalletValueContext.Provider>
  );
}

export function useWalletValue() {
  const context = useContext(WalletValueContext);
  if (context === undefined) {
    throw new Error('useWalletValue must be used within a WalletValueProvider');
  }
  return context;
} 