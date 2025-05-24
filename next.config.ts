import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Remove the experimental dynamicIO - not available in this version
  // Instead, handle the environment variables properly
  env: {
    NEXT_PUBLIC_RPC_URL_ETHEREUM: process.env.NEXT_PUBLIC_RPC_URL_ETHEREUM,
    NEXT_PUBLIC_RPC_URL_SUI: process.env.NEXT_PUBLIC_RPC_URL_SUI,
    NEXT_PUBLIC_RPC_URL_SOLANA: process.env.NEXT_PUBLIC_RPC_URL_SOLANA,
    NEXT_PUBLIC_RPC_URL_ARBITRUM_SEPOLIA: process.env.NEXT_PUBLIC_RPC_URL_ARBITRUM_SEPOLIA,
    NEXT_PUBLIC_RPC_URL_HOLESKY: process.env.NEXT_PUBLIC_RPC_URL_HOLESKY,
  }
};

export default nextConfig;