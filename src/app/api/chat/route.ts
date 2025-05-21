// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_CONFIG } from '@/config';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!ANTHROPIC_CONFIG.apiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key is not configured' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: ANTHROPIC_CONFIG.apiKey as string,
    });

    const response = await anthropic.messages.create({
      model: ANTHROPIC_CONFIG.model,
      messages: messages,
      max_tokens: ANTHROPIC_CONFIG.maxTokens,
      temperature: ANTHROPIC_CONFIG.temperature,
    });

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Error in chat API route:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}