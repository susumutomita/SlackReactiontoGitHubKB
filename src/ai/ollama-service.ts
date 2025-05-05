import axios from 'axios';
import { AIService } from './ai-service';
import { AIConfig } from '../config/types';

/**
 * Ollamaローカルモデルを使った要約サービスの実装
 */
export class OllamaService implements AIService {
  private config: AIConfig;
  private baseURL: string;

  constructor(config: AIConfig) {
    this.config = config;
    this.baseURL = config.baseURL || 'http://localhost:11434';
  }

  /**
   * テキストを要約する
   * @param text 要約するテキスト
   * @returns 要約されたテキスト
   */
  async summarizeText(text: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseURL}/api/generate`, {
        model: this.config.model,
        prompt: `あなたは要約エキスパートです。以下のSlackの会話を5つの重要ポイントにまとめてください。\n\n${text}`,
        options: {
          temperature: this.config.temperature || 0.7,
        },
        stream: false
      });

      if (response.data && response.data.response) {
        return response.data.response.trim();
      }

      return '要約に失敗しました';
    } catch (error) {
      console.error('Ollama API error:', error);
      throw new Error(`Ollama要約エラー: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 設定が有効かを確認
   */
  async validateConfig(): Promise<boolean> {
    try {
      // Ollamaサーバーが動作しているかを確認
      const response = await axios.get(`${this.baseURL}/api/tags`);
      // モデルが利用可能かを確認
      const models = response.data.models;
      return Array.isArray(models) && models.some(model => model.name === this.config.model);
    } catch (error) {
      console.error('Ollama connectivity check failed:', error);
      return false;
    }
  }
}
