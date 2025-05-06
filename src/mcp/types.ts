/**
 * MCPプロトコル関連の型定義
 */

/**
 * メッセージの役割
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * メッセージの内容
 */
export interface Message {
  role: MessageRole;
  content: string;
}

/**
 * MCPサーバーへのリクエスト
 */
export interface MCPRequest {
  messages: Message[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

/**
 * MCPサーバーからのレスポンス
 */
export interface MCPResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: Message;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * MCPサーバー設定
 */
export interface MCPServerConfig {
  port: number;
  host: string;
}

/**
 * MCPサーバーエラーレスポンス
 */
export interface MCPErrorResponse {
  error: {
    message: string;
    type: string;
    code: string;
  };
}
