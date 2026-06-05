import { MangaViewerCore } from "./core/manga-viewer-core";
import type { MangaViewerInstance, MangaViewerOptions } from "./types";

export function createMangaViewer(
  container: HTMLElement,
  options: MangaViewerOptions,
): MangaViewerInstance {
  return new MangaViewerCore(container, options);
}

export type {
  HideableControl,
  HtmlPage,
  ImagePage,
  LayoutMode,
  Manga,
  MangaPage,
  MangaViewerInstance,
  MangaViewerOptions,
  MascotAreaOptions,
  MascotOption,
  PageTurnMode,
  ReadingDirection,
  TranslationMap,
  ViewerEventHandler,
  ViewerEventMap,
  ViewerEventName,
  ViewerSettings,
  ViewerState,
} from "./types";
