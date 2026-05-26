import { PRELOAD_PAGE_COUNT } from "../defaults";
import type { ReadingDirection, ViewerState } from "../types";

export type AdjacentDirection = "previous" | "next";
export type PageGroupPlacement = AdjacentDirection | "current";
export type PageGroupSide = "left" | "center" | "right";

export interface PageGroup {
  indexes: number[];
  placement: PageGroupPlacement;
  offset: number;
}

export function getDisplayedPageIndexes(
  state: ViewerState,
  isMobile: boolean
): number[] {
  return getPageIndexesForPageIndex(state, state.currentPageIndex, isMobile);
}

export function getAdjacentPageIndexes(
  state: ViewerState,
  direction: AdjacentDirection,
  isMobile: boolean
): number[] {
  const currentIndexes = getDisplayedPageIndexes(state, isMobile);
  const anchor =
    direction === "previous"
      ? Math.min(...currentIndexes) - 1
      : Math.max(...currentIndexes) + 1;

  if (anchor < 0 || anchor >= state.manga.pages.length) {
    return [];
  }

  return getPageIndexesForPageIndex(state, anchor, isMobile);
}

export function getPreloadedPageGroups(
  state: ViewerState,
  isMobile: boolean
): PageGroup[] {
  const groups: PageGroup[] = [];
  const preloadCount = PRELOAD_PAGE_COUNT;

  for (let distance = preloadCount; distance >= 1; distance -= 1) {
    const indexes = getPageIndexesAtDistance(
      state,
      "previous",
      distance,
      isMobile
    );

    if (indexes.length > 0) {
      groups.push({
        indexes,
        placement: "previous",
        offset: getGroupOffset(state, "previous", distance)
      });
    }
  }

  groups.push({
    indexes: getDisplayedPageIndexes(state, isMobile),
    placement: "current",
    offset: 0
  });

  for (let distance = 1; distance <= preloadCount; distance += 1) {
    const indexes = getPageIndexesAtDistance(state, "next", distance, isMobile);

    if (indexes.length > 0) {
      groups.push({
        indexes,
        placement: "next",
        offset: getGroupOffset(state, "next", distance)
      });
    }
  }

  return groups;
}

function getGroupOffset(
  state: ViewerState,
  direction: AdjacentDirection,
  distance: number
): number {
  const nextSign = state.settings.readingDirection === "rtl" ? -1 : 1;
  const sign = direction === "next" ? nextSign : -nextSign;
  return sign * distance;
}

export function getPageGroupSide(
  state: ViewerState,
  placement: PageGroupPlacement
): PageGroupSide {
  if (placement === "current") {
    return "center";
  }

  const nextSide = state.settings.readingDirection === "rtl" ? "left" : "right";
  const previousSide = nextSide === "left" ? "right" : "left";
  return placement === "next" ? nextSide : previousSide;
}

export function isSwipeToNext(
  deltaX: number,
  direction: ReadingDirection
): boolean {
  return direction === "rtl" ? deltaX > 0 : deltaX < 0;
}

function getPageIndexesAtDistance(
  state: ViewerState,
  direction: AdjacentDirection,
  distance: number,
  isMobile: boolean
): number[] {
  let indexes = getDisplayedPageIndexes(state, isMobile);

  for (let step = 0; step < distance; step += 1) {
    const anchor =
      direction === "previous"
        ? Math.min(...indexes) - 1
        : Math.max(...indexes) + 1;

    if (anchor < 0 || anchor >= state.manga.pages.length) {
      return [];
    }

    indexes = getPageIndexesForPageIndex(state, anchor, isMobile);
  }

  return indexes;
}

export function getPageIndexesForPageIndex(
  state: ViewerState,
  pageIndex: number,
  isMobile: boolean
): number[] {
  const { manga, settings } = state;

  if (
    isMobile ||
    settings.pageTurnMode !== "spread" ||
    (settings.hasCover && pageIndex === 0)
  ) {
    return [pageIndex];
  }

  const partnerIndex = getSpreadPartnerIndex(state, pageIndex);
  const indexes = [pageIndex, partnerIndex].filter(
    (index): index is number => index >= 0 && index < manga.pages.length
  );
  const visualOrder = [...new Set(indexes)].sort((a, b) => a - b);

  return settings.readingDirection === "rtl"
    ? visualOrder.reverse()
    : visualOrder;
}

function getSpreadPartnerIndex(state: ViewerState, pageIndex: number): number {
  if (state.settings.hasCover) {
    return pageIndex % 2 === 1 ? pageIndex + 1 : pageIndex - 1;
  }

  return pageIndex % 2 === 0 ? pageIndex + 1 : pageIndex - 1;
}
