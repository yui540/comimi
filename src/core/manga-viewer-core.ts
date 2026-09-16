import {
  createInitialState,
  defaultSettings,
  getPageStep,
  mergeSettings
} from "../defaults";
import { I18n } from "../i18n/i18n";
import type { RendererCallbacks } from "../renderer/renderer-callbacks";
import { isMenuPanel } from "../components/menu-panel";
import { ViewerRenderer } from "../renderer/viewer-renderer";
import { IndexedDbStorage } from "../storage/indexed-db-storage";
import { ViewerStore } from "../store/store";
import { mobileViewportQuery } from "../styles/media";
import type {
  LayoutMode,
  Manga,
  MangaPage,
  MangaViewerInstance,
  MangaViewerOptions,
  NotificationTone,
  ViewerEventHandler,
  ViewerEventMap,
  ViewerEventHandlersMap,
  ViewerEventName,
  ViewerPanel,
  ViewerSettings,
  ViewerState
} from "../types";
import { AssetLoader } from "./asset-loader";
import { EventEmitter } from "./event-emitter";

// 作品ごとに記憶する設定キー。これらは global の `settings` ではなく
// 作品ID単位の `mangaSettings` ストアに保存する。
const PER_MANGA_SETTING_KEYS = [
  "pageTurnMode",
  "hasCover",
  "readingDirection"
] as const;
type PerMangaSettingKey = (typeof PER_MANGA_SETTING_KEYS)[number];

const LAYOUT_LABEL_KEYS: Record<LayoutMode, string> = {
  inline: "layout.inline",
  wide: "layout.wide",
  browserFullscreen: "layout.browserFullscreen",
  nativeFullscreen: "layout.browserFullscreen"
};

// 操作が無いままこの時間が経過するとオーバーレイを自動で閉じる。
const OVERLAY_AUTO_HIDE_MS = 3000;
// ビューワー内でこれらのイベントが起きたら「操作中」とみなしタイマーを延長する。
const OVERLAY_ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "touchstart",
  "touchmove",
  "wheel",
  "focusin",
  "input"
] as const;

/** 作品ごとキーを除いた global 用の設定スナップショットを返す。 */
function stripPerMangaSettings(
  settings: ViewerSettings
): Partial<ViewerSettings> {
  const out: Partial<ViewerSettings> = { ...settings };
  for (const key of PER_MANGA_SETTING_KEYS) {
    delete out[key];
  }
  return out;
}

/** 設定の差分から作品ごとキーだけを抜き出す。 */
function pickPerMangaSettings(
  settings: Partial<ViewerSettings>
): Partial<ViewerSettings> {
  const out: Partial<ViewerSettings> = {};
  for (const key of PER_MANGA_SETTING_KEYS) {
    if (key in settings) {
      out[key] = settings[key] as never;
    }
  }
  return out;
}

/**
 * クエリパラメータから開始ページの index を読み取る。
 * `paramKey` 未指定・非ブラウザ環境・値が不正な場合は undefined を返す。
 * 値は 1 始まりのページ番号として解釈し、0 始まりの index に変換する。
 */
function readInitialPageFromQuery(
  paramKey: string | undefined
): number | undefined {
  if (!paramKey || typeof window === "undefined") {
    return undefined;
  }
  const value = new URLSearchParams(window.location.search).get(paramKey);
  if (value === null) {
    return undefined;
  }
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) {
    return undefined;
  }
  return page - 1;
}

export class MangaViewerCore implements MangaViewerInstance {
  private store: ViewerStore;
  private storage: IndexedDbStorage;
  private assetLoader: AssetLoader;
  private renderer: ViewerRenderer;
  private i18n: I18n;
  private events = new EventEmitter();
  private unsubscribers: Array<() => void> = [];
  private notificationTimer?: number;
  private autoTimer?: number;
  private overlayHideTimer?: number;
  private bootstrapTimers: number[] = [];
  private destroyed = false;
  private mobileMediaQuery?: MediaQueryList;
  private lockLayoutMode = false;
  // 保存値より初期値を優先する設定キー（forceSettings オプション由来）。
  private forceSettings: ReadonlySet<keyof ViewerSettings> = new Set();
  // 作品ごと設定の「開発者指定デフォルト」。保存値が無い作品に適用する。
  private baseMangaSettings: Pick<ViewerSettings, PerMangaSettingKey>;
  private initialPageIndex?: number;
  // browserFullscreen 中に退避した body の overflow（未ロック時は null）。
  private bodyOverflowBackup: string | null = null;

