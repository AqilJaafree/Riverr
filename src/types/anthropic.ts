// src/types/anthropic.ts

export type AnthropicRole = 'user' | 'assistant';

export interface AnthropicMessage {
  role: AnthropicRole;
  content: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Response types from Anthropic API
export interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: AnthropicContent[];
  model: string;
  stop_reason: string | null;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface AnthropicContent {
  type: string;
  text: string;
}