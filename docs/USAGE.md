# comimi — 使い方

`@yui540/comimi` のフルリファレンスです。簡単な概要はリポジトリトップの `README.md` を参照してください。

## インストール

```sh
npm install @yui540/comimi
```

```ts
import { createMangaViewer } from "@yui540/comimi";
```

CDN 利用時は `dist/manga-viewer.global.js` を読み込み、`window.MangaViewer.createMangaViewer(...)` を呼び出してください。

## クイックスタート

```ts
import { createMangaViewer } from "@yui540/comimi";

const viewer = createMangaViewer(document.querySelector("#viewer")!, {
  manga: {
    id: "sample",
    title: "モノクロ世界にようこそ",
    author: "yui540",
    pages: [
      { id: "p0", type: "image", src: "/pages/0.webp" },
      { id: "p1", type: "image", src: "/pages/1.webp" },
      { id: "p2", type: "image", src: "/pages/2.webp" }
    ]
  },
  locale: "ja",
  settings: {
    layoutMode: "inline",
    readingDirection: "rtl",
    hasCover: true
  },
  events: {
    pageChange: ({ pageIndex }) => console.log("page", pageIndex + 1)
  }
});

viewer.nextPage();
viewer.goToPage(10);
viewer.destroy();
```

## API

### `createMangaViewer(container, options)`

`container` 内にビューワーをマウントして `MangaViewerInstance` を返します。`container` の既存の子要素はライブラリが生成するDOMに置き換えられます。

```ts
interface MangaViewerInstance {
  destroy(): void;
  setManga(manga: Manga): Promise<void>;
  setPages(pages: MangaPage[]): Promise<void>;
  getState(): Readonly<ViewerState>;
  updateSettings(settings: Partial<ViewerSettings>): Promise<void>;
  goToPage(pageIndex: number): void;
  nextPage(): void;
  previousPage(): void;
  toggleOverlay(force?: boolean): void;
  toggleAutoPageTurn(): void;
  toggleFullscreen(): Promise<void>;
  on<T extends ViewerEventName>(
    eventName: T,
    handler: ViewerEventHandler<T>
  ): () => void;
}
```

### オプション

```ts
interface MangaViewerOptions {
  manga: Manga;
  initialPageIndex?: number;
  locale?: string;          // "ja" | "en" | "zh-CN" | "ko" | "th" | "id"、または独自キー
  translations?: TranslationMap;
  settings?: Partial<ViewerSettings>;
  storage?: { enabled?: boolean; databaseName?: string };
  className?: string;
  events?: Partial<{
    ready: (e: { manga: Manga }) => void;
    pageChange: (e: { pageIndex: number; page: MangaPage }) => void;
    settingsChange: (e: { settings: ViewerSettings }) => void;
    layoutChange: (e: { layoutMode: LayoutMode }) => void;
    destroy: () => void;
  }>;
  resolvePageSrc?: (ctx: {
    page: ImagePage;
    pageIndex: number;
    isSpread: boolean;
  }) => string | Promise<string>;
  lockLayoutMode?: boolean;
  mascot?:
    | { src: string; alt?: string }
    | { render: () => HTMLElement }
    | false;
  forceSettings?: (keyof ViewerSettings)[];   // 保存値より初期値を優先するキー
  hiddenSettings?: HideableControl[];          // 非表示にする UI 項目
}

type HideableControl =
  // 設定パネルの各項目
  | "locale"
  | "cover"
  | "direction"
  | "interval"
  | "backgroundColor"
  // ツールバーの操作
  | "pageMode"
  | "autoplay"
  | "viewMode";
```

## ページ

```ts
type MangaPage = ImagePage | HtmlPage;

interface ImagePage {
  id: string;
  type: "image";
  src: string;
  thumbnailSrc?: string;
  width?: number;
  height?: number;
  alt?: string;
  label?: string;
}

interface HtmlPage {
  id: string;
  type: "html";
  html: string;       // 文字列。innerHTML としてそのまま挿入される
  sandbox?: string;   // iframe を含む場合に指定推奨
  aspectRatio?: number;
  label?: string;
}
```

`id` は画像要素のキャッシュと進捗保存のキーに使われるので、安定した値を渡してください。

## 設定