  constructor(
    private container: HTMLElement,
    options: MangaViewerOptions
  ) {
    const settings = mergeSettings(defaultSettings, {
      ...options.settings,
      locale: options.locale ?? options.settings?.locale ?? defaultSettings.locale
    });

    this.lockLayoutMode = options.lockLayoutMode ?? false;
    this.forceSettings = new Set(options.forceSettings ?? []);
    this.baseMangaSettings = {
      pageTurnMode: settings.pageTurnMode,
      hasCover: settings.hasCover,
      readingDirection: settings.readingDirection
    };
    this.storage = new IndexedDbStorage(options.storage);
    this.assetLoader = new AssetLoader();
    this.i18n = new I18n(settings.locale, options.translations);
    // クエリパラメータがあれば initialPageIndex や保存済み進捗より優先する。
    // this.initialPageIndex が非 undefined だと bootstrap は保存進捗を適用しない。
    this.initialPageIndex =
      readInitialPageFromQuery(options.initialPageQueryParam) ??
      options.initialPageIndex;
    this.store = new ViewerStore(
      createInitialState(options.manga, settings, this.initialPageIndex)
    );

    const callbacks: RendererCallbacks = {
      goToPage: (pageIndex) => {
        if (this.store.getState().autoPageTurnEnabled) return;
        this.goToPage(pageIndex);
      },
      nextPage: () => {
        if (this.store.getState().autoPageTurnEnabled) return;
        this.nextPage();
      },
      previousPage: () => {
        if (this.store.getState().autoPageTurnEnabled) return;
        this.previousPage();
      },
      commitNextPage: () => this.commitNextPage(),
      commitPreviousPage: () => this.commitPreviousPage(),
      toggleOverlay: (force) => this.toggleOverlay(force),
      toggleAutoPageTurn: () => this.toggleAutoPageTurn(),
      updateSettings: (settingsUpdate) => {
        void this.updateSettings(settingsUpdate);
      },
      setLayoutMode: (layoutMode) => void this.setLayoutMode(layoutMode),
      setWideHeight: (heightPx) => this.setWideHeight(heightPx),
      setPanel: (panel) => {
        this.store.dispatch({ type: "setPanel", panel });
      },
      setZoom: (scale, panX, panY) =>
        this.store.dispatch({ type: "setZoom", scale, panX, panY }),
      setPan: (panX, panY) => this.store.dispatch({ type: "setPan", panX, panY }),
      resetZoom: () => this.store.dispatch({ type: "resetZoom" }),
      notify: (message, tone) => this.notify(message, tone),
      pressFavorite: (pageIndex) => this.pressFavorite(pageIndex),
      removeFavorite: (pageIndex) => this.removeFavorite(pageIndex),
      reportPageLoadError: (pageIndex) => {
        const page = this.store.getState().manga.pages[pageIndex];
        if (page) {
          this.events.emit("pageLoadError", { pageIndex, page });
        }
      }
    };

    this.renderer = new ViewerRenderer(this.container, {
      callbacks,
      assetLoader: this.assetLoader,
      i18n: this.i18n,
      className: options.className,
      resolvePageSrc: options.resolvePageSrc,
      lockLayoutMode: this.lockLayoutMode,
      mascot: options.mascot,
      hidden: new Set(options.hiddenSettings ?? []),
      pageQueryParam: options.initialPageQueryParam
    });

    for (const [eventName, handler] of Object.entries(
      options.events ?? {}
    ) as Array<[ViewerEventName, ViewerEventHandlersMap[ViewerEventName]]>) {
      this.on(
        eventName,
        handler as ViewerEventHandler<typeof eventName>
      );
    }

    this.unsubscribers.push(
      this.store.subscribe((state, previous) => {
        this.renderer.update(state);
        this.afterStateChange(state, previous);
      })
    );

    this.bindKeyboard();
    this.bindViewportChange();
    this.bindOverlayActivity();
    this.bootstrap();
  }

