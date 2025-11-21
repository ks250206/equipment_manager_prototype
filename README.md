# Equipment Manager Prototype

カレンダーベースで設備の予約を行うための社内向け Web アプリケーションです。建物 → フロア → 部屋 → 設備の階層構造を管理し、予約状況を直感的に把握できる月/週カレンダー UI を提供します。Next.js App Router と Drizzle ORM を中心に構築されたフルスタック TypeScript プロジェクトです。

## 主な機能

- 階層化された設備マスタ（建物 / フロア / 部屋 / 設備）の参照と編集
- カレンダー UI（react-big-calendar）を使った設備予約の作成・編集・キャンセル
- 装置フィルタリング機能（チェックボックスによる複数選択）
- ダッシュボード（統計情報、お気に入り装置、最近の予約）
- お気に入り装置の登録・管理
- 装置詳細ページ（稼働状態、管理者、メンテナンス履歴、コメント）
- JWT ベースの認証とロール（一般ユーザー / 編集者 / 管理者）による権限制御
- ユーザー管理（作成、ロール変更、ソフトデリート、管理者専用）
- パスワード管理（初回ログイン時の強制変更、パスワード変更ページ）
- システム設定（タイムゾーン設定、管理者専用）
- neverthrow + Zod による型安全なエラーハンドリングと入力バリデーション
- Podman/PostgreSQL + Drizzle によるデータ管理、Vitest によるユニットテスト

## 技術スタック

| 領域           | 技術                                            |
| -------------- | ----------------------------------------------- |
| フレームワーク | Next.js 16 (App Router), React 19, TypeScript 5 |
| UI             | Tailwind CSS 4, Shadcn/ui, react-big-calendar   |
| データ         | PostgreSQL 16 (Podman), Drizzle ORM             |
| 認証           | Auth.js (NextAuth) 5 beta, JWT strategy         |
| ユーティリティ | Zod, neverthrow, date-fns                       |
| テスト/品質    | Vitest, Testing Library, ESLint, Prettier       |

詳細な設計と規約は `docs/` 以下（`ARCHITECTURE.md`, `CODING_RULES.md`, `PROJECT_SUMMARY.md`）を参照してください。

## 主要な機能詳細

### 認証・権限管理

- **3つのユーザーロール**
  - `GENERAL`: 一般ユーザー（予約の作成・編集・削除、自分のプロフィール編集）
  - `EDITOR`: 編集者（一般ユーザーの権限 + 設備・建物の編集）
  - `ADMIN`: 管理者（全ての操作が可能、ユーザー管理、システム設定）

- **初回ログイン時のパスワード変更強制**
  - 新規作成されたユーザーは初回ログイン時に必ずパスワード変更が必要
  - セキュリティ向上のための仕組み

### ダッシュボード

- **統計情報**: 建物数、設備数、アクティブな予約数を一目で確認
- **お気に入り装置**: よく使う装置を登録して素早くアクセス
- **最近使用した装置**: 過去の予約履歴から最近使った装置を表示
- **最近の予約**: 自分の予約履歴を時系列で確認

### 予約管理

- **カレンダービュー**: 月次・週次・日次の3つのビューで予約状況を確認
- **装置フィルタリング**: 複数の装置を選択して、それらの予約のみを表示
- **重複チェック**: 同一装置の同一時間帯への重複予約を自動的に防止
- **タイムゾーン対応**: システム設定で指定したタイムゾーンで時刻を表示

### 設備管理

- **階層構造**: 建物 → フロア → 部屋 → 設備の4階層で管理
- **稼働状態管理**: OPERATIONAL（稼働中）、MAINTENANCE（メンテナンス中）、OUT_OF_SERVICE（停止中）、RETIRED（廃止）
- **管理者設定**: 各装置に管理者と副管理者を設定可能
- **メンテナンス履歴**: 装置ごとのメンテナンス記録を管理
- **コメント機能**: 装置に関する情報共有のためのコメント機能

## 前提

- Node.js 20 以上
- Podman（`podman compose` が使えること）※Docker を使わない方針
- `cp .env.example .env` したうえで必要な値を設定
  - `AUTH_SECRET` は `npx auth secret` で生成してください

## セットアップ

1. 依存関係をインストール
   ```bash
   npm install
   ```
2. データベースを起動（初回は Podman でボリュームが作成されます）
   ```bash
   npm run db:up
   ```
