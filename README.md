# SlackReactiontoGitHubKB

Slackの会話スレッドを自動的に要約し、GitHubナレッジベースとして保存するツール。

## 機能

- 📝リアクションをトリガーにSlackスレッドを取得
- 複数のAIプロバイダーによる要約
  - OpenAI API
  - Amazon Bedrock
  - Ollamaローカルモデル
- GitHubリポジトリへのナレッジベース自動コミット
- Model Context Protocol (MCP) サーバー機能（公式SDK対応）

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/susumutomita/SlackReactiontoGitHubKB.git
cd SlackReactiontoGitHubKB

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.template .env
# .envファイルを編集して必要な設定を行う
```

## 使用方法

### AI要約エンジンのテスト

```bash
npm run test:ai
```

### MCPサーバーの起動

```bash
# HTTPモード（デフォルト）
npm run start

# 標準入出力（stdio）モード - VSCodeなどのツールと連携する場合に使用
npm run start:stdio

# 開発モード（コード変更時に自動再起動）
npm run dev
```

## MCPサーバーAPI

公式のModel Context Protocol SDKを使用したサーバーで、以下のツールを提供します：

### summarizeText

テキストを要約するツール。

**使用例:**

```json
{
  "text": "要約するテキスト...",
  "systemPrompt": "オプションのシステムプロンプト"
}
```

### switchModel

AIプロバイダーとモデルを切り替えるツール。

**使用例:**

```json
{
  "provider": "openai", // "openai", "bedrock", "ollama"のいずれか
  "model": "gpt-4" // オプション
}
```

## 設定

`.env`ファイルで以下の設定が可能です：

### AI設定

- `AI_PROVIDER`: 使用するAIプロバイダー ('openai', 'bedrock', 'ollama')
- `AI_MODEL`: 使用するモデル名
- `AI_TEMPERATURE`: 生成の多様性 (0-1)
- `AI_MAX_TOKENS`: 生成する最大トークン数

### MCPサーバー設定

- `MCP_PORT`: MCPサーバーのポート番号 (デフォルト: 3000)
- `MCP_HOST`: MCPサーバーのホスト名 (デフォルト: localhost)

## ライセンス

MIT
