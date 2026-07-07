export type ReadingDirection = "rtl" | "ltr";
export type PageTurnMode = "single" | "spread";
export type BackgroundColor = "white" | "black";
export type ColorTheme = "light" | "dark";
export type LayoutMode =
  | "inline"
  | "wide"
  | "browserFullscreen"
  | "nativeFullscreen";

/**
 * `hiddenSettings` で非表示にできる UI 項目のキー。
 * 前半は設定パネル内の各行、後半はツールバー上の操作。
 */
export type HideableControl =
  // 設定パネルの各項目
  | "locale"
  | "theme"
  | "cover"
  | "direction"
  | "interval"
  // ツールバーの操作
  | "pageMode"
  | "autoplay"
  | "viewMode";

export interface Manga {
  id: string;
  title: string;
  author?: string;
  pages: MangaPage[];
  metadata?: Record<string, unknown>;
}

export type MangaPage = ImagePage | HtmlPage;

interface BasePage {
  id: string;
  label?: string;
}

export interface ImagePage extends BasePage {
  type: "image";
  src: string;
  thumbnailSrc?: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface HtmlPage extends BasePage {
  type: "html";
  /** HTML markup injected via innerHTML. Ignored when `element` is provided. */
  html?: string;
  /**
   * A pre-built host element appended directly into the page frame.
   * Use this to mount framework-managed content (e.g. a React portal target)
   * whose contents update independently of the viewer.
   */
  element?: HTMLElement;
  sandbox?: string;
  aspectRatio?: number;
}

export interface ViewerSettings {
  locale: string;
  hasCover: boolean;
  readingDirection: ReadingDirection;
  pageTurnMode: PageTurnMode;
  layoutMode: LayoutMode;
  autoPageTurnIntervalMs: number;
  backgroundColor: BackgroundColor;
  theme: ColorTheme;
  zoom: {
    min: number;
    max: number;
    step: number;
  };
}

export interface ViewerNotification {
  id: string;
  message: string;
  createdAt: number;
  tone?: "info" | "success" | "error";
}

export interface ViewerState {
  manga: Manga;
  currentPageIndex: number;
  visiblePageIndexes: number[];
  overlayVisible: boolean;
  /** スプラッシュ直後に表示する進行方向ガイドの表示要求フラグ。 */
  moveGuideVisible: boolean;
  autoPageTurnEnabled: boolean;
  zoomScale: number;
  panX: number;
  panY: number;
  /**
   * ズーム対象のページ index。見開き時にカーソルが当たっているページだけを
   * ズームするために使う。null のときは全ページに適用（ピンチ等の従来挙動）。
   */
  zoomPageIndex: number | null;
  settings: ViewerSettings;
  layout: {
    mode: LayoutMode;
    wideHeightPx?: number;
  };
  notifications: ViewerNotification[];
  panel: "none" | "settings" | "menu" | "pages" | "shortcuts";
}

export type TranslationMap = Record<string, string>;

export interface MangaViewerOptions {
  manga: Manga;
  initialPageIndex?: number;
  /**
   * URL のクエリパラメータから開始ページを読み取る際のキー。
   * 例えば `"p"` を指定すると `?p=20` で 20 ページ目（1 始まり）から開始する。
   * 値が数値でない・1 未満・パラメータ自体が無い場合は無視される。
   * `initialPageIndex` が明示されている場合は常にそちらを優先する。
   */
  initialPageQueryParam?: string;
  locale?: string;
  translations?: TranslationMap;
  settings?: Partial<ViewerSettings>;
  storage?: {
    enabled?: boolean;
    databaseName?: string;
  };
  className?: string;
  events?: Partial<ViewerEventHandlersMap>;
  resolvePageSrc?: PageSrcResolver;
  lockLayoutMode?: boolean;
  mascot?: MascotOption | MascotAreaOptions;
  /**
   * ここに挙げた設定キーは、IndexedDB に保存された値より
   * 初期値（`settings` の値、無ければ `defaults`）を常に優先して適用する。
   * 挙げなかったキーは従来どおりシードとして扱われ、保存値があればそちらが勝つ。
   * `settings` はそのまま値の供給源として使い、`forceSettings` は優先度だけを
   * 切り替えるため、「一部の設定だけ保存値より優先する」用途に使える。
   * 例: `settings: { readingDirection: "ltr" }` + `forceSettings: ["readingDirection"]`
   * で、保存済みの読み方向を無視して常に ltr で起動する。
   */
  forceSettings?: (keyof ViewerSettings)[];
  /**
   * 非表示にする UI 項目のキー一覧。設定パネルの各行
   * （`locale` / `cover` / `direction` / `interval` / `backgroundColor`）と
   * ツールバーの操作（`pageMode` / `autoplay` / `viewMode`）を個別に隠せる。
   * 設定パネルの全項目を隠すと設定ボタン自体も表示されない。
   */
  hiddenSettings?: HideableControl[];
}

export type MascotOption =
  | { src: string; alt?: string }
  | { render: () => HTMLElement }
  | { html: string }
  | false;

/**
 * マスコット（キャラクター表示）をエリアごとに個別指定する形式。
 * 単一の `MascotOption` を渡した場合は従来どおりスプラッシュ／メニュー／ドックに適用される。
 * 各エリアの指定が無い場合は `default` → 組み込みのデフォルトの順でフォールバックする。
 */
export interface MascotAreaOptions {
  /** 個別指定が無いエリア共通のフォールバック */
  default?: MascotOption;
  /** スプラッシュ画面 */
  splash?: MascotOption;
  /** メニューパネル・コントロールドック */
  menu?: MascotOption;
  /** ページ読み込み中アイコン */
  loading?: MascotOption;
  /** ページ読み込み失敗アイコン */
  error?: MascotOption;
}

export interface PageSrcContext {
  page: ImagePage;
  pageIndex: number;
  isSpread: boolean;
}

export type PageSrcResolver = (
  context: PageSrcContext
) => string | Promise<string>;

export interface MangaViewerInstance {
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

export interface ViewerEventMap {
  ready: { manga: Manga };
  pageChange: { pageIndex: number; page: MangaPage };
  settingsChange: { settings: ViewerSettings };
  layoutChange: { layoutMode: LayoutMode };
  destroy: void;
}

export type ViewerEventName = keyof ViewerEventMap;
export type ViewerEventHandler<T extends ViewerEventName> = (
  payload: ViewerEventMap[T]
) => void;
export type ViewerEventHandlersMap = {
  [K in ViewerEventName]: ViewerEventHandler<K>;
};

export type ViewerAction =
  | { type: "setManga"; manga: Manga; pageIndex?: number }
  | { type: "goToPage"; pageIndex: number }
  | { type: "nextPage" }
  | { type: "previousPage" }
  | { type: "setOverlayVisible"; visible: boolean }
  | { type: "setMoveGuideVisible"; visible: boolean }
  | { type: "toggleAutoPageTurn" }
  | { type: "updateSettings"; settings: Partial<ViewerSettings> }
  | { type: "setLayoutMode"; layoutMode: LayoutMode }
  | { type: "setWideHeight"; heightPx: number }
  | {
      type: "setZoom";
      scale: number;
      panX?: number;
      panY?: number;
      pageIndex?: number | null;
    }
  | { type: "setPan"; panX: number; panY: number }
  | { type: "resetZoom" }
  | { type: "setPanel"; panel: ViewerState["panel"] }
  | { type: "pushNotification"; notification: ViewerNotification }
  | { type: "removeNotification"; id: string };
