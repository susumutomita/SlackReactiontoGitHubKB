import { AIService } from './ai-service';
import { OpenAIService } from './openai-service';
import { BedrockService } from './bedrock-service';
import { OllamaService } from './ollama-service';
import { AIConfig, AIProvider } from '../config/types';

/**
 * AIサービスのファクトリークラス
 * 設定に基づいて適切なAIサービス実装を提供する
 */
export class AIServiceFactory {
  /**
   * 設定に基づいて適切なAIサービスを作成する
   * @param config AIの設定
   * @returns AIサービスのインスタンス
   */
  static createService(config: AIConfig): AIService {
    switch (config.provider) {
      case 'openai':
        return new OpenAIService(config);
      case 'bedrock':
        return new BedrockService(config);
      case 'ollama':
        return new OllamaService(config);
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  }

  /**
   * 利用可能なAIプロバイダーのリストを取得する
   * @returns 利用可能なAIプロバイダーのリスト
   */
  static getAvailableProviders(): AIProvider[] {
    return ['openai', 'bedrock', 'ollama'];
  }

  /**
   * プロバイダーごとのデフォルトモデル名を取得する
   * @param provider AIプロバイダー
   * @returns デフォルトのモデル名
   */
  static getDefaultModelForProvider(provider: AIProvider): string {
    switch (provider) {
      case 'openai':
        return 'gpt-3.5-turbo';
      case 'bedrock':
        return 'anthropic.claude-v2';
      case 'ollama':
        return 'llama2';
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }
}
