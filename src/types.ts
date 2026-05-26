export type ReadingDirection = "rtl" | "ltr";
export type PageTurnMode = "single" | "spread";
export type BackgroundColor = "white" | "black";
export type LayoutMode =
  | "inline"
  | "wide"
  | "browserFullscreen"
  | "nativeFullscreen";

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
  html: string;
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
  pageTurnAnimation: boolean;
  backgroundColor: BackgroundColor;
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
  autoPageTurnEnabled: boolean;
  zoomScale: number;
  panX: number;
  panY: number;
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
  mascot?: MascotOption;
}

export type MascotOption =
  | { src: string; alt?: string }
  | { render: () => HTMLElement }
  | false;

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
  | { type: "toggleAutoPageTurn" }
  | { type: "updateSettings"; settings: Partial<ViewerSettings> }
  | { type: "setLayoutMode"; layoutMode: LayoutMode }
  | { type: "setWideHeight"; heightPx: number }
  | { type: "setZoom"; scale: number; panX?: number; panY?: number }
  | { type: "setPan"; panX: number; panY: number }
  | { type: "resetZoom" }
  | { type: "setPanel"; panel: ViewerState["panel"] }
  | { type: "pushNotification"; notification: ViewerNotification }
  | { type: "removeNotification"; id: string };
