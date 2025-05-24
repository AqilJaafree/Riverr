"use client";

import { useState, useEffect } from "react";
import Header from "@/components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Type for WormholeConnect component
type WormholeConnectComponent = React.ComponentType<{
  config: {
    network: string;
    chains: string[];
    rpcs: Record<string, string | undefined>;
  };
  theme: {
    mode: string;
    primary: string;
    font: string;
    text: string;
    textSecondary: string;
    input: string;
  };
}>;

const Wormhole = () => {
  const router = useRouter();
  const [WormholeConnect, setWormholeConnect] = useState<WormholeConnectComponent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const handleTabChange = (value: string) => {
    if (value === "btc") {
      router.push("/bridge");
    }
  };

  useEffect(() => {
    setIsClient(true);
    
    const loadWormhole = async () => {
      try {
        const { default: WormholeConnectComponent } = await import("@wormhole-foundation/wormhole-connect") as { 
          default: WormholeConnectComponent 
        };
        setWormholeConnect(() => WormholeConnectComponent);
      } catch (error) {
        console.error("Failed to load WormholeConnect:", error);
      } finally {
        setLoading(false);
      }
    };

    loadWormhole();
  }, []);

  const config = {
    network: "Mainnet",
    chains: ["Sui", "Ethereum", "Solana", "ArbitrumSepolia", "Holesky"],
    rpcs: {
      Ethereum: process.env.NEXT_PUBLIC_RPC_URL_ETHEREUM,
      Sui: process.env.NEXT_PUBLIC_RPC_URL_SUI,
      Solana: process.env.NEXT_PUBLIC_RPC_URL_SOLANA,
      ArbitrumSepolia: process.env.NEXT_PUBLIC_RPC_URL_ARBITRUM_SEPOLIA,
      Holesky: process.env.NEXT_PUBLIC_RPC_URL_HOLESKY,
    }
  };

  const theme = {
    mode: "dark",
    primary: "#2f68ff",
    font: "Geist, sans-serif",
    text: "#ffffff",
    textSecondary: "#2f68ff",
    input: "#0c0e1f",
  };

  return (
    <div>
      <Header showConnectWallet={false} />
      <div className="w-full h-full flex flex-col items-center justify-start mb-4 mt-6">
        <Tabs defaultValue="wormhole" className="md:w-[400px] w-full px-4" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="btc">BTC Bridge</TabsTrigger>
            <TabsTrigger value="wormhole">Wormhole</TabsTrigger>
          </TabsList>
          <TabsContent value="wormhole" className="mt-6">
            <div className="w-full h-fit lg:max-w-3xl mx-auto button-gradient px-6 rounded-2xl border-border border">
              {!isClient || loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="animate-spin h-8 w-8" />
                  <span className="ml-2">Loading Wormhole Connect...</span>
                </div>
              ) : WormholeConnect ? (
                <WormholeConnect config={config} theme={theme} />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <span>Failed to load bridge component</span>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Wormhole;