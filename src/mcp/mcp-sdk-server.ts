import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { HttpServerTransport } from "@modelcontextprotocol/sdk/server/http.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ConfigManager } from "../config/config-manager";
import { SummaryManager } from "../ai/summary-manager";
import dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config();

/**
 * AI要約ツールのMCPサーバー実装
 */
export async function createMcpSdkServer() {
  // 設定マネージャーの初期化
  const configManager = new ConfigManager();
  const summaryManager = new SummaryManager(configManager);

  // サーバーのインスタンス作成
  const server = new McpServer({
    name: "SlackReactionToGitHubKB",
    version: "1.0.0",
  });

  // AIサービスの初期化
  await summaryManager.initialize();

  // ヘルプメッセージ
  server.systemMessage(`
    このAIは要約のエキスパートです。Slackの会話スレッドや長いテキストを簡潔に要約することができます。

    使い方：
    - summarizeText: テキストを要約します
    - 使用可能なAIモデル: ${summaryManager.getCurrentModel()}
  `);

  // テキスト要約ツールの登録
  server.tool(
    "summarizeText",
    "テキストを要約します",
    {
      text: z.string().min(1).describe("要約するテキスト"),
      systemPrompt: z.string().optional().describe("オプションのシステムプロンプト")
    },
    async ({ text, systemPrompt }) => {
      try {
        // システムプロンプトがあればそれを含めて要約
        const contextToSummarize = systemPrompt
          ? `${systemPrompt}\n\n${text}`
          : text;

        const summary = await summaryManager.summarizeText(contextToSummarize);

        return {
          content: [{
            type: "text",
            text: summary
          }],
        };
      } catch (error) {
        console.error("要約処理中にエラーが発生しました:", error);
        throw new Error(`要約エラー: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );

  // モデル切り替えツールの登録
  server.tool(
    "switchModel",
    "使用するAIモデルを切り替えます",
    {
      provider: z.enum(["openai", "bedrock", "ollama"]).describe("プロバイダー名"),
      model: z.string().optional().describe("モデル名")
    },
    async ({ provider, model }) => {
      try {
        summaryManager.switchProvider(provider, model);
        return {
          content: [{
            type: "text",
            text: `AIプロバイダーを ${provider} に切り替えました。現在のモデル: ${summaryManager.getCurrentModel()}`
          }],
        };
      } catch (error) {
        console.error("モデル切り替え中にエラーが発生しました:", error);
        throw new Error(`切り替えエラー: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );

  return server;
}

/**
 * HTTPモードでMCPサーバーを実行
 */
export async function startHttpMcpServer() {
  try {
    const server = await createMcpSdkServer();
    const port = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT, 10) : 3000;
    const host = process.env.MCP_HOST || 'localhost';

    // HTTPトランスポートの作成と接続
    const transport = new HttpServerTransport({
      host: host,
      port: port,
    });

    await server.connect(transport);
    console.log(`MCP Server running on http://${host}:${port}`);
  } catch (error) {
    console.error("MCPサーバー起動エラー:", error);
    process.exit(1);
  }
}

/**
 * 標準入出力モードでMCPサーバーを実行
 */
export async function startStdioMcpServer() {
  try {
    const server = await createMcpSdkServer();
    const transport = new StdioServerTransport();

    await server.connect(transport);
    console.error("MCP Server running on stdio");
  } catch (error) {
    console.error("Fatal error in stdio MCP server:", error);
    process.exit(1);
  }
}

// コマンドライン引数で実行モードを指定（デフォルトはHTTP）
if (require.main === module) {
  const mode = process.argv[2] || 'http';
  if (mode === 'stdio') {
    startStdioMcpServer();
  } else {
    startHttpMcpServer();
  }
}
