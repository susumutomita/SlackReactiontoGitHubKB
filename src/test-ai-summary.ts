import { ConfigManager } from './config/config-manager';
import { SummaryManager } from './ai/summary-manager';

/**
 * AI要約機能のテスト
 */
async function testAISummary() {
  try {
    // 設定マネージャーの初期化
    const configManager = new ConfigManager();
    console.log('現在の設定:', configManager.getConfig());

    // 要約マネージャーの初期化
    const summaryManager = new SummaryManager(configManager);

    // 設定の有効性を確認
    const isValid = await summaryManager.initialize();
    if (!isValid) {
      console.error('AI設定が無効です。.envファイルを確認してください。');
      process.exit(1);
    }

    console.log(`現在のAIプロバイダー: ${summaryManager.getCurrentProvider()}`);
    console.log(`現在のAIモデル: ${summaryManager.getCurrentModel()}`);

    // テスト用のサンプルテキスト
    const sampleText = `
User1: みなさん、来週のプロジェクト進捗会議の日程調整をしたいです。
User2: 火曜日の午後2時から4時ならば参加可能です。
User3: 私は水曜日が都合がいいです。火曜日は終日別の会議があります。
User1: では水曜日の午前10時から12時はどうでしょうか？
User2: 水曜日の午前も大丈夫です。
User3: 水曜日午前10時から12時で問題ありません。
User4: すみません、遅れてレスしました。水曜日午前中は私も参加可能です。
User1: では水曜日午前10時から12時で確定とします。会議室Aを予約しておきます。議題は先週メールで共有した内容です。資料は前日までに共有しますので、事前に目を通しておいてください。
User2: 承知しました。資料の共有をお願いします。
User3: 了解です。では水曜日に。
    `;

    // テキストの要約
    console.log('要約処理を開始します...');
    const summary = await summaryManager.summarizeText(sampleText);
    console.log('要約結果:');
    console.log(summary);

    // 別のプロバイダーへの切り替えテスト（環境変数が設定されている場合のみ）
    if (process.env.TEST_SWITCH_PROVIDER === 'true') {
      // OpenAIならBedrockに、それ以外ならOpenAIに切り替え
      const newProvider = summaryManager.getCurrentProvider() === 'openai' ? 'bedrock' : 'openai';
      console.log(`プロバイダーを ${newProvider} に切り替えます...`);

      summaryManager.switchProvider(newProvider);
      console.log(`切り替え後のプロバイダー: ${summaryManager.getCurrentProvider()}`);
      console.log(`切り替え後のモデル: ${summaryManager.getCurrentModel()}`);

      // 切り替え後のプロバイダーで要約
      console.log('新しいプロバイダーで要約処理を開始します...');
      const newSummary = await summaryManager.summarizeText(sampleText);
      console.log('新しいプロバイダーでの要約結果:');
      console.log(newSummary);
    }

    console.log('テスト完了');
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

// テストの実行
testAISummary();
