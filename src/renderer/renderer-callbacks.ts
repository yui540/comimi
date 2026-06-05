import type { LayoutMode, ViewerSettings, ViewerState } from "../types";

export interface RendererCallbacks {
  goToPage(pageIndex: number): void;
  nextPage(): void;
  previousPage(): void;
  commitNextPage(): void;
  commitPreviousPage(): void;
  toggleOverlay(force?: boolean): void;
  toggleAutoPageTurn(): void;
  updateSettings(settings: Partial<ViewerSettings>): void;
  setLayoutMode(layoutMode: LayoutMode): void;
  setWideHeight(heightPx: number): void;
  setPanel(panel: ViewerState["panel"]): void;
  setZoom(
    scale: number,
    panX?: number,
    panY?: number,
    pageIndex?: number | null
  ): void;
  setPan(panX: number, panY: number): void;
  resetZoom(): void;
}
