import { AssetLoader } from "../core/asset-loader";
import { renderArrowButtons } from "../components/arrow-buttons";
import { renderCenterMessage } from "../components/center-message";
import { ControlsDock } from "../components/controls-dock";
import { MenuPanel } from "../components/menu-panel";
import { renderMoveDirectionGuide } from "../components/move-direction-guide";
import { ViewModeSwitcher } from "../components/view-mode-switcher";
import {
  getAdjacentPageIndexes,
  getDisplayedPageIndexes,
  getPageGroupSide,
  isSwipeToNext
} from "../components/page-layout";
import { PageStage } from "../components/page-stage";
import { Notifications } from "../components/notifications";
import { renderSplashScreen } from "../components/splash-screen";
import { resolveMascot } from "../components/mascot";
import { createViewerRoot } from "../components/viewer-root";
import { I18n } from "../i18n/i18n";
import { ensureViewerStyles } from "../styles/style-registry";
import type {
  HideableControl,
  MascotAreaOptions,
  MascotOption,
  PageSrcResolver,
  ViewerState
} from "../types";
import type { RendererCallbacks } from "./renderer-callbacks";

interface DragStart {
  x: number;
  y: number;
  panX: number;
  panY: number;
}

const PAGE_TURN_ANIMATION_MS = 180;
const SPLASH_DURATION_MS = 2000;

export class ViewerRenderer {
  private root: HTMLDivElement;
  private cleanup: Array<() => void> = [];
  private mouseStart?: DragStart;
  private touchStart?: DragStart;
  private pinchStart?: { distance: number; scale: number };
  private pageStage: PageStage;
  private pageTurnTimer?: number;
  private splashRemoveTimer?: number;
  private splash?: HTMLElement;
  private isPageTurnAnimating = false;
  private suppressNextClick = false;
  private prevOverlayVisible = false;
  // 中央エリアはオーバーレイ表示中にガイドとメッセージが入れ替わる。
  // それぞれの「実効表示」の前回値を持ち、個別にフェードさせる。
  private prevCenterMessageVisible = false;
  private prevMoveGuideVisible = false;
  private overlayApplyRaf?: number;
  private menuPanel?: MenuPanel;
  private viewModeSwitcher?: ViewModeSwitcher;
  private controlsDock?: ControlsDock;
  private resizeHandle?: HTMLDivElement;
  private viewSizeObserver?: ResizeObserver;
  private autoplayOverlayProgress?: HTMLDivElement;
  private autoplayOverlayProgressBar?: HTMLSpanElement;
  private notifications?: Notifications;
  private destroyed = false;

  constructor(
    private container: HTMLElement,
    private callbacks: RendererCallbacks,
    private assetLoader: AssetLoader,
    private i18n: I18n,
    className?: string,
    resolvePageSrc?: PageSrcResolver,
    private lockLayoutMode = false,
    private mascot?: MascotOption | MascotAreaOptions,
    private hidden: ReadonlySet<HideableControl> = new Set()
  ) {
    ensureViewerStyles();
    this.pageStage = new PageStage({
      assetLoader: this.assetLoader,
      i18n: this.i18n,
      isMobileViewport: () => this.isMobileViewport(),
      resolvePageSrc,
      loadingMascot: resolveMascot(this.mascot, "loading"),
      errorMascot: resolveMascot(this.mascot, "error")
    });
    this.root = createViewerRoot({ className });
    this.container.replaceChildren(this.root);
    this.observeViewSize();
  }

  private observeViewSize(): void {
    const apply = () => {
      this.root.style.setProperty(
        "--view-width",
        `${this.root.offsetWidth}px`
      );
      this.root.style.setProperty(
        "--view-height",
        `${this.root.offsetHeight}px`
      );
    };
    apply();
    if (typeof ResizeObserver !== "undefined") {
      this.viewSizeObserver = new ResizeObserver(apply);
      this.viewSizeObserver.observe(this.root);
    } else {
      window.addEventListener("resize", apply);
      this.cleanup.push(() => window.removeEventListener("resize", apply));
    }
  }