| フィールド | デフォルト | 説明 |
|---|---|---|
| `locale` | `"ja"` | UI言語 |
| `hasCover` | `true` | 表紙ありモード（見開き時、1ページ目を単独表示） |
| `readingDirection` | `"rtl"` | `"rtl"`（右→左、日本語漫画）/ `"ltr"` |
| `pageTurnMode` | `"single"` | `"single"` / `"spread"`（2ページ見開き） |
| `layoutMode` | `"inline"` | `"inline"`, `"wide"`, `"browserFullscreen"`, `"nativeFullscreen"` |
| `autoPageTurnIntervalMs` | `5000` | 自動再生の間隔 (ms) |
| `backgroundColor` | `"white"` | `"white"` / `"black"`（ビューワー本体の背景色） |
| `zoom.min` / `.max` / `.step` | `1` / `4` / `0.25` | ズームの範囲とステップ |

## レイアウトモード

| モード | 挙動 |
|---|---|
| `inline` | 親要素内に収まる（デスクトップ max 900px / モバイル max 500px）。アスペクト比固定・角丸・薄影あり |
| `wide` | 横幅100%、下のハンドルをドラッグして高さ可変 |
| `browserFullscreen` | `position: fixed; inset: 0` — Fullscreen API を使わずブラウザいっぱいに表示 |
| `nativeFullscreen` | Fullscreen API を使用。失敗時は `browserFullscreen` にフォールバック |

### レイアウトモードを固定する

`lockLayoutMode: true` を渡すと、`settings.layoutMode` で指定したモードに固定されます。

- 表示モード切替の UI（コントロールドックの switcher）を非表示
- メニュー > キーボードショートカット一覧から「表示モード」セクションを非表示
- キーボードの `N` / `W` / `F` / `Esc` のレイアウト変更系を無効化
- `viewer.toggleFullscreen()` / `updateSettings({ layoutMode })` も noop
- IndexedDB に保存された前回の `layoutMode` も無視され、必ず `settings.layoutMode` が適用される

例: 全画面で固定（DRM ビューワー組み込みや単機能ページ向け）

```ts
createMangaViewer(container, {
  manga,
  settings: { layoutMode: "browserFullscreen" },
  lockLayoutMode: true
});
```

## UI 項目を非表示にする

`hiddenSettings` に項目のキーを並べると、その UI の操作を無効化できます。設定パネルの各行と、ツールバーの操作の両方を個別に制御できます。

**設定パネルの項目とツールバーの操作で挙動が異なります。**

- **設定パネルの行**（`locale` / `cover` / `direction` / `interval` / `backgroundColor`）に指定すると、編集 UI の代わりに**現在の値を読み取り専用で静的表示**します。値の確認はできますが、変更はできません。
- **ツールバーの操作**（`pageMode` / `autoplay` / `viewMode`）に指定すると、その UI を**出さなく**します。

| キー | 効果 |
|---|---|
| `locale` | 設定パネル: 言語を読み取り専用表示 |
| `cover` | 設定パネル: 表紙ありを読み取り専用表示 |
| `direction` | 設定パネル: 読み方向を読み取り専用表示 |
| `interval` | 設定パネル: 自動再生間隔を読み取り専用表示 |
| `backgroundColor` | 設定パネル: 背景色を読み取り専用表示 |
| `pageMode` | ツールバー: 1ページ / 見開き切替を非表示 |
| `autoplay` | ツールバー: 自動再生ボタンを非表示 |
| `viewMode` | ツールバー: 表示モード切替（switcher）を非表示 |

```ts
createMangaViewer(container, {
  manga,
  hiddenSettings: ["locale", "backgroundColor", "autoplay"]
});
```

- 設定パネルの行は読み取り専用になっても表示されたままなので、設定ボタン（歯車）は常に表示されます。
- `viewMode` は `lockLayoutMode: true` でも非表示になります（こちらはキーボードショートカットも無効化する点が異なります）。
- `pageMode` / `autoplay` を隠してもキーボードショートカット（`P` / `A`）は引き続き有効です。UI だけを隠す指定です。

## キーボードショートカット

ビューワーのルート要素にフォーカスがある時のみ有効です。

| キー | 動作 |
|---|---|
| `←` / `Space` | 左に移動（`readingDirection` に応じて前/次ページ） |
| `→` / `Shift+Space` | 右に移動 |
| `A` | 自動再生のトグル |
| `N` / `Esc` | レイアウト: 標準 (inline) |
| `W` | レイアウト: ワイド (wide) |
| `F` | レイアウト: 全画面 (browserFullscreen) |
| `P` | 1ページ ↔ 見開きの切替 |
| `M` | メニューパネルのトグル |
| `O` | オーバーレイ表示のトグル |
| `S` | 設定パネルのトグル |

