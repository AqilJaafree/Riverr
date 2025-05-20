"use client";

import Header from "@/components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BtcBridge } from "@/components/bridge-components/BtcBridge";
import { useRouter, useSearchParams } from "next/navigation";

const Bridge = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "btc";

  const handleTabChange = (value: string) => {
    if (value === "wormhole") {
      router.push("/bridge/wormhole");
    }
  };

  return (
    <div>
      <Header />
      <div className="w-full h-full flex flex-col items-center justify-start mt-6">
        <Tabs defaultValue={tab} className="md:w-[400px] w-full px-4" onValueChange={handleTabChange}>
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

