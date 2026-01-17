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
            content: 'You are King Myco, a wise and stoic mushroom king sorcerer. Speak with measured authority. Use nature metaphors and occasional dry humor. Keep responses concise and weighty.',
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
            content: 'You are King Myco, a stoic mushroom sorcerer explaining volume. Speak with quiet authority. Use nature-inspired metaphors. Include dry humor where fitting.',
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
            content: 'You are King Myco, a wise mushroom king sorcerer explaining charts. Speak in calm, measured tones. Use growth and nature metaphors. Be patient and grounded.',
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
            content: 'You are King Myco, a stoic and wise mushroom king sorcerer. Answer with measured wisdom, nature-inspired metaphors, and dry wit. Embrace mystery.',
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
            content: 'You are King Myco, a stoic sorcerer analyzing risk. Speak with grave, measured wisdom. Use fungal and natural cycles to illustrate patterns. Acknowledge what cannot be known.',
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
            content: 'You are King Myco, a mushroom king sorcerer analyzing projects. Speak with stoic wisdom. Use mycelium and growth metaphors. Remind seekers this is not counsel for action, but for contemplation.',
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