// src/services/anthropic.ts
import { AnthropicMessage } from '@/types/anthropic';

export class AnthropicService {
  async sendMessage(messages: AnthropicMessage[], temperature = 0.7): Promise<string> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.response.content[0].text;
    } catch (error) {
      console.error('Error sending message to Anthropic:', error);
      throw error;
    }
  }
}

export const anthropicService = new AnthropicService();