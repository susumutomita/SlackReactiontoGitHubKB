import { startHttpMcpServer, startStdioMcpServer } from './mcp/mcp-sdk-server';
import dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config();

/**
 * MCP SDKサーバーを起動するメインエントリーポイント
 *
 * 使用方法:
 * - HTTP モード: ts-node src/mcp-sdk-server.ts http
 * - STDIO モード: ts-node src/mcp-sdk-server.ts stdio
 */
async function main() {
  try {
    const mode = process.argv[2] || 'http';

    if (mode === 'stdio') {
      console.error('Starting MCP server in STDIO mode...');
      await startStdioMcpServer();
    } else {
      console.log('Starting MCP server in HTTP mode...');
      await startHttpMcpServer();
    }
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

main();
