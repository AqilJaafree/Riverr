// src/hooks/useWBTC.ts
import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@suiet/wallet-kit';
import { Transaction } from '@mysten/sui/transactions';

// WBTC Contract constants
const WBTC_PACKAGE_ID = "0x4528bbf3de06e0fa07691cdddad675b70d2c25acb4cdc12011cb87fc54ca0da4";
const WBTC_TREASURY_CAP = "0xca90f8b5200a56c5673305ae266595c9796cc9c6b723b258a74bdaf367ea9913";

interface Coin {
  coinObjectId: string;
  balance: string;
}

export interface WBTCBalance {
  balance: string;
  formattedBalance: string;
  coinObjects: Coin[];
}

export function useWBTC() {
  const [wbtcBalance, setWbtcBalance] = useState<WBTCBalance>({
    balance: '0',
    formattedBalance: '0.0',
    coinObjects: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wallet = useWallet();
  const { connected, account } = wallet;

  const fetchWBTCBalance = useCallback(async () => {
    if (!connected || !account) return;

    setLoading(true);
    setError(null);

    try {
      // Get all WBTC coin objects owned by the user
      const response = await fetch('/api/sui/get-coins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner: account.address,
          coinType: `${WBTC_PACKAGE_ID}::wbtc::WBTC`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch WBTC balance');
      }

      const data = await response.json();
      const totalBalance = data.coins?.reduce((sum: number, coin: Coin) => {
        return sum + parseInt(coin.balance);
      }, 0) || 0;

      // Convert from smallest units (8 decimals) to human readable
      const formattedBalance = (totalBalance / 100000000).toFixed(8);

      setWbtcBalance({
        balance: totalBalance.toString(),
        formattedBalance,
        coinObjects: data.coins || []
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch WBTC balance');
      console.error('Error fetching WBTC balance:', err);
    } finally {
      setLoading(false);
    }
  }, [connected, account]);

  const mintWBTC = async (amount: number, recipient?: string) => {
    if (!connected || !account) {
      throw new Error('Wallet not connected');
    }

    try {
      // Convert to smallest units (8 decimals)
      const amountInSmallestUnits = Math.floor(amount * 100000000);
      const recipientAddress = recipient || account.address;

      // Create proper Transaction object
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${WBTC_PACKAGE_ID}::wbtc::mint`,
        arguments: [
          tx.object(WBTC_TREASURY_CAP),
          tx.pure.u64(amountInSmallestUnits),
          tx.pure.address(recipientAddress),
        ]
      });

      const result = await wallet.signAndExecuteTransaction({
        transaction: tx,
      });

      // Refresh balance after minting
      await fetchWBTCBalance();

      return result;
    } catch (error) {
      console.error('Error minting WBTC:', error);
      throw error;
    }
  };

  const hasMinimumWBTC = (requiredAmount: number): boolean => {
    const currentBalance = parseFloat(wbtcBalance.formattedBalance);
    return currentBalance >= requiredAmount;
  };

  const getLargestWBTCCoin = () => {
    if (wbtcBalance.coinObjects.length === 0) return null;
    
    return wbtcBalance.coinObjects.reduce((largest, current) => {
      return parseInt(current.balance) > parseInt(largest.balance) ? current : largest;
    });
  };

  // Fetch balance when wallet connects
  useEffect(() => {
    if (connected && account) {
      fetchWBTCBalance();
    } else {
      setWbtcBalance({
        balance: '0',
        formattedBalance: '0.0',
        coinObjects: []
      });
    }
  }, [connected, account, fetchWBTCBalance]);

  return {
    wbtcBalance,
    loading,
    error,
    fetchWBTCBalance,
    mintWBTC,
    hasMinimumWBTC,
    getLargestWBTCCoin,
    connected,
    account
  };
}