  destroy(): void {
    this.destroyed = true;
    window.clearInterval(this.autoTimer);
    window.clearTimeout(this.overlayHideTimer);
    for (const timer of this.bootstrapTimers) {
      window.clearTimeout(timer);
    }
    this.bootstrapTimers = [];
    window.clearTimeout(this.notificationTimer);
    this.syncBodyScrollLock("inline");
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.assetLoader.revokeAll();
    this.renderer.destroy();
    this.events.emit("destroy", undefined);
    this.events.clear();
  }

  async setManga(manga: Manga): Promise<void> {
    const pageIndex = (await this.storage.getProgress(manga.id)) ?? 0;
    if (this.destroyed) {
      return;
    }
    this.store.dispatch({ type: "setManga", manga, pageIndex });
    // 作品ごと設定を新しい作品のものへ切り替える（保存値が無ければデフォルト）。
    await this.applyMangaSettings(manga.id);
    await this.applyFavorites(manga.id);
    if (!this.destroyed) {
      this.events.emit("mangaChange", { manga: this.store.getState().manga });
    }
  }

  private async applyFavorites(mangaId: string): Promise<void> {
    const saved = await this.storage.getFavorites(mangaId);
    if (this.destroyed) {
      return;
    }
    const pageIds = new Set(this.store.getState().manga.pages.map((p) => p.id));
    this.store.dispatch({
      type: "setFavorites",
      pageIds: (saved ?? []).filter((id) => pageIds.has(id))
    });
  }

  toggleFavorite(pageIndex: number): boolean {
    const state = this.store.getState();
    const page = state.manga.pages[pageIndex];
    if (!page) {
      return false;
    }
    this.store.dispatch({ type: "toggleFavorite", pageId: page.id });
    const next = this.store.getState().favoritePageIds;
    const added = next.includes(page.id);
    // 保存できたかどうかでトーストの文言を変える（storage 無効時はセッション内のみ）。
    this.storage
      .saveFavorites(state.manga.id, next)
      .then((persisted) => {
        if (added && !this.destroyed) {
          this.notifyFavoriteAdded(persisted);
        }
      })
      .catch(() => {
        if (added && !this.destroyed) {
          this.notifyFavoriteAdded(false);
        }
      });
    this.events.emit("favoritesChange", { pageIds: next, pageId: page.id, added });
    return added;
  }

  addFavorite(pageIndex: number): boolean {
    if (this.isFavorite(pageIndex)) {
      return false;
    }
    return this.toggleFavorite(pageIndex);
  }

  removeFavorite(pageIndex: number): boolean {
    if (!this.isFavorite(pageIndex)) {
      return false;
    }
    this.toggleFavorite(pageIndex);
    return true;
  }

  isFavorite(pageIndex: number): boolean {
    const state = this.store.getState();
    const page = state.manga.pages[pageIndex];
    return !!page && state.favoritePageIds.includes(page.id);
  }

  getFavoritePageIds(): string[] {
    return [...this.store.getState().favoritePageIds];
  }

  setFavorites(pageIds: string[]): void {
    const state = this.store.getState();
    const known = new Set(state.manga.pages.map((page) => page.id));
    const next = [...new Set(pageIds.filter((id) => known.has(id)))];
    const current = state.favoritePageIds;
    if (
      next.length === current.length &&
      next.every((id, index) => id === current[index])
    ) {
      return;
    }
    this.store.dispatch({ type: "setFavorites", pageIds: next });
    void this.storage.saveFavorites(state.manga.id, next);
    this.events.emit("favoritesChange", { pageIds: next });
  }

  clearFavorites(): void {
    this.setFavorites([]);
  }

  private notifyFavoriteAdded(persisted: boolean): void {
    this.notify(
      this.i18n.t(persisted ? "favorites.added" : "favorites.addedUnsaved"),
      persisted ? "success" : "info"
    );
  }

