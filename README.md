# Fish Calendar 🐟

Google カレンダーの予定開始 5 分前に、ブラウザ画面を魚群が横切る Chrome 拡張。

## 機能

- Google カレンダーの予定を自動取得
- 予定開始 5 分前にアクティブなタブを魚群がアニメーションで横切る
- ポップアップから「テスト魚を流す」で即時確認可能

## インストール（開発者向け）

### 1. Google Cloud Console セットアップ

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. 「APIとサービス」→「ライブラリ」→「Google Calendar API」を有効化
3. 「OAuth 同意画面」→「外部」で作成、テストユーザーに自分のGmailを追加
4. 「認証情報」→「OAuthクライアントID」→ アプリ種類: **Chrome 拡張機能** で作成

### 2. manifest.json を更新

```json
"oauth2": {
  "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com"
}
```

### 3. Chrome に読み込む

1. `chrome://extensions/` を開く
2. 「デベロッパーモード」をON
3. 「パッケージ化されていない拡張機能を読み込む」→ このフォルダを選択
4. 表示された拡張IDを Google Cloud Console のクライアント設定「アイテムID」欄に入力して保存

## 使い方

1. ツールバーの 🐟 アイコンをクリック
2. 「Google でログイン」で認証
3. Google カレンダーに予定を入れると、開始 5 分前に自動で魚群が流れる

## Chrome Web Store への公開

1. Google Cloud Console の「OAuth 同意画面」→「アプリを公開」
2. Chrome Web Store [デベロッパーダッシュボード](https://chrome.google.com/webstore/devconsole) で拡張をアップロード（登録料 $5 / 一回のみ）

## ファイル構成

```
chrome-fish-extension/
├── manifest.json
├── background/
│   └── service-worker.js   # カレンダーポーリング・アラーム管理
├── content/
│   ├── fish.js             # Canvas 魚群アニメーション
│   └── fish.css
├── popup/
│   ├── popup.html
│   └── popup.js            # ログイン・次の予定表示
└── assets/
    └── fish.svg
```
