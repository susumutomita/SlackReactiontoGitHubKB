import { Config } from './types';

export const defaultConfig: Config = {
  ai: {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 500
  }
};