  // ロングタップ用。登録済みでも演出とトーストは出したいので、解除はせず登録だけ行う。
  private pressFavorite(pageIndex: number): void {
    const state = this.store.getState();
    const page = state.manga.pages[pageIndex];
    if (!page) {
      return;
    }
    if (state.favoritePageIds.includes(page.id)) {
      this.storage
        .saveFavorites(state.manga.id, state.favoritePageIds)
        .then((persisted) => {
          if (!this.destroyed) this.notifyFavoriteAdded(persisted);
        })
        .catch(() => {
          if (!this.destroyed) this.notifyFavoriteAdded(false);
        });
      return;
    }
    this.toggleFavorite(pageIndex);
  }

  async setPages(pages: MangaPage[]): Promise<void> {
    await this.setManga({
      ...this.store.getState().manga,
      pages
    });
  }

  getState(): Readonly<ViewerState> {
    return this.store.getState();
  }

  getElement(): HTMLElement {
    return this.renderer.getElement();
  }

  getCurrentPageIndex(): number {
    return this.store.getState().currentPageIndex;
  }

  getPageCount(): number {
    return this.store.getState().manga.pages.length;
  }

  isMobileViewport(): boolean {
    return this.renderer.isMobileViewport();
  }

  setPanel(panel: ViewerPanel): void {
    this.store.dispatch({ type: "setPanel", panel });
  }

  setZoom(scale: number, panX?: number, panY?: number): void {
    this.store.dispatch({ type: "setZoom", scale, panX, panY });
  }

  resetZoom(): void {
    this.store.dispatch({ type: "resetZoom" });
  }

  async updateSettings(settings: Partial<ViewerSettings>): Promise<void> {
    let toApply = settings;
    if (this.lockLayoutMode && "layoutMode" in settings) {
      toApply = { ...settings };
      delete toApply.layoutMode;
    }
    this.store.dispatch({ type: "updateSettings", settings: toApply });
    const nextSettings = this.store.getState().settings;
    this.i18n.setLocale(nextSettings.locale);

    // 作品ごとのキーは作品ID単位、それ以外は global に保存する。
    await this.storage.saveSettings(stripPerMangaSettings(nextSettings));
    const perManga = pickPerMangaSettings(toApply);
    if (Object.keys(perManga).length > 0) {
      await this.storage.saveMangaSettings(
        this.store.getState().manga.id,
        perManga
      );
    }

    this.events.emit("settingsChange", { settings: nextSettings });
  }

  /**
   * 指定作品の「作品ごと設定」をストアに反映する。
   * まず開発者デフォルトへ戻し、保存値があれば上書きする
   * （forceSettings のキーは常にデフォルト優先）。
   */
  private async applyMangaSettings(mangaId: string): Promise<void> {
    const saved = await this.storage.getMangaSettings(mangaId);
    if (this.destroyed) {
      return;
    }
    this.store.dispatch({
      type: "updateSettings",
      settings: {
        ...this.baseMangaSettings,
        ...this.pickSavedMangaSettings(saved)
      }
    });
  }

  private pickSavedMangaSettings(
    saved: Partial<ViewerSettings> | undefined
  ): Partial<ViewerSettings> {
    const out: Partial<ViewerSettings> = {};
    if (!saved) {
      return out;
    }
    for (const key of PER_MANGA_SETTING_KEYS) {
      if (!this.forceSettings.has(key) && key in saved) {
        out[key] = saved[key] as never;
      }
    }
    return out;
  }

  goToPage(pageIndex: number): void {
    const before = this.store.getState().currentPageIndex;
    this.store.dispatch({ type: "goToPage", pageIndex });
    const after = this.store.getState().currentPageIndex;

    if (before !== after) {
      const state = this.store.getState();
      void this.storage.saveProgress(state.manga.id, after);
      this.events.emit("pageChange", {
        pageIndex: after,
        page: state.manga.pages[after]
      });
    }
  }

  nextPage(): void {
    if (this.renderer.isAnimatingPageTurn()) {
      return;
    }
    this.commitNextPage();
  }

