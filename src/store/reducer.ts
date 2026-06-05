import {
  calculateVisiblePageIndexes,
  clampPageIndex,
  getPageStep,
  mergeSettings
} from "../defaults";
import type { ViewerAction, ViewerState } from "../types";

export function reducer(state: ViewerState, action: ViewerAction): ViewerState {
  switch (action.type) {
    case "setManga": {
      const currentPageIndex = clampPageIndex(
        action.pageIndex ?? 0,
        action.manga.pages.length
      );

      return withVisiblePages({
        ...state,
        manga: action.manga,
        currentPageIndex,
        zoomScale: 1,
        panX: 0,
        panY: 0,
        zoomPageIndex: null
      });
    }

    case "goToPage": {
      const nextPageIndex = clampPageIndex(
        action.pageIndex,
        state.manga.pages.length
      );
      const alreadyReset =
        state.zoomScale === 1 && state.panX === 0 && state.panY === 0;
      if (nextPageIndex === state.currentPageIndex && alreadyReset) {
        return state;
      }
      return withVisiblePages({
        ...state,
        currentPageIndex: nextPageIndex,
        zoomScale: 1,
        panX: 0,
        panY: 0,
        zoomPageIndex: null
      });
    }

    case "nextPage": {
      const step = getPageStep(state.settings, state.currentPageIndex);
      return reducer(state, {
        type: "goToPage",
        pageIndex: state.currentPageIndex + step
      });
    }

    case "previousPage": {
      const step = getPageStep(state.settings, state.currentPageIndex);
      return reducer(state, {
        type: "goToPage",
        pageIndex: state.currentPageIndex - step
      });
    }

    case "setOverlayVisible":
      return {
        ...state,
        overlayVisible: action.visible,
        panel: action.visible ? state.panel : "none"
      };

    case "setMoveGuideVisible":
      if (state.moveGuideVisible === action.visible) {
        return state;
      }
      return {
        ...state,
        moveGuideVisible: action.visible
      };

    case "toggleAutoPageTurn":
      return {
        ...state,
        autoPageTurnEnabled: !state.autoPageTurnEnabled
      };

    case "updateSettings": {
      const settings = mergeSettings(state.settings, action.settings);
      return withVisiblePages({
        ...state,
        settings,
        layout: {
          ...state.layout,
          mode: settings.layoutMode
        }
      });
    }

    case "setLayoutMode":
      return reducer(state, {
        type: "updateSettings",
        settings: { layoutMode: action.layoutMode }
      });

    case "setWideHeight":
      return {
        ...state,
        layout: {
          ...state.layout,
          wideHeightPx: Math.max(240, Math.round(action.heightPx))
        }
      };

    case "setZoom": {
      const zoomScale = clampZoom(action.scale, state);
      // 等倍に戻ったらパンとズーム対象もクリアする。
      if (zoomScale <= 1) {
        return {
          ...state,
          zoomScale: 1,
          panX: 0,
          panY: 0,
          zoomPageIndex: null
        };
      }
      return {
        ...state,
        zoomScale,
        panX: action.panX ?? state.panX,
        panY: action.panY ?? state.panY,
        zoomPageIndex:
          action.pageIndex !== undefined
            ? action.pageIndex
            : state.zoomPageIndex
      };
    }

    case "setPan":
      return {
        ...state,
        panX: action.panX,
        panY: action.panY
      };

    case "resetZoom":
      return {
        ...state,
        zoomScale: 1,
        panX: 0,
        panY: 0,
        zoomPageIndex: null
      };

    case "setPanel":
      return {
        ...state,
        panel: action.panel,
        overlayVisible: action.panel !== "none" ? true : state.overlayVisible
      };

    case "pushNotification":
      return {
        ...state,
        notifications: [action.notification]
      };

    case "removeNotification":
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.id
        )
      };
  }
}

function withVisiblePages(state: ViewerState): ViewerState {
  return {
    ...state,
    visiblePageIndexes: calculateVisiblePageIndexes(
      state.currentPageIndex,
      state.manga.pages.length,
      state.settings
    )
  };
}

function clampZoom(scale: number, state: ViewerState): number {
  return Math.min(
    Math.max(scale, state.settings.zoom.min),
    state.settings.zoom.max
  );
}