  update(state: ViewerState): void {
    // destroy 後に async 処理（bootstrap の await 後など）から呼ばれても
    // DOM を触らない。これがないと StrictMode の二重マウントで
    // resize handle などが共有 container に二重追加される。
    if (this.destroyed) {
      return;
    }
    if (this.isPageTurnAnimating) {
      return;
    }

    this.cleanup.forEach((clean) => clean());
    this.cleanup = [];
    this.i18n.setLocale(state.settings.locale);
    this.root.dataset.layout = state.layout.mode;
    this.root.dataset.bg = state.settings.backgroundColor;

    if (state.layout.mode === "wide" && state.layout.wideHeightPx) {
      this.root.style.height = `${state.layout.wideHeightPx}px`;
    } else {
      this.root.style.height = "";
    }

    const overlayChanged = this.prevOverlayVisible !== state.overlayVisible;
    // オーバーレイ表示中、中央はまずガイドを出し、約2秒後にメッセージへ入れ替える。
    // ガイドとメッセージは排他で、どちらもオーバーレイ非表示時は出さない。
    const moveGuideVisible = state.overlayVisible && state.moveGuideVisible;
    const centerMessageVisible = state.overlayVisible && !state.moveGuideVisible;
    const moveGuideChanged = this.prevMoveGuideVisible !== moveGuideVisible;
    const centerMessageChanged =
      this.prevCenterMessageVisible !== centerMessageVisible;
    const renderState: ViewerState = overlayChanged
      ? { ...state, overlayVisible: this.prevOverlayVisible }
      : state;
    // 「前回値で描画してから rAF で反転」方式でフェードさせる。
    // 描画用の値は変化時のみ前回値を使う。
    const moveGuideRenderVisible = moveGuideChanged
      ? this.prevMoveGuideVisible
      : moveGuideVisible;
    const centerMessageRenderVisible = centerMessageChanged
      ? this.prevCenterMessageVisible
      : centerMessageVisible;

    if (!this.menuPanel) {
      this.menuPanel = new MenuPanel(this.callbacks, this.i18n, {
        lockLayoutMode: this.lockLayoutMode,
        mascot: resolveMascot(this.mascot, "menu")
      });
    }
    if (
      !this.viewModeSwitcher &&
      !this.lockLayoutMode &&
      !this.hidden.has("viewMode")
    ) {
      this.viewModeSwitcher = new ViewModeSwitcher(this.callbacks, this.i18n);
    }
    if (!this.controlsDock) {
      this.controlsDock = new ControlsDock(
        this.callbacks,
        this.i18n,
        resolveMascot(this.mascot, "menu"),
        this.hidden
      );
    }
    if (!this.notifications) {
      this.notifications = new Notifications();
    }
    const stageEl = this.pageStage.getElement();
    const menuPanelEl = this.menuPanel.getElement();
    const viewModeSwitcherEl = this.viewModeSwitcher?.getElement();
    const controlsDockEl = this.controlsDock.getElement();
    const notificationsEl = this.notifications.getElement();

    // Remove non-persistent children, keep persistent ones in DOM
    Array.from(this.root.children).forEach((child) => {
      if (
        child !== stageEl &&
        child !== menuPanelEl &&
        child !== viewModeSwitcherEl &&
        child !== controlsDockEl &&
        child !== this.splash &&
        child !== this.autoplayOverlayProgress &&
        child !== notificationsEl
      ) {
        child.remove();
      }
    });

    if (stageEl.parentNode !== this.root) {
      this.root.prepend(stageEl);
    }
    this.pageStage.update(state, this.isMobileViewport());
    this.pageStage.snapTransform();

    const newChildren: Node[] = [
      renderCenterMessage(centerMessageRenderVisible, this.i18n),
      renderMoveDirectionGuide(
        state.settings.readingDirection,
        moveGuideRenderVisible,
        this.i18n
      ),
      renderArrowButtons({ state: renderState, callbacks: this.callbacks })
    ];

    this.syncResizeHandle(state.layout.mode === "wide");

    const reference = menuPanelEl.parentNode === this.root ? menuPanelEl : null;
    if (reference) {
      newChildren.forEach((child) => this.root.insertBefore(child, reference));
    } else {
      newChildren.forEach((child) => this.root.appendChild(child));
      this.root.appendChild(menuPanelEl);
    }

    if (viewModeSwitcherEl && viewModeSwitcherEl.parentNode !== this.root) {
      this.root.appendChild(viewModeSwitcherEl);
    }
    if (controlsDockEl.parentNode !== this.root) {
      this.root.appendChild(controlsDockEl);
    }
    if (notificationsEl.parentNode !== this.root) {
      this.root.appendChild(notificationsEl);
    }

    this.menuPanel.update(renderState);
    this.viewModeSwitcher?.update(renderState);
    this.controlsDock.update(renderState, this.isMobileViewport());
    this.notifications.update(state);

    this.syncAutoplayOverlayProgress(state);

    if (this.splash && this.splash.parentNode !== this.root) {
      this.root.append(this.splash);
    }

    this.bindGestures(state);

    if (this.overlayApplyRaf !== undefined) {
      cancelAnimationFrame(this.overlayApplyRaf);
      this.overlayApplyRaf = undefined;
    }

    if (overlayChanged || centerMessageChanged || moveGuideChanged) {
      const overlayTarget = state.overlayVisible;
      const centerTarget = centerMessageVisible;
      const guideTarget = moveGuideVisible;
      // Force sync layout so the browser commits the "from" state before flip.
      void this.root.offsetWidth;
      this.overlayApplyRaf = requestAnimationFrame(() => {
        this.overlayApplyRaf = undefined;
        if (overlayChanged) {
          this.applyOverlayVisibility(overlayTarget);
        }
        if (centerMessageChanged) {
          this.applyCenterMessageVisibility(centerTarget);
        }
        if (moveGuideChanged) {
          this.applyMoveGuideVisibility(guideTarget);
        }
      });
    }

    this.prevOverlayVisible = state.overlayVisible;
    this.prevCenterMessageVisible = centerMessageVisible;
    this.prevMoveGuideVisible = moveGuideVisible;
  }

