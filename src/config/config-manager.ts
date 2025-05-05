import * as dotenv from 'dotenv';
import { Config, AIConfig } from './types';
import { defaultConfig } from './defaults';

dotenv.config();

/**
 * 設定を管理するクラス
 */
export class ConfigManager {
  private config: Config;

  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * 設定を読み込む
   */
  private loadConfig(): Config {
    const config = { ...defaultConfig };

    // 環境変数から設定を上書き
    if (process.env.AI_PROVIDER) {
      config.ai.provider = process.env.AI_PROVIDER as any;
    }

    if (process.env.AI_MODEL) {
      config.ai.model = process.env.AI_MODEL;
    }

    if (process.env.AI_TEMPERATURE) {
      config.ai.temperature = parseFloat(process.env.AI_TEMPERATURE);
    }

    if (process.env.AI_MAX_TOKENS) {
      config.ai.maxTokens = parseInt(process.env.AI_MAX_TOKENS, 10);
    }

    // プロバイダー固有の設定
    switch (config.ai.provider) {
      case 'openai':
        config.ai.apiKey = process.env.OPENAI_API_KEY;
        break;
      case 'bedrock':
        config.ai.region = process.env.AWS_REGION || 'us-east-1';
        break;
      case 'ollama':
        config.ai.baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        break;
    }

    return config;
  }

  /**
   * AIの設定を取得
   */
  getAIConfig(): AIConfig {
    return this.config.ai;
  }

  /**
   * 設定全体を取得
   */
  getConfig(): Config {
    return this.config;
  }
}
