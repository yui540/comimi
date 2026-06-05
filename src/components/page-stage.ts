import { AssetLoader } from "../core/asset-loader";
import { I18n } from "../i18n/i18n";
import type {
  ImagePage,
  MangaPage,
  PageSrcResolver,
  ViewerState
} from "../types";
import { renderErrorIcon } from "./error-icon";
import { renderLoadingIcon } from "./loading-icon";
import {
  getPageGroupSide,
  getPreloadedPageGroups,
  type PageGroupPlacement
} from "./page-layout";

export interface PageStageOptions {
  assetLoader: AssetLoader;
  i18n: I18n;
  isMobileViewport: () => boolean;
  resolvePageSrc?: PageSrcResolver;
}

interface CachedSlot {
  slot: HTMLDivElement;
  img: HTMLImageElement | null;
}

export class PageStage {
  private root: HTMLDivElement;
  private imageSources = new Map<string, string>();
  private resolvePromises = new Map<string, Promise<string>>();
  private slots = new Map<string, CachedSlot>();

  constructor(private options: PageStageOptions) {
    this.root = document.createElement("div");
    this.root.className = "comimi-stage";
  }

  getElement(): HTMLDivElement {
    return this.root;
  }

  setDragOffset(offsetX: number, animate = false): void {
    this.root.dataset.dragging = animate ? "false" : String(offsetX !== 0);
    this.root.style.transform = offsetX === 0 ? "" : `translateX(${offsetX}px)`;
  }

  /**
   * Reset the stage transform without triggering the CSS transition.
   * Used after a page turn animation finishes so the freshly committed
   * page does not slide back into place.
   */
  snapTransform(): void {
    this.root.dataset.dragging = "false";
    this.root.style.transition = "none";
    this.root.style.transform = "";
    // Force synchronous layout so the browser commits the new transform under
    // `transition: none` before we restore transitions. Without this, Android/
    // Chromium can batch the style writes and animate from the old offset back
    // to 0 (a visible "spring back" in the opposite direction of the page turn).
    void this.root.offsetWidth;
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => {
        this.root.style.transition = "";
      });
    } else {
      this.root.style.transition = "";
    }
  }

  update(state: ViewerState, isMobile: boolean): void {
    const groupSpecs = getPreloadedPageGroups(state, isMobile);
    const newGroups: HTMLDivElement[] = [];

    for (const groupSpec of groupSpecs) {
      const groupEl = document.createElement("div");
      groupEl.className = "comimi-page-group";
      groupEl.dataset.placement = groupSpec.placement;
      groupEl.dataset.side = getPageGroupSide(state, groupSpec.placement);
      groupEl.style.transform = `translateX(${groupSpec.offset * 100}%)`;

      const isSpread = groupSpec.indexes.length > 1;
      for (const [visualIndex, pageIndex] of groupSpec.indexes.entries()) {
        const page = state.manga.pages[pageIndex];
        if (!page) {
          continue;
        }
        const cached = this.getOrBuildSlot(state, page, pageIndex, isSpread);
        cached.slot.dataset.spread = String(isSpread);
        cached.slot.dataset.position = isSpread
          ? visualIndex === 0
            ? "left"
            : "right"
          : "single";
        cached.slot.dataset.pageIndex = String(pageIndex);
        if (cached.img) {
          // zoomPageIndex が null なら全ページに適用（ピンチ等の従来挙動）。
          // 指定があれば、そのページ（カーソルが当たっているページ）だけズーム。
          const applyZoom =
            state.zoomPageIndex === null || state.zoomPageIndex === pageIndex;
          cached.img.style.transform = applyZoom ? pageTransform(state) : "";
        }
        groupEl.append(cached.slot);
      }

      newGroups.push(groupEl);
    }

    this.root.replaceChildren(...newGroups);
  }

  private getOrBuildSlot(
    state: ViewerState,
    page: MangaPage,
    pageIndex: number,
    isSpread: boolean
  ): CachedSlot {
    const existing = this.slots.get(page.id);
    if (existing) {
      return existing;
    }
    const built = this.buildSlot(state, page, pageIndex, isSpread);
    this.slots.set(page.id, built);
    return built;
  }

  private buildSlot(
    state: ViewerState,
    page: MangaPage,
    pageIndex: number,
    isSpread: boolean
  ): CachedSlot {
    const slot = document.createElement("div");
    slot.className = "comimi-page";

    if (page.type === "html") {
      const frame = document.createElement("div");
      frame.className = "comimi-html-page";
      if (page.element) {
        frame.append(page.element);
      } else if (page.html != null) {
        frame.innerHTML = page.html;
      }
      frame.style.transform = pageTransform(state);
      slot.append(frame);
      return { slot, img: null };
    }

    const img = document.createElement("img");
    img.alt = page.alt ?? page.label ?? `${pageIndex + 1}`;
    img.draggable = false;
    img.style.transform = pageTransform(state);
    img.addEventListener("error", () => {
      slot.replaceChildren(renderErrorIcon(this.options.i18n, pageIndex + 1));
    });
    img.addEventListener("contextmenu", (event) => event.preventDefault());
    slot.append(img);

    const imageKey = `${state.manga.id}:${page.id}`;
    const cachedSource = this.imageSources.get(imageKey);
    if (cachedSource) {
      img.src = cachedSource;
      return { slot, img };
    }

    const loading = renderLoadingIcon(this.options.i18n);
    slot.append(loading);
    img.style.visibility = "hidden";

    let promise = this.resolvePromises.get(imageKey);
    if (!promise) {
      const resolver = this.options.resolvePageSrc;
      promise = resolver
        ? Promise.resolve(
            resolver({ page: page as ImagePage, pageIndex, isSpread })
          )
        : this.options.assetLoader.resolveImageSource(state.manga.id, page);
      this.resolvePromises.set(imageKey, promise);
      promise
        .then((src) => {
          this.imageSources.set(imageKey, src);
        })
        .finally(() => {
          this.resolvePromises.delete(imageKey);
        });
    }

    promise
      .then((src) => {
        img.addEventListener(
          "load",
          () => {
            img.style.visibility = "";
            loading.remove();
          },
          { once: true }
        );
        img.src = src;
      })
      .catch(() => {
        loading.remove();
        slot.replaceChildren(renderErrorIcon(this.options.i18n, pageIndex + 1));
      });

    return { slot, img };
  }
}

function pageTransform(state: ViewerState): string {
  return `translate(${state.panX}px, ${state.panY}px) scale(${state.zoomScale})`;
}
