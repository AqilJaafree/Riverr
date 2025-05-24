// src/app/api/sui/get-coins/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

export async function POST(req: NextRequest) {
  try {
    const { owner, coinType } = await req.json();

    if (!owner || !coinType) {
      return NextResponse.json(
        { error: 'Owner address and coin type are required' },
        { status: 400 }
      );
    }

    // Initialize Sui client for testnet
    const client = new SuiClient({
      url: getFullnodeUrl('testnet'),
    });

    // Get all coins of the specified type owned by the address
    const coins = await client.getCoins({
      owner,
      coinType,
    });

    return NextResponse.json({
      coins: coins.data,
      hasNextPage: coins.hasNextPage,
      nextCursor: coins.nextCursor,
    });

  } catch (error: unknown) {
    console.error('Error fetching coins:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch coins' },
      { status: 500 }
    );
  }
}