  previousPage(): void {
    if (this.renderer.isAnimatingPageTurn()) {
      return;
    }
    this.commitPreviousPage();
  }

  private commitNextPage(): void {
    if (this.renderer.isMobileViewport()) {
      this.goToPage(this.store.getState().currentPageIndex + 1);
      return;
    }

    const current = this.store.getState().currentPageIndex;
    this.store.dispatch({ type: "nextPage" });
    this.emitPageChangeIfNeeded(current);
  }

  private commitPreviousPage(): void {
    if (this.renderer.isMobileViewport()) {
      this.goToPage(this.store.getState().currentPageIndex - 1);
      return;
    }

    const current = this.store.getState().currentPageIndex;
    this.store.dispatch({ type: "previousPage" });
    this.emitPageChangeIfNeeded(current);
  }

  toggleOverlay(force?: boolean): void {
    const current = this.store.getState().overlayVisible;
    const visible = force ?? !current;
    this.store.dispatch({ type: "setOverlayVisible", visible });
  }

  setOverlayVisible(visible: boolean): void {
    this.toggleOverlay(visible);
  }

  toggleAutoPageTurn(): void {
    this.store.dispatch({ type: "toggleAutoPageTurn" });
    this.syncAutoTimer();

    const enabled = this.store.getState().autoPageTurnEnabled;
    this.notify(this.i18n.t(enabled ? "autoplay.start" : "autoplay.stop"));
  }

  setAutoPageTurn(enabled: boolean): void {
    if (this.store.getState().autoPageTurnEnabled !== enabled) {
      this.toggleAutoPageTurn();
    }
  }

  async toggleFullscreen(): Promise<void> {
    if (this.lockLayoutMode) return;
    const state = this.store.getState();

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      await this.setLayoutMode("inline");
      return;
    }

