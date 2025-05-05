import { AIServiceFactory } from './ai-service-factory';
import { AIService } from './ai-service';
import { ConfigManager } from '../config/config-manager';

/**
 * AI要約機能を管理するクラス
 * 設定に基づいて適切なAIプロバイダーを使用し、テキストの要約を行う
 */
export class SummaryManager {
  private aiService: AIService;
  private configManager: ConfigManager;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
    const aiConfig = this.configManager.getAIConfig();
    this.aiService = AIServiceFactory.createService(aiConfig);
  }

  /**
   * AIサービスを初期化し、設定の有効性を確認する
   */
  async initialize(): Promise<boolean> {
    try {
      const isValid = await this.aiService.validateConfig();
      if (!isValid) {
        console.error('AI設定が無効です。設定を確認してください。');
      }
      return isValid;
    } catch (error) {
      console.error('AIサービスの初期化に失敗しました:', error);
      return false;
    }
  }

  /**
   * テキストを要約する
   * @param text 要約するテキスト
   * @returns 要約されたテキスト
   */
  async summarizeText(text: string): Promise<string> {
    try {
      return await this.aiService.summarizeText(text);
    } catch (error) {
      console.error('テキスト要約エラー:', error);
      throw new Error(`要約処理中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 別のAIプロバイダーに切り替える
   * @param provider 新しいAIプロバイダー名
   * @param model オプションの新しいモデル名
   */
  switchProvider(provider: string, model?: string): void {
    try {
      const aiConfig = this.configManager.getAIConfig();
      aiConfig.provider = provider as any;

      if (model) {
        aiConfig.model = model;
      } else {
        // プロバイダに対応するデフォルトモデルを設定
        aiConfig.model = AIServiceFactory.getDefaultModelForProvider(provider as any);
      }

      this.aiService = AIServiceFactory.createService(aiConfig);
    } catch (error) {
      console.error('AIプロバイダーの切り替えに失敗しました:', error);
      throw new Error(`プロバイダー切り替えエラー: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 現在のAIプロバイダー名を取得
   */
  getCurrentProvider(): string {
    return this.configManager.getAIConfig().provider;
  }

  /**
   * 現在のAIモデル名を取得
   */
  getCurrentModel(): string {
    return this.configManager.getAIConfig().model;
  }
}