## ジェスチャー

- 中央 40% のクリック / タップ: オーバーレイの表示切替
- 左 30% / 右 30% のクリック / タップ（オーバーレイ閉時のみ）: 前 / 次ページ（`readingDirection` に応じて向きが変わる）。アニメーションなしで即時切替
- 左右ボタン / キーボード（←→Space）: 同じく即時切替
- スワイプ / ドラッグ: ページ移動。しきい値 40px、横方向優先。**こちらは常にスライドアニメーションする**
- ピンチ: ズーム（`zoom.min`〜`zoom.max` でクランプ）
- Ctrl / ⌘ + マウスホイール: ズーム（PC向け）。**カーソル直下の点を中心にズーム**し、見開き時は**カーソルが乗っているページだけ**ズームする
- ズーム中のドラッグ: パン（ページの範囲内にクランプ）

## 永続化 (IndexedDB)

`storage.enabled` を `false` にしない限り、`indexedDB` が利用可能な環境では以下を自動で保存します。

- 全体設定（locale, readingDirection, hasCover, pageTurnMode, autoPageTurnIntervalMs, backgroundColor）
- 現在のレイアウトモードと wide の高さ
- 漫画ごとの現在ページ（`manga.id` をキーに保存）

データベース名は既定で `manga-viewer`。`storage.databaseName` で上書きできます。

### 一部の設定だけ初期値を保存値より優先する

通常 `settings` は「保存値がまだ無いときに使われる初期値（シード）」で、IndexedDB に保存済みの設定があればそちらが優先されます。`forceSettings` にキーを挙げると、**そのキーだけ**保存値を無視して常に初期値（`settings` の値、無ければ `defaults`）を適用します。挙げなかったキーは従来どおりシードのままです。

```ts
createMangaViewer(container, {
  manga,
  settings: {
    readingDirection: "ltr", // 強制したい
    backgroundColor: "black" // シード（保存値があればそちらが勝つ）
  },
  forceSettings: ["readingDirection"] // このキーだけ保存値より優先
});
```

| キー | 挙動 |
|---|---|
| `forceSettings` に挙げたキー | `settings` の値が常に勝つ（保存値を無視） |
| 挙げていないキー | シード（保存値があればそちらが勝つ） |

- `settings` はそのまま値の供給源として使い、`forceSettings` は優先度だけを切り替えます。
- `"layoutMode"` を挙げた場合、保存済みのレイアウトモードも無視されます（wide の高さは別途復元されます）。

## i18n

ビルトインのロケールは `ja` / `en` / `zh-CN` / `ko` / `th` / `id` です。`translations` オプションでキーを上書き／追加できます。

```ts
createMangaViewer(container, {
  manga,
  locale: "fr",
  translations: {
    "overlay.settings": "Réglages",
    "settings.cover": "Couverture"
    // 上書きしたいキーだけでOK
  }
});
```

全キーは `locales/ja.json` を参照してください。未定義キーは `ja` → キー文字列自体、の順でフォールバックします。

## ページソースの解決（DRM / 認証付き取得）

`resolvePageSrc` オプションを渡すと、各ページ画像の `src` を確定する直前にあなたの関数が呼ばれ、戻り値の文字列が `<img>` の `src` に使われます。Data URL / Blob URL / 通常 URL のいずれも返せます。

```ts
type PageSrcResolver = (ctx: {
  page: ImagePage;
  pageIndex: number;
  isSpread: boolean;
}) => string | Promise<string>;
```

- 未指定: 既存どおりそのまま `page.src` を使用（パフォーマンス影響なし）
- 指定: 解決完了までローディングアイコン表示、reject 時は error-icon
- 解決済みの結果は `page.id` 単位でキャッシュされ、同じページの再表示で再呼び出しは走りません

### 例: 暗号化バイナリの復号 → Blob URL

