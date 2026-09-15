import { I18n } from "../i18n/i18n";
import type { LayoutMode, ViewerState } from "../types";
import type { RendererCallbacks } from "../renderer/renderer-callbacks";
import { icon, type IconName } from "./icons";

// インジケーターの移動量。CSS の grid-template-columns と揃える。
const BUTTON_WIDTH = 42;

interface ModeEntry {
  mode: LayoutMode;
  iconName: IconName;
  labelKey: string;
  button: HTMLButtonElement;
  iconWrap: HTMLSpanElement;
  tooltip: HTMLSpanElement;
}

/** コントロールドック内（設定ボタンの横）に置く表示モード切替。 */
export class ViewModeSwitcher {
  private root: HTMLDivElement;
  private indicator: HTMLSpanElement;
  private entries: ModeEntry[];
  private prevMode?: LayoutMode;

  constructor(
    private callbacks: RendererCallbacks,
    private i18n: I18n
  ) {
    this.root = document.createElement("div");
    this.root.className = "comimi-view-switcher";

    this.indicator = document.createElement("span");
    this.indicator.className = "comimi-view-switcher-indicator";
    this.indicator.style.transform = "translateX(0px)";
    this.root.append(this.indicator);

    const modes: Array<[LayoutMode, string, IconName]> = [
      ["inline", "layout.inline", "default"],
      ["wide", "layout.wide", "wide"],
      ["browserFullscreen", "layout.browserFullscreen", "fullscreen"]
    ];

    this.entries = modes.map(([mode, labelKey, iconName]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "comimi-view-switcher-button comimi-has-tooltip";
      button.dataset.selected = "false";
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        this.callbacks.setLayoutMode(mode);
      });

      const iconWrap = document.createElement("span");
      iconWrap.className = "comimi-view-switcher-icon-wrap";
      const iconElement = icon(iconName);
      iconElement.classList.add("comimi-view-switcher-icon");
      iconWrap.append(iconElement);

      const tooltip = document.createElement("span");
      tooltip.className = "comimi-tooltip";
      tooltip.textContent = i18n.t(labelKey);
      button.setAttribute("aria-label", i18n.t(labelKey));

      button.append(iconWrap, tooltip);
      this.root.append(button);

      return { mode, iconName, labelKey, button, iconWrap, tooltip };
    });
  }

  getElement(): HTMLElement {
    return this.root;
  }

  update(state: ViewerState): void {
    const selectedIndex = Math.max(
      0,
      this.entries.findIndex((entry) => entry.mode === state.layout.mode)
    );
    this.indicator.style.transform = `translateX(${
      selectedIndex * BUTTON_WIDTH
    }px)`;

    const changed =
      this.prevMode !== undefined && this.prevMode !== state.layout.mode;

    for (const entry of this.entries) {
      const isSelected = entry.mode === state.layout.mode;
      entry.button.dataset.selected = String(isSelected);
      if (changed && isSelected) {
        this.applyPopAnimation(entry.iconWrap);
      }
      const label = this.i18n.t(entry.labelKey);
      entry.tooltip.textContent = label;
      entry.button.setAttribute("aria-label", label);
    }

    this.prevMode = state.layout.mode;
  }

  private applyPopAnimation(element: HTMLElement): void {
    element.classList.remove("comimi-pop-animate");
    // クラスの外し→付け直しが同一フレームで相殺されないよう、
    // getBoundingClientRect でスタイル再計算を挟んで確実に再始動させる
    void element.getBoundingClientRect();
    element.classList.add("comimi-pop-animate");
  }
}