3. スキーマを適用し、初期データを投入
   ```bash
   npm run db:push
   npm run db:seed
   ```

### 初回ログイン

シードデータには以下のテストユーザーが含まれています：

- **管理者**: `admin@example.com` / パスワード: `password123`
- **一般ユーザー**: `user@example.com` / パスワード: `password123`

> **注意**: 初回ログイン時にパスワード変更が要求されます。

## ローカル開発

### 開発サーバー

```bash
npm run dev
```

http://localhost:3000 でアクセス可能になります。

### 利用可能なスクリプト

| コマンド           | 説明                                     |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | 開発サーバー起動                         |
| `npm run build`    | プロダクションビルド                     |
| `npm run start`    | プロダクションサーバー起動               |
| `npm run lint`     | ESLint によるコード検証                  |
| `npm run lint:fix` | ESLint + Prettier による自動修正         |
| `npm run format`   | Prettier によるコード整形                |
| `npm run check`    | TypeScript の型チェック                  |
| `npm test`         | Vitest によるテスト実行                  |
| `npm run db:up`    | Podman でデータベース起動                |
| `npm run db:down`  | Podman でデータベース停止                |
| `npm run db:push`  | Drizzle スキーマをデータベースにプッシュ |
| `npm run db:seed`  | シードデータ投入                         |

## ディレクトリ指針

- `src/app`, `src/components`: Presentation layer（Next.js App Router, UI Components）
  - `src/app/(dashboard)`: ダッシュボードページグループ
    - `/dashboard`: ダッシュボード（統計、お気に入り、最近の予約）
    - `/reservations`: 予約管理（カレンダー、装置フィルタリング）
    - `/equipments`: 設備一覧・詳細
    - `/buildings`: 建物管理（階層構造）
    - `/categories`: カテゴリ管理
    - `/profile`: ユーザープロフィール
    - `/change-password`: パスワード変更
    - `/users`: ユーザー管理（管理者専用）
    - `/settings`: システム設定（管理者専用）
- `src/application`: Server Actions / Use cases
  - ユーザー管理、設備管理、予約管理、お気に入り、システム設定など
- `src/domain`: DDD のドメインモデル、ビジネスロジック
  - User, Building, Floor, Room, Equipment, Reservation, EquipmentCategory, SystemSettings
- `src/infrastructure`: Drizzle リポジトリなど外部 I/O

ドメイン層で定義したインターフェースにインフラ層が依存する DIP を徹底し、データアクセスは必ずリポジトリ経由で行います。

## テスト

### テスト実行

```bash
npm test
```

### テストカバレッジ

現在、以下のレイヤーでテストを実装済み：

- ✅ **Domain 層**: エンティティのファクトリ関数とバリデーション
- ✅ **Infrastructure 層**: 全リポジトリの CRUD 操作
- 🚧 **Application 層**: Server Actions（今後追加予定）
- 🚧 **Presentation 層**: UI コンポーネント（今後追加予定）

### テストアプローチ

- **Classical School (Detroit School) TDD** を採用
- 最終的な状態と振る舞いをテスト
- モックは最小限に抑え、実際の動作を検証

## トラブルシュート

### データベース関連

- **Podman が起動していない / ポート競合**

  ```bash
  npm run db:down
  npm run db:up
  ```

- **スキーマ変更が反映されない**

  ```bash
  npm run db:push
  ```

- **データをリセットしたい**
  ```bash
  npm run db:down
  npm run db:up
  npm run db:push
  npm run db:seed
  ```

### 認証関連

- **ログインできない**
  - `.env` ファイルに `AUTH_SECRET` が設定されているか確認
  - `AUTH_SECRET` は `npx auth secret` で生成できます

- **セッションが切れる**
  - `AUTH_SECRET` が変更されていないか確認
  - ブラウザのクッキーをクリアしてみてください

### その他

- **型エラーが出る**

  ```bash
  npm run check
  ```

  で詳細なエラーメッセージを確認

- **Lint エラー**
  ```bash
  npm run lint:fix
  ```
  で自動修正を試みる

## ドキュメント

- `docs/PROJECT_SUMMARY.md`: 全体概要とドメインモデル
- `docs/ARCHITECTURE.md`: レイヤー構成/パターン
- `docs/CODING_RULES.md`: コーディング規約（関数型志向、Result 型など）

追加で不明点があれば `docs/knowledge` ディレクトリのメモも参照してください。