  private applyCenterMessageVisibility(visible: boolean): void {
    const flag = String(visible);
    this.root
      .querySelectorAll<HTMLElement>(".comimi-center-message")
      .forEach((element) => {
        element.dataset.overlay = flag;
      });
  }

  private applyMoveGuideVisibility(visible: boolean): void {
    const flag = String(visible);
    this.root
      .querySelectorAll<HTMLElement>(".comimi-move-guide")
      .forEach((element) => {
        element.dataset.visible = flag;
      });
  }

  private applyOverlayVisibility(visible: boolean): void {
    const flag = String(visible);
    this.root
      .querySelectorAll<HTMLElement>(
        ".comimi-arrows, .comimi-menu-panel, .comimi-view-switcher, .comimi-controls-dock, .comimi-stage"
      )
      .forEach((element) => {
        element.dataset.overlay = flag;
      });
  }

  showSplash(): void {
    if (this.destroyed || this.splash) {
      return;
    }

    this.splash = renderSplashScreen(
      this.i18n,
      resolveMascot(this.mascot, "splash")
    );
    this.root.append(this.splash);
    this.splashRemoveTimer = window.setTimeout(() => {
      this.splash?.remove();
      this.splash = undefined;
    }, SPLASH_DURATION_MS);
  }

  destroy(): void {
    this.destroyed = true;
    window.clearTimeout(this.pageTurnTimer);
    window.clearTimeout(this.splashRemoveTimer);
    if (this.overlayApplyRaf !== undefined) {
      cancelAnimationFrame(this.overlayApplyRaf);
      this.overlayApplyRaf = undefined;
    }
    this.cleanup.forEach((clean) => clean());
    this.cleanup = [];
    this.viewSizeObserver?.disconnect();
    this.viewSizeObserver = undefined;
    this.resizeHandle?.remove();
    this.resizeHandle = undefined;
    this.root.remove();
  }

  getElement(): HTMLElement {
    return this.root;
  }

  isAnimatingPageTurn(): boolean {
    return this.isPageTurnAnimating;
  }

