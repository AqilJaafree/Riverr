"use client";

import Header from "@/components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BtcBridge } from "@/components/bridge-components/BtcBridge";
import { useRouter } from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const Bridge = () => {
  const router = useRouter();

  const handleTabChange = (value: string) => {
    if (value === "wormhole") {
      router.push("/bridge/wormhole");
    }
  };

  return (
    <div>
      <Header />
      <div className="w-full h-full flex flex-col items-center justify-start mt-6">
        <Tabs defaultValue="btc" className="md:w-[400px] w-full px-4" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="btc">BTC Bridge</TabsTrigger>
            <TabsTrigger value="wormhole">Wormhole</TabsTrigger>
          </TabsList>
          <TabsContent value="btc" className="mt-6">
            <BtcBridge />
          </TabsContent>
          <TabsContent value="wormhole" className="mt-6"></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Bridge;  