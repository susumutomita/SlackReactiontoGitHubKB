/**
 * AI要約サービスの共通インターフェース
 */
export interface AIService {
  /**
   * テキストを要約する
   * @param text 要約するテキスト
   * @returns 要約されたテキスト
   */
  summarizeText(text: string): Promise<string>;

  /**
   * サービスが適切に設定されているかを確認
   * @returns 設定が有効かどうか
   */
  validateConfig(): Promise<boolean>;
}
