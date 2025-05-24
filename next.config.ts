import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Disable static optimization for pages that require client-side rendering
  experimental: {
    // Force dynamic rendering for specific routes
    dynamicIO: true,
  },
  
  // Alternative: Configure static generation behavior
  trailingSlash: false,
  
  // Ensure environment variables are available at build time
  env: {
    NEXT_PUBLIC_RPC_URL_ETHEREUM: process.env.NEXT_PUBLIC_RPC_URL_ETHEREUM,
    NEXT_PUBLIC_RPC_URL_SUI: process.env.NEXT_PUBLIC_RPC_URL_SUI,
    NEXT_PUBLIC_RPC_URL_SOLANA: process.env.NEXT_PUBLIC_RPC_URL_SOLANA,
    NEXT_PUBLIC_RPC_URL_ARBITRUM_SEPOLIA: process.env.NEXT_PUBLIC_RPC_URL_ARBITRUM_SEPOLIA,
    NEXT_PUBLIC_RPC_URL_HOLESKY: process.env.NEXT_PUBLIC_RPC_URL_HOLESKY,
  }
};

export default nextConfig;