  animatePageTurn(
    state: ViewerState,
    direction: "previous" | "next",
    onComplete: () => void
  ): boolean {
    window.clearTimeout(this.pageTurnTimer);

    if (
      this.isPageTurnAnimating ||
      getAdjacentPageIndexes(state, direction, this.isMobileViewport()).length === 0
    ) {
      return false;
    }

    this.isPageTurnAnimating = true;
    this.setStageDragOffset(this.getPageTurnTargetOffset(state, direction), true);
    this.pageTurnTimer = window.setTimeout(() => {
      this.isPageTurnAnimating = false;
      onComplete();
    }, PAGE_TURN_ANIMATION_MS);

    return true;
  }

  isMobileViewport(): boolean {
    return window.matchMedia("(max-width: 767px)").matches;
  }

  private syncAutoplayOverlayProgress(state: ViewerState): void {
    if (!state.autoPageTurnEnabled) {
      if (this.autoplayOverlayProgress) {
        this.autoplayOverlayProgress.remove();
        this.autoplayOverlayProgress = undefined;
        this.autoplayOverlayProgressBar = undefined;
      }
      return;
    }

    if (!this.autoplayOverlayProgress) {
      this.autoplayOverlayProgress = document.createElement("div");
      this.autoplayOverlayProgress.className = "comimi-autoplay-overlay-progress";
      this.autoplayOverlayProgressBar = document.createElement("span");
      this.autoplayOverlayProgressBar.className =
        "comimi-autoplay-overlay-progress-bar";
      this.autoplayOverlayProgress.append(this.autoplayOverlayProgressBar);
    }

    if (this.autoplayOverlayProgress.parentNode !== this.root) {
      this.root.appendChild(this.autoplayOverlayProgress);
    }

    this.autoplayOverlayProgress.dataset.visible = String(
      !state.overlayVisible
    );
    this.autoplayOverlayProgressBar!.style.animationDuration = `${state.settings.autoPageTurnIntervalMs}ms`;
  }

  private clampPan(
    panX: number,
    panY: number,
    scale: number,
    state: ViewerState
  ): { x: number; y: number } {
    if (scale <= 1) {
      return { x: 0, y: 0 };
    }
    const isMobile = this.isMobileViewport();
    const indexes = getDisplayedPageIndexes(state, isMobile);
    const isSpread = indexes.length > 1;
    const slotWidth = isSpread
      ? this.root.offsetWidth / 2
      : this.root.offsetWidth;
    const slotHeight = this.root.offsetHeight;
    const maxX = (slotWidth * (scale - 1)) / 2;
    const maxY = (slotHeight * (scale - 1)) / 2;
    return {
      x: Math.min(Math.max(panX, -maxX), maxX),
      y: Math.min(Math.max(panY, -maxY), maxY)
    };
  }

  private clampedZoom(scale: number, state: ViewerState): number {
    return Math.min(
      Math.max(scale, state.settings.zoom.min),
      state.settings.zoom.max
    );
  }

  private syncResizeHandle(needsHandle: boolean): void {
    if (needsHandle) {
      if (!this.resizeHandle) {
        this.resizeHandle = this.createResizeHandle();
      }
      if (this.resizeHandle.parentNode !== this.container) {
        this.container.appendChild(this.resizeHandle);
      }
    } else if (this.resizeHandle) {
      this.resizeHandle.remove();
    }
  }

