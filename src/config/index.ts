// src/config/index.ts

// Anthropic config
export const ANTHROPIC_CONFIG = {
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
  model: 'claude-3-5-sonnet-20240620',
  maxTokens: 1000,
  temperature: 0.7,
};

// RPC URLs for blockchain connections
export const RPC_URLS = {
  ethereum: process.env.NEXT_PUBLIC_RPC_URL_ETHEREUM,
  sui: process.env.NEXT_PUBLIC_RPC_URL_SUI,
  solana: process.env.NEXT_PUBLIC_RPC_URL_SOLANA,
  arbitrumSepolia: process.env.NEXT_PUBLIC_RPC_URL_ARBITRUM_SEPOLIA,
  holesky: process.env.NEXT_PUBLIC_RPC_URL_HOLESKY,
};

// Chat configuration
export const CHAT_CONFIG = {
  initialPrompt: `You are an AI assistant for Riverr, a platform that helps users explore BTC liquidity on Sui blockchain. 
Your role is to provide information about pools, liquidity, and crypto-related topics. 
Maintain a knowledgeable but conversational tone. Keep answers concise and focused on crypto, DeFi, 
and specifically BTC liquidity topics.`,
};