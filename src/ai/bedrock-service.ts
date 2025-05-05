import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { AIService } from './ai-service';
import { AIConfig } from '../config/types';

/**
 * AWS Bedrock APIを使った要約サービスの実装
 */
export class BedrockService implements AIService {
  private client: BedrockRuntimeClient;
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
    this.client = new BedrockRuntimeClient({
      region: this.config.region || 'us-east-1'
    });
  }

  /**
   * テキストを要約する
   * @param text 要約するテキスト
   * @returns 要約されたテキスト
   */
  async summarizeText(text: string): Promise<string> {
    try {
      // モデルIDに基づいて適切なリクエスト形式を選択
      const modelId = this.config.model;
      let requestBody: any;

      if (modelId.includes('anthropic.claude')) {
        // Claude系モデル用のリクエスト形式
        requestBody = {
          prompt: `\n\nHuman: あなたは要約エキスパートです。以下のSlackの会話を5つの重要ポイントにまとめてください。\n\n${text}\n\nAssistant:`,
          max_tokens_to_sample: this.config.maxTokens || 500,
          temperature: this.config.temperature || 0.7,
        };
      } else if (modelId.includes('amazon.titan')) {
        // Amazon Titan系モデル用のリクエスト形式
        requestBody = {
          inputText: `あなたは要約エキスパートです。以下のSlackの会話を5つの重要ポイントにまとめてください。\n\n${text}`,
          textGenerationConfig: {
            maxTokenCount: this.config.maxTokens || 500,
            temperature: this.config.temperature || 0.7,
          }
        };
      } else {
        throw new Error(`Unsupported Bedrock model: ${modelId}`);
      }

      const command = new InvokeModelCommand({
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(requestBody)
      });

      const response = await this.client.send(command);

      // レスポンスのデコード
      const responseBody = new TextDecoder().decode(response.body);
      const parsedResponse = JSON.parse(responseBody);

      // モデル固有のレスポンス形式からコンテンツを抽出
      let summary = '';
      if (modelId.includes('anthropic.claude')) {
        summary = parsedResponse.completion;
      } else if (modelId.includes('amazon.titan')) {
        summary = parsedResponse.results?.[0]?.outputText;
      }

      return summary || '要約に失敗しました';
    } catch (error) {
      console.error('Bedrock API error:', error);
      throw new Error(`Bedrock要約エラー: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 設定が有効かを確認
   */
  async validateConfig(): Promise<boolean> {
    // AWS認証情報は環境変数または IAM ロールで設定されることを期待
    return true;
  }
}
