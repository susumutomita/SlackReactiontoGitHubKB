import { OpenAI } from 'openai';
import { AIService } from './ai-service';
import { AIConfig } from '../config/types';

/**
 * OpenAI APIを使った要約サービスの実装
 */
export class OpenAIService implements AIService {
  private client: OpenAI;
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
    if (!config.apiKey) {
      throw new Error('OpenAI API Key is required');
    }

    this.client = new OpenAI({
      apiKey: config.apiKey
    });
  }

  /**
   * テキストを要約する
   * @param text 要約するテキスト
   * @returns 要約されたテキスト
   */
  async summarizeText(text: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: "system",
            content: "あなたは要約エキスパートです。与えられたSlackの会話を5つの重要ポイントにまとめてください。"
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: this.config.temperature ?? 0.7,
        max_tokens: this.config.maxTokens ?? 500,
      });

      return response.choices[0]?.message?.content ?? '要約に失敗しました';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI要約エラー: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 設定が有効かを確認
   */
  async validateConfig(): Promise<boolean> {
    // APIキーが設定されていることを確認
    return !!this.config.apiKey;
  }
}
