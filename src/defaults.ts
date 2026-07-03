import type { Manga, ViewerSettings, ViewerState } from "./types";

export const PRELOAD_PAGE_COUNT = 1;

export const PRELOAD_IMAGE_COUNT = 4;

export const defaultSettings: ViewerSettings = {
  locale: "ja",
  hasCover: true,
  readingDirection: "rtl",
  pageTurnMode: "single",
  layoutMode: "inline",
  autoPageTurnIntervalMs: 5000,
  backgroundColor: "white",
  theme: "light",
  zoom: {
    min: 1,
    max: 4,
    step: 0.25
  }
};

export function createInitialState(
  manga: Manga,
  settings: ViewerSettings,
  pageIndex = 0
): ViewerState {
  const currentPageIndex = clampPageIndex(pageIndex, manga.pages.length);

  return {
    manga,
    currentPageIndex,
    visiblePageIndexes: calculateVisiblePageIndexes(
      currentPageIndex,
      manga.pages.length,
      settings
    ),
    overlayVisible: false,
    moveGuideVisible: false,
    autoPageTurnEnabled: false,
    zoomScale: 1,
    panX: 0,
    panY: 0,
    zoomPageIndex: null,
    settings,
    layout: {
      mode: settings.layoutMode
    },
    notifications: [],
    panel: "none"
  };
}

export function mergeSettings(
  base: ViewerSettings,
  updates?: Partial<ViewerSettings>
): ViewerSettings {
  return {
    ...base,
    ...updates,
    zoom: {
      ...base.zoom,
      ...updates?.zoom
    }
  };
}

export function clampZoom(
  scale: number,
  zoom: ViewerSettings["zoom"]
): number {
  return Math.min(Math.max(scale, zoom.min), zoom.max);
}

export function clampPageIndex(pageIndex: number, pageCount: number): number {
  if (pageCount <= 0) {
    return 0;
  }

  return Math.min(Math.max(Math.round(pageIndex), 0), pageCount - 1);
}

export function getPageStep(settings: ViewerSettings, pageIndex: number): number {
  if (settings.pageTurnMode === "single") {
    return 1;
  }

  if (settings.hasCover && pageIndex === 0) {
    return 1;
  }

  return 2;
}

export function calculateVisiblePageIndexes(
  currentPageIndex: number,
  pageCount: number,
  settings: ViewerSettings
): number[] {
  const indexes = new Set<number>();
  const first = Math.max(0, currentPageIndex - PRELOAD_PAGE_COUNT);
  const last = Math.min(pageCount - 1, currentPageIndex + PRELOAD_PAGE_COUNT);

  for (let index = first; index <= last; index += 1) {
    indexes.add(index);
  }

  if (
    settings.pageTurnMode === "spread" &&
    !(settings.hasCover && currentPageIndex === 0)
  ) {
    const partner =
      settings.hasCover && currentPageIndex > 0
        ? currentPageIndex + (currentPageIndex % 2 === 1 ? 1 : -1)
        : currentPageIndex + (currentPageIndex % 2 === 0 ? 1 : -1);

    if (partner >= 0 && partner < pageCount) {
      indexes.add(partner);
    }
  }

  return [...indexes].sort((a, b) => a - b);
}
