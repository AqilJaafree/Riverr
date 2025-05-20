"use client";

import WormholeConnect, {
  WormholeConnectConfig,
  WormholeConnectTheme,
} from "@wormhole-foundation/wormhole-connect";
import Header from "@/components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

const Wormhole = () => {
  const router = useRouter();
  const config: WormholeConnectConfig = {
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

  const theme: WormholeConnectTheme = {
    mode: "dark",
    primary: "#2f68ff",
    font: "Geist, sans-serif",
    text: "#ffffff",
    textSecondary: "#2f68ff",
    input: "#0c0e1f",
  };

  const handleTabChange = (value: string) => {
    if (value === "btc") {
      router.push("/bridge");
    }
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
              <WormholeConnect config={config} theme={theme} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Wormhole;
