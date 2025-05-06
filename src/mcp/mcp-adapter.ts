import { SummaryManager } from '../ai/summary-manager';
import { ConfigManager } from '../config/config-manager';
import { Message, MCPRequest, MCPResponse } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * AIサービスとMCPプロトコル間のアダプター
 */
export class MCPAdapter {
  private summaryManager: SummaryManager;

  constructor(configManager: ConfigManager) {
    this.summaryManager = new SummaryManager(configManager);
  }

  /**
   * MCPリクエストを処理し、レスポンスを生成する
   * @param request MCPリクエスト
   * @returns MCPレスポンス
   */
  async processRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      // リクエストから必要な情報を抽出
      const messages = request.messages || [];
      const model = request.model || this.summaryManager.getCurrentModel();
      const temperature = request.temperature;
      const maxTokens = request.max_tokens;

      // モデルが指定されている場合は切り替え
      if (request.model && this.summaryManager.getCurrentModel() !== request.model) {
        // モデル名からプロバイダーを推測
        const provider = this.guessProviderFromModel(request.model);
        this.summaryManager.switchProvider(provider, request.model);
      }

      // メッセージから処理するテキストを作成
      const userMessages = messages
        .filter(message => message.role === 'user')
        .map(message => message.content)
        .join('\n\n');

      // システムメッセージがあれば取得
      const systemMessage = messages.find(message => message.role === 'system')?.content || '';

      // 要約を実行
      const context = systemMessage ? `${systemMessage}\n\n${userMessages}` : userMessages;
      const summary = await this.summaryManager.summarizeText(context);

      // MCPレスポンスを生成
      const response: MCPResponse = {
        id: `chatcmpl-${uuidv4()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: this.summaryManager.getCurrentModel(),
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: summary
            },
            finish_reason: 'stop'
          }
        ],
        usage: {
          // 正確なトークン数計算は難しいため、簡易的な推定値
          prompt_tokens: this.estimateTokenCount(context),
          completion_tokens: this.estimateTokenCount(summary),
          total_tokens: this.estimateTokenCount(context) + this.estimateTokenCount(summary)
        }
      };

      return response;
    } catch (error) {
      console.error('MCP処理エラー:', error);
      throw error;
    }
  }

  /**
   * モデル名からプロバイダーを推測する
   * @param model モデル名
   * @returns 推測されたプロバイダー
   */
  private guessProviderFromModel(model: string): string {
    if (model.startsWith('gpt') || model.includes('openai')) {
      return 'openai';
    } else if (model.includes('claude') || model.includes('titan') || model.includes('bedrock')) {
      return 'bedrock';
    } else {
      return 'ollama';
    }
  }

  /**
   * テキストのトークン数を簡易的に推定する
   * @param text 推定対象のテキスト
   * @returns 推定されたトークン数
   */
  private estimateTokenCount(text: string): number {
    // 簡易的な推定: 単語数をスペースと句読点で分割して数える
    return text.split(/[\s,.!?;:'"()\[\]{}]/).filter(Boolean).length;
  }

  /**
   * サービスを初期化
   */
  async initialize(): Promise<boolean> {
    return await this.summaryManager.initialize();
  }
}