  private createResizeHandle(): HTMLDivElement {
    const handle = document.createElement("div");
    handle.className = "comimi-resize-handle";
    handle.setAttribute("role", "separator");
    handle.setAttribute("aria-orientation", "horizontal");

    let startY = 0;
    let startHeight = 0;
    let activePointerId: number | undefined;

    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) return;
      this.callbacks.setWideHeight(startHeight + event.clientY - startY);
    };
    const onUp = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) return;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      activePointerId = undefined;
    };

    handle.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      activePointerId = event.pointerId;
      startY = event.clientY;
      startHeight = this.root.getBoundingClientRect().height;
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    });

    return handle;
  }

  private bindGestures(state: ViewerState): void {
    const onClick = (event: MouseEvent) => {
      if (this.suppressNextClick || this.isPageTurnAnimating) {
        this.suppressNextClick = false;
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (this.isInteractiveTarget(event.target)) {
        return;
      }

      if (!state.overlayVisible) {
        const rect = this.root.getBoundingClientRect();
        const ratio = (event.clientX - rect.left) / rect.width;
        if (ratio < 0.3 || ratio >= 0.7) {
          const side: "left" | "right" = ratio < 0.3 ? "left" : "right";
          const goNext =
            state.settings.readingDirection === "rtl"
              ? side === "left"
              : side === "right";
          if (goNext) {
            this.callbacks.nextPage();
          } else {
            this.callbacks.previousPage();
          }
          return;
        }
      }

      this.callbacks.toggleOverlay();
    };
    const onWheel = (event: WheelEvent) => {
      if (this.isInteractiveTarget(event.target)) {
        return;
      }

      if (!event.ctrlKey && !event.metaKey) {
        return;
      }

      event.preventDefault();

      // カーソルが乗っているページ（スロット）を特定する。
      // 見開きでは左右どちらか一方だけがズーム対象になる。
      const slot =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>(".comimi-page")
          : null;
      if (!slot) {
        return;
      }
      const pageIndex = Number(slot.dataset.pageIndex);
      if (Number.isNaN(pageIndex)) {
        return;
      }

      // 対象ページが変わったら、そのページは等倍から開始する
      // （直前に別ページをズームしていてもその状態は引き継がない）。
      const sameTarget = state.zoomPageIndex === pageIndex;
      const baseScale = sameTarget ? state.zoomScale : 1;
      const basePanX = sameTarget ? state.panX : 0;
      const basePanY = sameTarget ? state.panY : 0;

      const delta =
        event.deltaY > 0 ? -state.settings.zoom.step : state.settings.zoom.step;
      const nextScale = this.clampedZoom(baseScale + delta, state);

      // カーソル直下の点を固定したままズームする（カーソル中心ズーム）。
      // transform-origin はスロット中心なので、スロット中心からの相対座標で計算。
      // pan' = pan * r + (cursor - center) * (1 - r)  （r = nextScale / baseScale）
      const rect = slot.getBoundingClientRect();
      const cursorX = event.clientX - (rect.left + rect.width / 2);
      const cursorY = event.clientY - (rect.top + rect.height / 2);
      const ratio = baseScale === 0 ? 1 : nextScale / baseScale;
      const panX = basePanX * ratio + cursorX * (1 - ratio);
      const panY = basePanY * ratio + cursorY * (1 - ratio);

      const clampedPan = this.clampPan(panX, panY, nextScale, state);
      this.callbacks.setZoom(
        nextScale,
        clampedPan.x,
        clampedPan.y,
        pageIndex
      );
    };
    const onMouseDown = (event: MouseEvent) => {
      // 新しいジェスチャの開始時に、前回の操作で立った抑止フラグを必ず解放する。
      // スワイプ（touch）は合成clickを発火しないためフラグが残り、次のタップを1回食う。
      this.suppressNextClick = false;
      if (this.isPageTurnAnimating || this.isSwipeBlockingTarget(event.target)) {
        return;
      }

      if (event.button !== 0) {
        return;
      }

      this.mouseStart = {
        x: event.clientX,
        y: event.clientY,
        panX: state.panX,
        panY: state.panY
      };
    };
    const onMouseMove = (event: MouseEvent) => {
      if (!this.mouseStart) {
        return;
      }

      event.preventDefault();
      const deltaX = event.clientX - this.mouseStart.x;
      const deltaY = event.clientY - this.mouseStart.y;
      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        this.suppressNextClick = true;
      }

      if (state.zoomScale <= 1) {
        this.setStageDragOffset(
          this.constrainDragOffset(deltaX, deltaY, state)
        );
        return;
      }

      const panX = this.mouseStart.panX + event.clientX - this.mouseStart.x;
      const panY = this.mouseStart.panY + event.clientY - this.mouseStart.y;
      const clamped = this.clampPan(panX, panY, state.zoomScale, state);
      this.callbacks.setPan(clamped.x, clamped.y);
    };
    const onMouseUp = (event: MouseEvent) => {
      if (!this.mouseStart) {
        return;
      }

      const deltaX = event.clientX - this.mouseStart.x;
      const deltaY = event.clientY - this.mouseStart.y;
      this.handleSwipeEnd(deltaX, deltaY, state);
      this.mouseStart = undefined;
    };
    const onTouchStart = (event: TouchEvent) => {
      // 新しいジェスチャの開始時に、前回の操作で立った抑止フラグを必ず解放する。
      // スワイプは合成clickを発火しないためフラグが残り、次のタップを1回食う。
      this.suppressNextClick = false;
      if (this.isPageTurnAnimating) {
        return;
      }

      if (event.touches.length === 2) {
        event.preventDefault();
        this.touchStart = undefined;
        this.pinchStart = {
          distance: touchDistance(event),
          scale: state.zoomScale
        };
        return;
      }

      if (this.isSwipeBlockingTarget(event.target)) {
        return;
      }

      const touch = event.touches[0];
      if (!touch) {
        return;
      }

      this.touchStart = {
        x: touch.clientX,
        y: touch.clientY,
        panX: state.panX,
        panY: state.panY
      };
    };
    const onTouchMove = (event: TouchEvent) => {
      if (this.pinchStart && event.touches.length === 2) {
        event.preventDefault();
        const requested =
          this.pinchStart.scale *
          (touchDistance(event) / this.pinchStart.distance);
        const nextScale = this.clampedZoom(requested, state);
        const clampedPan = this.clampPan(
          state.panX,
          state.panY,
          nextScale,
          state
        );
        this.callbacks.setZoom(nextScale, clampedPan.x, clampedPan.y);
        return;
      }

      if (this.isSwipeBlockingTarget(event.target)) {
        return;
      }

      const touch = event.touches[0];
      if (!touch || !this.touchStart) {
        return;
      }

      event.preventDefault();
      const deltaX = touch.clientX - this.touchStart.x;
      const deltaY = touch.clientY - this.touchStart.y;
      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        this.suppressNextClick = true;
      }

      if (state.zoomScale <= 1) {
        this.setStageDragOffset(
          this.constrainDragOffset(deltaX, deltaY, state)
        );
        return;
      }

      const panX = this.touchStart.panX + touch.clientX - this.touchStart.x;
      const panY = this.touchStart.panY + touch.clientY - this.touchStart.y;
      const clamped = this.clampPan(panX, panY, state.zoomScale, state);
      this.callbacks.setPan(clamped.x, clamped.y);
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (event.touches.length < 2) {
        this.pinchStart = undefined;
      }

      const touch = event.changedTouches[0];
      if (!touch || !this.touchStart) {
        this.touchStart = undefined;
        return;
      }

      const deltaX = touch.clientX - this.touchStart.x;
      const deltaY = touch.clientY - this.touchStart.y;
      this.handleSwipeEnd(deltaX, deltaY, state);
      this.touchStart = undefined;
    };
    const onCaptureClick = (event: MouseEvent) => {
      if (this.suppressNextClick || this.isPageTurnAnimating) return;
      if (state.panel !== "settings") return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".comimi-settings")) return;
      this.callbacks.setPanel("none");
    };

    // リンクや画像のネイティブドラッグ（ゴースト画像）を抑止し、
    // スワイプ中のドラッグ追従が奪われないようにする。
    const onDragStart = (event: DragEvent) => {
      if (this.isSwipeBlockingTarget(event.target)) {
        return;
      }
      event.preventDefault();
    };

    this.root.addEventListener("click", onCaptureClick, true);
    this.root.addEventListener("click", onClick);
    this.root.addEventListener("wheel", onWheel, { passive: false });
    this.root.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    this.root.addEventListener("touchstart", onTouchStart, { passive: false });
    this.root.addEventListener("touchmove", onTouchMove, { passive: false });
    this.root.addEventListener("touchend", onTouchEnd);
    this.root.addEventListener("dragstart", onDragStart);

    this.cleanup.push(
      () => this.root.removeEventListener("click", onCaptureClick, true),
      () => this.root.removeEventListener("click", onClick),
      () => this.root.removeEventListener("wheel", onWheel),
      () => this.root.removeEventListener("mousedown", onMouseDown),
      () => window.removeEventListener("mousemove", onMouseMove),
      () => window.removeEventListener("mouseup", onMouseUp),
      () => this.root.removeEventListener("touchstart", onTouchStart),
      () => this.root.removeEventListener("touchmove", onTouchMove),
      () => this.root.removeEventListener("touchend", onTouchEnd),
      () => this.root.removeEventListener("dragstart", onDragStart)
    );
  }

  private handleSwipeEnd(
    deltaX: number,
    deltaY: number,
    state: ViewerState
  ): void {
    window.clearTimeout(this.pageTurnTimer);

    const shouldPage =
      state.zoomScale <= 1 &&
      Math.abs(deltaX) > 30 &&
      Math.abs(deltaX) > Math.abs(deltaY);

    if (!shouldPage) {
      this.setStageDragOffset(0, true);
      return;
    }

    const direction = isSwipeToNext(deltaX, state.settings.readingDirection)
      ? "next"
      : "previous";
    const hasAdjacentPage =
      getAdjacentPageIndexes(state, direction, this.isMobileViewport()).length >
      0;

    if (!hasAdjacentPage) {
      this.setStageDragOffset(0, true);
      return;
    }

    if (!this.requestPageTurn(state, direction)) {
      direction === "next"
        ? this.callbacks.commitNextPage()
        : this.callbacks.commitPreviousPage();
    }
  }

  private requestPageTurn(
    state: ViewerState,
    direction: "previous" | "next"
  ): boolean {
    return this.animatePageTurn(state, direction, () => {
      direction === "next"
        ? this.callbacks.commitNextPage()
        : this.callbacks.commitPreviousPage();
    });
  }

  private constrainDragOffset(
    deltaX: number,
    deltaY: number,
    state: ViewerState
  ): number {
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return 0;
    }

    const isDraggingToNext = isSwipeToNext(
      deltaX,
      state.settings.readingDirection
    );
    const adjacentDirection = isDraggingToNext ? "next" : "previous";
    const hasAdjacentPage =
      getAdjacentPageIndexes(state, adjacentDirection, this.isMobileViewport())
        .length > 0;

    if (!hasAdjacentPage) {
      return this.applyEdgeResistance(deltaX);
    }

    return deltaX;
  }

  private applyEdgeResistance(deltaX: number): number {
    const direction = Math.sign(deltaX);
    const distance = Math.abs(deltaX);
    const viewportWidth = Math.max(this.root.clientWidth, 1);
    const maxPull = Math.min(viewportWidth * 0.22, 140);
    const resisted = maxPull * (1 - Math.exp(-distance / maxPull));

    return direction * resisted;
  }

  private setStageDragOffset(offsetX: number, animate = false): void {
    this.pageStage.setDragOffset(offsetX, animate);
  }

  private getPageTurnTargetOffset(
    state: ViewerState,
    direction: "previous" | "next"
  ): number {
    const side = getPageGroupSide(state, direction);
    return side === "left" ? this.root.clientWidth : -this.root.clientWidth;
  }

  private isInteractiveTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) {
      return false;
    }

    return Boolean(
      target.closest(
        [
          ".comimi-arrow-button",
          ".comimi-view-switcher",
          ".comimi-controls-dock",
          ".comimi-menu-panel",
          ".comimi-settings-panel",
          "button",
          "input",
          "select",
          "textarea",
          "a",
          "iframe"
        ].join(",")
      )
    );
  }

  // スワイプ（ページめくり）を開始させない要素。
  // リンク（a）はジェスチャー追跡を許可し、タップなら遷移／スワイプならめくりに振り分ける。
  private isSwipeBlockingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) {
      return false;
    }

    return Boolean(
      target.closest(
        [
          ".comimi-arrow-button",
          ".comimi-view-switcher",
          ".comimi-controls-dock",
          ".comimi-menu-panel",
          ".comimi-settings-panel",
          "button",
          "input",
          "select",
          "textarea",
          "iframe"
        ].join(",")
      )
    );
  }
}

function touchDistance(event: TouchEvent): number {
  const [a, b] = Array.from(event.touches);
  if (!a || !b) {
    return 1;
  }

  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}
