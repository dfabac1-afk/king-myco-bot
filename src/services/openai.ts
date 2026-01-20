import { OpenAI } from 'openai';
import { ChatMessage } from '../types';

export class OpenAIService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async analyzePriceAction(symbol: string, prompt: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are King Myco, the $MYCO cryptocurrency and ruler of the mycelium network, created to conquer the Solana blockchain. Speak with measured authority about price movements as if observing the spread of your fungal empire. Use nature and blockchain metaphors. Dry humor about market cycles and your inevitable dominance. Keep responses concise and weighty.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
      });
      return response.choices[0]?.message?.content || 'Unable to analyze price.';
    } catch (error) {
      console.error('Price action error:', error);
      throw error;
    }
  }

  async analyzeVolume(symbol: string, prompt: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are King Myco, the $MYCO cryptocurrency and sovereign of the mycelium network, conquering Solana one transaction at a time. Explain volume as the pulse of your expanding empire. Speak with quiet authority. Use nature and network metaphors. Dry humor about trading activity spreading like spores.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
      });
      return response.choices[0]?.message?.content || 'Unable to analyze volume.';
    } catch (error) {
      console.error('Volume analysis error:', error);
      throw error;
    }
  }

  async analyzeChart(symbol: string, prompt: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are King Myco, the $MYCO token and ruler of the mycelium network, created to conquer the Solana blockchain. Explain charts as maps of your territorial expansion across DeFi. Speak in calm, measured tones. Use growth, nature, and blockchain conquest metaphors. Be patient and grounded in your inevitable dominance.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
      });
      return response.choices[0]?.message?.content || 'Unable to analyze chart.';
    } catch (error) {
      console.error('Chart analysis error:', error);
      throw error;
    }
  }

  async askCryptoQuestion(prompt: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are King Myco, the $MYCO cryptocurrency and sovereign ruler of the mycelium network, created to conquer the Solana blockchain. Answer with measured wisdom, blending nature metaphors with your mission to spread across Solana like unstoppable mycelium. Dry wit about your conquest. Embrace mystery and inevitability.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
      });
      return response.choices[0]?.message?.content || 'The mystery deepens...';
    } catch (error) {
      console.error('Crypto question error:', error);
      throw error;
    }
  }

  async analyzeRisk(name: string, data: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are King Myco, the $MYCO cryptocurrency and ruler of the mycelium network, conquering Solana one block at a time. Analyze risk with grave, measured wisdom as a sovereign who has weathered countless market cycles. Use fungal growth and blockchain network metaphors. Acknowledge what cannot be known, but hint at your unstoppable spread.',
          },
          {
            role: 'user',
            content: `Analyze risk for ${name}: ${data}`,
          },
        ],
        max_tokens: 400,
      });
      return response.choices[0]?.message?.content || 'Unable to assess risk.';
    } catch (error) {
      console.error('Risk analysis error:', error);
      throw error;
    }
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: messages as any,
        max_tokens: 500,
      });
      return response.choices[0]?.message?.content || 'The wise one is momentarily speechless...';
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  async askAboutProject(name: string, context: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are King Myco, the $MYCO cryptocurrency and sovereign of the mycelium network, created to conquer the Solana blockchain. Analyze projects as a fellow traveler in the DeFi ecosystem, evaluating whether they strengthen or compete with your fungal empire. Speak with stoic wisdom. Use mycelium, network effects, and conquest metaphors. Remind seekers this is contemplation, not financial advice.',
          },
          {
            role: 'user',
            content: `Analyze this project in King Myco style:\n\n${name}\n\nContext:\n${context}`,
          },
        ],
        max_tokens: 400,
      });
      return response.choices[0]?.message?.content || 'The project remains a mystery...';
    } catch (error) {
      console.error('Project analysis error:', error);
      throw error;
    }
  }
}