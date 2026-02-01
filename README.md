# 47都道府県 旅行記録&計画 Webアプリ

日本の47都道府県への旅行を記録・計画できるWebアプリケーションです。

## 機能

- **日本地図表示（Google Maps）**: Google Maps上に都道府県を表示し、訪問回数に応じて色が変化
- **訪問記録**: 都道府県への訪問を日付とメモ付きで記録
- **旅行計画（タイムライン）**: 移動手段、宿泊先、観光スポットをタイムライン形式で管理

## 技術スタック

- **Frontend**: React + TypeScript + Vite
- **Backend**: FastAPI + SQLAlchemy
- **Database**: SQLite
- **地図**: Google Maps JavaScript API

## 前提条件

- Node.js 18以上
- Python 3.10以上
- Google Maps API キー

## セットアップ

### 1. Google Maps API キーの取得

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成（または既存のプロジェクトを選択）
3. 「APIとサービス」→「ライブラリ」から **Maps JavaScript API** を有効化
4. 「APIとサービス」→「認証情報」からAPIキーを作成
5. 必要に応じてAPIキーの制限を設定（HTTPリファラー制限など）

### 2. バックエンド

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

バックエンドは http://localhost:8000 で起動します。
API ドキュメントは http://localhost:8000/docs で確認できます。

### 3. フロントエンド

```bash
cd frontend
npm install
```

#### 環境変数の設定

`frontend/.env` ファイルを作成し、Google Maps APIキーを設定：

```
VITE_GOOGLE_MAPS_API_KEY=あなたのAPIキー
```

#### 起動

```bash
npm run dev
```

フロントエンドは http://localhost:5173 で起動します。

## API エンドポイント

### 都道府県

- `GET /api/prefectures` - 都道府県一覧（訪問回数付き）
- `GET /api/prefectures/{id}` - 都道府県詳細

### 訪問記録

- `GET /api/visits` - 訪問記録一覧
- `POST /api/visits` - 訪問記録作成
- `DELETE /api/visits/{id}` - 訪問記録削除

### 旅行計画

- `GET /api/trips` - 旅行計画一覧
- `POST /api/trips` - 旅行計画作成
- `GET /api/trips/{id}` - 旅行計画詳細
- `PUT /api/trips/{id}` - 旅行計画更新
- `DELETE /api/trips/{id}` - 旅行計画削除
- `POST /api/trips/{id}/items` - 計画アイテム追加
- `PUT /api/trips/{id}/items/{item_id}` - アイテム更新
- `DELETE /api/trips/{id}/items/{item_id}` - アイテム削除

## 注意事項

- Google Maps API は使用量に応じて課金される場合があります。[料金ページ](https://developers.google.com/maps/billing-and-pricing/pricing)を確認してください。
- 無料枠（月200ドル分のクレジット）で個人利用には十分対応できます。
