import { useState, useEffect } from 'react';
import { geckoTerminalService } from '@/services/gecko-terminal';
import { FormattedPoolData } from '@/types/gecko-terminal';

export function usePools() {
  const [pools, setPools] = useState<FormattedPoolData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPools = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const poolData = await geckoTerminalService.getFormattedSuiPools();
      setPools(poolData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();
  }, []);

  return {
    pools,
    loading,
    error,
    refetch: fetchPools,
  };
}