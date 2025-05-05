export type AIProvider = 'openai' | 'bedrock' | 'ollama';

export interface AIConfig {
  provider: AIProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string; // OpenAI用
  baseURL?: string; // Ollama用
  region?: string; // AWSのリージョン（Bedrock用）
}

export interface Config {
  ai: AIConfig;
}