```ts
const blobUrls = new Map<string, string>();

createMangaViewer(container, {
  manga,
  resolvePageSrc: async ({ page }) => {
    if (blobUrls.has(page.id)) return blobUrls.get(page.id)!;

    const res = await fetch(page.src, { credentials: "include" });
    const encrypted = await res.arrayBuffer();
    const decrypted = await decrypt(encrypted); // 利用者独自
    const blob = new Blob([decrypted], { type: "image/webp" });
    const url = URL.createObjectURL(blob);
    blobUrls.set(page.id, url);
    return url;
  }
});

// 不要になったら自前で revoke
window.addEventListener("beforeunload", () => {
  for (const url of blobUrls.values()) URL.revokeObjectURL(url);
});
```

### 例: 認証トークン付き fetch → Data URL

```ts
createMangaViewer(container, {
  manga,
  resolvePageSrc: async ({ page }) => {
    const res = await fetch(page.src, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }
});
```

### 注意点

- **Blob URL の revoke はライブラリ側で行いません。** 利用側で自前管理してください
- 解決結果は `manga.id + page.id` 単位でキャッシュされるので、`isSpread` が後から変わっても再解決は走りません。レイアウトに応じて解像度を変えたい場合は、利用側で別キーで管理してください
- CORS: 通常 URL を返す場合は元の `<img>` 経路と同じ制約

## マスコット画像の差し替え

`mascot` オプションで、コントロールドック・メニュー・スプラッシュ画面のうさぎイラストを任意の画像に置き換えられます。

```ts
type MascotOption =
  | { src: string; alt?: string }      // 画像 URL で差し替え
  | { render: () => HTMLElement }       // 完全カスタム
  | false;                              // 非表示
```

- 未指定 → デフォルトのうさぎ SVG
- `{ src }` → `<img>` に変換して表示
- `{ render }` → 関数が返す `HTMLElement` を表示（毎回呼ばれるので、コントロールドック / メニュー / スプラッシュで別インスタンス）
- `false` → マスコットおよびスプラッシュのロゴ部分を非表示

スプラッシュ画面では、`mascot` が指定されているとデフォルトの「うさぎロゴ + comimi タイポ」が消え、120×120 のカスタムアイコンのみが表示されます。

### 例: 画像 URL で差し替え

```ts
createMangaViewer(container, {
  manga,
  mascot: { src: "/assets/my-mascot.png", alt: "Site mascot" }
});
```

### 例: SVG を直接埋め込み

```ts
const ICON_SVG = `<svg viewBox="0 0 50 50" ...>...</svg>`;

createMangaViewer(container, {
  manga,
  mascot: {
    render: () => {
      const wrap = document.createElement("div");
      wrap.innerHTML = ICON_SVG;
      return wrap.firstElementChild as HTMLElement;
    }
  }
});
```

### 例: マスコットを非表示にする

```ts
createMangaViewer(container, {
  manga,
  mascot: false
});
```

### 配置とサイズ

- コントロールドック / メニューパネル内のマスコット枠は `50×50`（`aspect-ratio: 1/1`）
- スプラッシュ画面のロゴ差し替え枠は `120×120`
- 中身は `width:100% / height:100% / object-fit: contain` で枠にフィット

## イベント

```ts
interface ViewerEventMap {
  ready: { manga: Manga };
  pageChange: { pageIndex: number; page: MangaPage };
  settingsChange: { settings: ViewerSettings };
  layoutChange: { layoutMode: LayoutMode };
  destroy: void;
}
```

初期登録は `options.events`、後付け／解除は以下：

```ts
const off = viewer.on("layoutChange", ({ layoutMode }) => { ... });
off(); // 解除
```

## ディレクトリ構成

```
src/
├── index.ts                       公開エントリ (createMangaViewer + 型)
├── types.ts                       公開する型定義
├── defaults.ts                    デフォルト設定 / 派生stateの計算
├── core/                          ライフサイクル / イベント / アセットローダ
├── store/                         Flux 風の store + reducer
├── renderer/                      DOM を所有する単一の ViewerRenderer
├── components/                    各 UI コンポーネント (dock, menu, settings, ...)
├── i18n/                          翻訳ルックアップ
├── storage/                       IndexedDB ラッパ
└── styles/                        CSS レジストリ / media query ヘルパ
locales/
├── ja.json
└── en.json
examples/preview/                  Vite ベースのローカルプレビュー
```

## 開発

```sh
npm install
npm run dev        # examples/preview を Vite dev server で起動
npm run typecheck  # tsc --noEmit
npm run build      # bundle + .d.ts を dist/ に出力
```

プレビューは `examples/preview/` にあり、`examples/preview/sample-comic/*.webp` を `import.meta.glob` 経由で読み込みます。
