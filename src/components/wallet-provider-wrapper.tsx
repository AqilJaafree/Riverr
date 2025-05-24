'use client';

import { WalletProvider } from '@suiet/wallet-kit';
import '@suiet/wallet-kit/style.css';
import { WalletValueProvider } from '@/context/WalletValueContext';

interface WalletProviderWrapperProps {
  children: React.ReactNode;
}

export default function WalletProviderWrapper({ children }: WalletProviderWrapperProps) {
  return (
    <WalletProvider>
      <WalletValueProvider>
        {children}
      </WalletValueProvider>
    </WalletProvider>
  );
} 