import {
  createInitialState,
  defaultSettings,
  getPageStep,
  mergeSettings
} from "../defaults";
import { I18n } from "../i18n/i18n";
import type { RendererCallbacks } from "../renderer/renderer-callbacks";
import { ViewerRenderer } from "../renderer/viewer-renderer";
import { IndexedDbStorage } from "../storage/indexed-db-storage";
import { ViewerStore } from "../store/store";
import type {
  LayoutMode,
  Manga,
  MangaPage,
  MangaViewerInstance,
  MangaViewerOptions,
  ViewerEventHandler,
  ViewerEventHandlersMap,
  ViewerEventName,
  ViewerSettings,
  ViewerState
} from "../types";
import { AssetLoader } from "./asset-loader";
import { EventEmitter } from "./event-emitter";

export class MangaViewerCore implements MangaViewerInstance {
  private store: ViewerStore;
  private storage: IndexedDbStorage;
  private assetLoader: AssetLoader;
  private renderer: ViewerRenderer;
  private i18n: I18n;
  private events = new EventEmitter();
  private unsubscribers: Array<() => void> = [];
  private notificationTimers = new Map<string, number>();
  private autoTimer?: number;
  private bootstrapOverlayTimer?: number;
  private destroyed = false;
  private mobileMediaQuery?: MediaQueryList;
  private lockLayoutMode = false;
  // 保存値より初期値を優先する設定キー（forceSettings オプション由来）。
  private forceSettings: ReadonlySet<keyof ViewerSettings> = new Set();
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
    this.storage = new IndexedDbStorage(options.storage);
    this.assetLoader = new AssetLoader();
    this.i18n = new I18n(settings.locale, options.translations);
    this.store = new ViewerStore(
      createInitialState(options.manga, settings, options.initialPageIndex)
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
      resetZoom: () => this.store.dispatch({ type: "resetZoom" })
    };

    this.renderer = new ViewerRenderer(
      this.container,
      callbacks,
      this.assetLoader,
      this.i18n,
      options.className,
      options.resolvePageSrc,
      this.lockLayoutMode,
      options.mascot,
      new Set(options.hiddenSettings ?? [])
    );

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
    this.bootstrap();
  }

  destroy(): void {
    this.destroyed = true;
    window.clearInterval(this.autoTimer);
    window.clearTimeout(this.bootstrapOverlayTimer);
    for (const timer of this.notificationTimers.values()) {
      window.clearTimeout(timer);
    }
    this.notificationTimers.clear();
    this.syncBodyScrollLock("inline");
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.assetLoader.revokeAll();
    this.renderer.destroy();
    this.events.emit("destroy", undefined);
    this.events.clear();
  }

  async setManga(manga: Manga): Promise<void> {
    const pageIndex = (await this.storage.getProgress(manga.id)) ?? 0;
    this.store.dispatch({ type: "setManga", manga, pageIndex });
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

  async updateSettings(settings: Partial<ViewerSettings>): Promise<void> {
    let toApply = settings;
    if (this.lockLayoutMode && "layoutMode" in settings) {
      toApply = { ...settings };
      delete toApply.layoutMode;
    }
    this.store.dispatch({ type: "updateSettings", settings: toApply });
    const nextSettings = this.store.getState().settings;
    this.i18n.setLocale(nextSettings.locale);
    await this.storage.saveSettings(nextSettings);
    this.events.emit("settingsChange", { settings: nextSettings });
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

  toggleAutoPageTurn(): void {
    this.store.dispatch({ type: "toggleAutoPageTurn" });
    this.syncAutoTimer();

    const enabled = this.store.getState().autoPageTurnEnabled;
    this.notify(this.i18n.t(enabled ? "autoplay.start" : "autoplay.stop"));
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

  private async bootstrap(): Promise<void> {
    const savedSettings = await this.storage.getSettings();
    const savedLayout = await this.storage.getLayout<{
      mode?: LayoutMode | "theater";
      wideHeightPx?: number;
      theaterHeightPx?: number;
    }>();
    const mangaId = this.store.getState().manga.id;
    const progress = await this.storage.getProgress(mangaId);

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
      // forceSettings に挙げたキーは初期値を優先するため保存値を捨てる。
      for (const key of this.forceSettings) {
        delete settingsToApply[key];
      }
      this.store.dispatch({ type: "updateSettings", settings: settingsToApply });
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
    if (typeof progress === "number") {
      this.store.dispatch({ type: "goToPage", pageIndex: progress });
    }

    this.renderer.update(this.store.getState());
    this.renderer.showSplash();
    this.bootstrapOverlayTimer = window.setTimeout(() => {
      if (this.destroyed) {
        return;
      }
      this.toggleOverlay(true);
    }, 1550);
    this.events.emit("ready", { manga: this.store.getState().manga });
  }

  private bindKeyboard(): void {
    const element = this.renderer.getElement();
    const onKeyDown = (event: KeyboardEvent) => {
      if (!this.shouldHandleKeyboardEvent(event)) {
        return;
      }

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
        case "Escape":
          if (this.lockLayoutMode) break;
          event.preventDefault();
          void this.setLayoutMode("inline");
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
          const currentPanel = this.store.getState().panel;
          const menuOpen =
            currentPanel === "menu" ||
            currentPanel === "pages" ||
            currentPanel === "shortcuts";
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
        case "Escape":
          event.preventDefault();
          this.store.dispatch({ type: "setPanel", panel: "none" });
          if (document.fullscreenElement) {
            void document.exitFullscreen();
          }
          break;
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

    return !Boolean(
      target.closest("input, select, textarea, [contenteditable='true']")
    );
  }

  private bindViewportChange(): void {
    this.mobileMediaQuery = window.matchMedia("(max-width: 676px)");
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

  private async setLayoutMode(layoutMode: LayoutMode): Promise<void> {
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

    this.store.dispatch({ type: "setLayoutMode", layoutMode });
    await this.storage.saveSettings(this.store.getState().settings);
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
    }
    if (state.layout.mode !== previous.layout.mode) {
      this.syncBodyScrollLock(state.layout.mode);
    }
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

  private notify(
    message: string,
    tone: "info" | "success" | "error" = "info"
  ): void {
    for (const timer of this.notificationTimers.values()) {
      window.clearTimeout(timer);
    }
    this.notificationTimers.clear();

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

    const timer = window.setTimeout(() => {
      this.store.dispatch({ type: "removeNotification", id });
      this.notificationTimers.delete(id);
    }, 1500);
    this.notificationTimers.set(id, timer);
  }
}