    await this.setLayoutMode(
      state.layout.mode === "nativeFullscreen" ? "inline" : "nativeFullscreen"
    );
  }

  on<T extends ViewerEventName>(
    eventName: T,
    handler: ViewerEventHandler<T>
  ): () => void {
    return this.events.on(eventName, handler);
  }

  once<T extends ViewerEventName>(
    eventName: T,
    handler: ViewerEventHandler<T>
  ): () => void {
    const off = this.events.on(eventName, ((payload: ViewerEventMap[T]) => {
      off();
      handler(payload);
    }) as ViewerEventHandler<T>);
    return off;
  }

  private async bootstrap(): Promise<void> {
    const mangaId = this.store.getState().manga.id;
    const [
      savedSettings,
      savedLayout,
      progress,
      savedMangaSettings,
      savedFavorites
    ] = await Promise.all([
      this.storage.getSettings(),
      this.storage.getLayout<{
        mode?: LayoutMode | "theater";
        wideHeightPx?: number;
        theaterHeightPx?: number;
      }>(),
      this.storage.getProgress(mangaId),
      this.storage.getMangaSettings(mangaId),
      this.storage.getFavorites(mangaId)
    ]);

    // await 中に destroy された場合は何もしない（StrictMode の
    // mount→unmount→mount で破棄済みインスタンスが DOM を触るのを防ぐ）。
    if (this.destroyed) {
      return;
    }

    if (savedSettings) {
      const settingsToApply: Partial<ViewerSettings> = { ...savedSettings };
      if (this.lockLayoutMode) {
        delete settingsToApply.layoutMode;
      }
      // 作品ごとキーは global からは適用しない（旧バージョンの保存値対策）。
      for (const key of PER_MANGA_SETTING_KEYS) {
        delete settingsToApply[key];
      }
      // forceSettings に挙げたキーは初期値を優先するため保存値を捨てる。
      for (const key of this.forceSettings) {
        delete settingsToApply[key];
      }
      this.store.dispatch({ type: "updateSettings", settings: settingsToApply });
    }

    // 作品ごと設定（保存値があれば）を適用する。
    // 初期状態には開発者デフォルトが入っているので、無ければそのまま。
    const perMangaToApply = this.pickSavedMangaSettings(savedMangaSettings);
    if (Object.keys(perMangaToApply).length > 0) {
      this.store.dispatch({
        type: "updateSettings",
        settings: perMangaToApply
      });
    }
    if (
      !this.lockLayoutMode &&
      !this.forceSettings.has("layoutMode") &&
      savedLayout?.mode
    ) {
      const layoutMode: LayoutMode =
        savedLayout.mode === "theater" ? "wide" : savedLayout.mode;
      this.store.dispatch({ type: "setLayoutMode", layoutMode });
    }
    const savedWideHeight =
      savedLayout?.wideHeightPx ?? savedLayout?.theaterHeightPx;
    if (savedWideHeight) {
      this.store.dispatch({
        type: "setWideHeight",
        heightPx: savedWideHeight
      });
    }
    if (this.initialPageIndex === undefined && typeof progress === "number") {
      this.store.dispatch({ type: "goToPage", pageIndex: progress });
    }
    if (savedFavorites && savedFavorites.length > 0) {
      const pageIds = new Set(
        this.store.getState().manga.pages.map((page) => page.id)
      );
      this.store.dispatch({
        type: "setFavorites",
        pageIds: savedFavorites.filter((id) => pageIds.has(id))
      });
    }

    this.renderer.update(this.store.getState());
    this.renderer.showSplash();
    this.startBootstrapGuide();
    this.events.emit("ready", { manga: this.store.getState().manga });
  }

  // スプラッシュ後の演出:
  // スプラッシュ後は今まで通りオーバーレイ（メニュー等）を表示する。
  // 中央だけは最初に進行方向ガイドを出し、約2秒後に「中央をクリック」
  // メッセージと入れ替える（クロスフェード）。
  private startBootstrapGuide(): void {
    const OVERLAY_REVEAL_MS = 950;
    const GUIDE_DURATION_MS = 2000;

    // オーバーレイ表示時に中央でまずガイドを見せるための表示要求。
    this.store.dispatch({ type: "setMoveGuideVisible", visible: true });

    const schedule = (delay: number, run: () => void) => {
      const timer = window.setTimeout(() => {
        if (this.destroyed) {
          return;
        }
        run();
      }, delay);
      this.bootstrapTimers.push(timer);
    };

    schedule(OVERLAY_REVEAL_MS, () => {
      this.toggleOverlay(true);
    });
    schedule(OVERLAY_REVEAL_MS + GUIDE_DURATION_MS, () => {
      // ガイドを下ろすと、中央メッセージと入れ替わってフェードする。
      this.store.dispatch({ type: "setMoveGuideVisible", visible: false });
    });
  }

  private bindKeyboard(): void {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!this.shouldHandleKeyboardEvent(event)) {
        return;
      }

      this.syncOverlayAutoHide();

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          this.moveFromKey("left");
          break;
        case "ArrowRight":
          event.preventDefault();
          this.moveFromKey("right");
          break;
        case " ":
          event.preventDefault();
          this.moveFromKey(event.shiftKey ? "right" : "left");
          break;
        case "a":
        case "A":
          event.preventDefault();
          this.toggleAutoPageTurn();
          break;
        case "n":
        case "N":
          if (this.lockLayoutMode) break;
          event.preventDefault();
          void this.setLayoutMode("inline");
          break;
        case "Escape":
          event.preventDefault();
          this.store.dispatch({ type: "setPanel", panel: "none" });
          if (!this.lockLayoutMode) {
            void this.setLayoutMode("inline");
          }
          break;
        case "w":
        case "W":
          if (this.lockLayoutMode) break;
          event.preventDefault();
          void this.setLayoutMode("wide");
          break;
        case "f":
        case "F":
          if (this.lockLayoutMode) break;
          event.preventDefault();
          void this.setLayoutMode("browserFullscreen");
          break;
        case "m":
        case "M": {
          event.preventDefault();
          const menuOpen = isMenuPanel(this.store.getState().panel);
          // setPanel が panel!=="none" のとき overlayVisible を立てるため、
          // ここで toggleOverlay は呼ばない（二重 dispatch で表示用 rAF が
          // キャンセルされ、オーバーレイが表示されなくなる）。
          this.store.dispatch({
            type: "setPanel",
            panel: menuOpen ? "none" : "menu"
          });
          break;
        }
        case "p":
        case "P":
          event.preventDefault();
          void this.updateSettings({
            pageTurnMode:
              this.store.getState().settings.pageTurnMode === "spread"
                ? "single"
                : "spread"
          });
          break;
        case "c":
        case "C":
          event.preventDefault();
          void this.updateSettings({
            hasCover: !this.store.getState().settings.hasCover
          });
          break;
        case "o":
        case "O":
          event.preventDefault();
          this.toggleOverlay();
          break;
        case "s":
        case "S": {
          event.preventDefault();
          const settingsOpen =
            this.store.getState().panel === "settings";
          // setPanel が overlayVisible を立てるため toggleOverlay は呼ばない。
          this.store.dispatch({
            type: "setPanel",
            panel: settingsOpen ? "none" : "settings"
          });
          break;
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    this.unsubscribers.push(() => window.removeEventListener("keydown", onKeyDown));
  }

  private shouldHandleKeyboardEvent(event: KeyboardEvent): boolean {
    const target = event.target;
    if (!(target instanceof Element)) {
      return true;
    }

    return !target.closest(
      "input, select, textarea, [contenteditable='true']"
    );
  }

  // ビューワー内での操作（マウス移動・タッチ・入力など）を検知して
  // オーバーレイの自動非表示タイマーを延長する。
  private bindOverlayActivity(): void {
    const element = this.renderer.getElement();
    const onActivity = () => this.syncOverlayAutoHide();
    for (const eventName of OVERLAY_ACTIVITY_EVENTS) {
      element.addEventListener(eventName, onActivity, { passive: true });
    }
    this.unsubscribers.push(() => {
      for (const eventName of OVERLAY_ACTIVITY_EVENTS) {
        element.removeEventListener(eventName, onActivity);
      }
    });
  }

  private bindViewportChange(): void {
    this.mobileMediaQuery = window.matchMedia(mobileViewportQuery);
    const onChange = () => {
      this.renderer.update(this.store.getState());
    };

    this.mobileMediaQuery.addEventListener("change", onChange);
    this.unsubscribers.push(() =>
      this.mobileMediaQuery?.removeEventListener("change", onChange)
    );
  }

  private moveFromKey(side: "left" | "right"): void {
    if (this.store.getState().autoPageTurnEnabled) return;
    const direction = this.store.getState().settings.readingDirection;
    if (direction === "rtl") {
      side === "left" ? this.nextPage() : this.previousPage();
    } else {
      side === "left" ? this.previousPage() : this.nextPage();
    }
  }

  async setLayoutMode(layoutMode: LayoutMode): Promise<void> {
    if (this.lockLayoutMode) return;
    if (layoutMode === "nativeFullscreen") {
      try {
        await this.renderer.getElement().requestFullscreen();
      } catch {
        layoutMode = "browserFullscreen";
      }
    } else if (document.fullscreenElement) {
      await document.exitFullscreen();
    }

    if (
      layoutMode === "wide" &&
      !this.store.getState().layout.wideHeightPx
    ) {
      const currentHeight = this.renderer.getElement().offsetHeight;
      if (currentHeight > 0) {
        this.store.dispatch({
          type: "setWideHeight",
          heightPx: currentHeight
        });
      }
    }

    const previousMode = this.store.getState().layout.mode;
    this.store.dispatch({ type: "setLayoutMode", layoutMode });
    if (layoutMode !== previousMode) {
      this.notify(this.i18n.t(LAYOUT_LABEL_KEYS[layoutMode]));
    }
    await this.storage.saveSettings(
      stripPerMangaSettings(this.store.getState().settings)
    );
    await this.storage.saveLayout(this.store.getState().layout);
    this.events.emit("layoutChange", { layoutMode });
  }

  private setWideHeight(heightPx: number): void {
    this.store.dispatch({ type: "setWideHeight", heightPx });
    void this.storage.saveLayout(this.store.getState().layout);
  }

  private afterStateChange(state: ViewerState, previous: ViewerState): void {
    if (state.autoPageTurnEnabled !== previous.autoPageTurnEnabled) {
      this.syncAutoTimer();
      this.events.emit("autoPageTurnChange", {
        enabled: state.autoPageTurnEnabled
      });
    }
    if (state.layout.mode !== previous.layout.mode) {
      this.syncBodyScrollLock(state.layout.mode);
    }
    if (
      state.overlayVisible !== previous.overlayVisible ||
      state.panel !== previous.panel
    ) {
      this.syncOverlayAutoHide();
    }
    if (state.overlayVisible !== previous.overlayVisible) {
      this.events.emit("overlayChange", { visible: state.overlayVisible });
    }
    if (state.panel !== previous.panel) {
      this.events.emit("panelChange", { panel: state.panel });
    }
    if (
      state.zoomScale !== previous.zoomScale ||
      state.panX !== previous.panX ||
      state.panY !== previous.panY
    ) {
      this.events.emit("zoomChange", {
        scale: state.zoomScale,
        panX: state.panX,
        panY: state.panY
      });
    }
  }

  // オーバーレイ表示中、操作が無ければ一定時間後に自動で閉じる。
  // パネル（メニュー・設定）を開いている間は閲覧中とみなして閉じない。
  private syncOverlayAutoHide(): void {
    window.clearTimeout(this.overlayHideTimer);
    this.overlayHideTimer = undefined;

    const state = this.store.getState();
    if (!state.overlayVisible || state.panel !== "none") {
      return;
    }

    this.overlayHideTimer = window.setTimeout(() => {
      this.overlayHideTimer = undefined;
      if (this.destroyed) {
        return;
      }
      this.toggleOverlay(false);
    }, OVERLAY_AUTO_HIDE_MS);
  }

  // CSS 全画面（browserFullscreen）はビューワーを position:fixed で重ねるだけで
  // 背後の Web ページはスクロールできてしまうため、body のスクロールをロックする。
  // nativeFullscreen は Fullscreen API がページ自体を隠すので対象外。
  private syncBodyScrollLock(layoutMode: LayoutMode): void {
    if (typeof document === "undefined") {
      return;
    }
    const shouldLock = layoutMode === "browserFullscreen";
    if (shouldLock && this.bodyOverflowBackup === null) {
      this.bodyOverflowBackup = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    } else if (!shouldLock && this.bodyOverflowBackup !== null) {
      document.body.style.overflow = this.bodyOverflowBackup;
      this.bodyOverflowBackup = null;
    }
  }

  private syncAutoTimer(): void {
    window.clearInterval(this.autoTimer);

    if (!this.store.getState().autoPageTurnEnabled) {
      return;
    }

    this.autoTimer = window.setInterval(() => {
      if (this.isAtLastPage()) {
        this.toggleAutoPageTurn();
        return;
      }
      this.commitNextPage();
      if (this.isAtLastPage()) {
        this.toggleAutoPageTurn();
      }
    }, this.store.getState().settings.autoPageTurnIntervalMs);
  }

  private isAtLastPage(): boolean {
    const state = this.store.getState();
    const step = this.renderer.isMobileViewport()
      ? 1
      : getPageStep(state.settings, state.currentPageIndex);
    return state.currentPageIndex + step >= state.manga.pages.length;
  }

  private emitPageChangeIfNeeded(previousPageIndex: number): void {
    const state = this.store.getState();
    if (state.currentPageIndex === previousPageIndex) {
      return;
    }

    void this.storage.saveProgress(state.manga.id, state.currentPageIndex);
    this.events.emit("pageChange", {
      pageIndex: state.currentPageIndex,
      page: state.manga.pages[state.currentPageIndex]
    });
  }

  notify(message: string, tone: NotificationTone = "info"): void {
    window.clearTimeout(this.notificationTimer);

    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.store.dispatch({
      type: "pushNotification",
      notification: {
        id,
        message,
        tone,
        createdAt: Date.now()
      }
    });

    this.notificationTimer = window.setTimeout(() => {
      this.store.dispatch({ type: "removeNotification", id });
    }, 1500);
    this.events.emit("notification", { message, tone });
  }
}
