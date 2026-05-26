import { I18n } from "../i18n/i18n";
import type {
  MangaPage,
  MascotOption,
  PageTurnMode,
  ViewerState
} from "../types";
import type { RendererCallbacks } from "../renderer/renderer-callbacks";
import { icon, type IconName } from "./icons";
import { getPageIndexesForPageIndex } from "./page-layout";
import { renderRabbitMascot } from "./rabbit-mascot";
import { SettingsPanel } from "./settings-panel";

export class ControlsDock {
  private root: HTMLDivElement;

  private seekCurrent!: HTMLSpanElement;
  private seekTotal!: HTMLSpanElement;
  private seekBar!: HTMLDivElement;
  private seekFill!: HTMLDivElement;
  private seekInput!: HTMLInputElement;
  private seekPreview!: HTMLDivElement;
  private seekPreviewThumbs!: HTMLDivElement;
  private seekPreviewLabel!: HTMLDivElement;
  private seekPreviewKey?: string;
  private currentState?: ViewerState;

  private autoplayContainer!: HTMLDivElement;
  private autoplayButton!: HTMLButtonElement;
  private autoplaySlider!: HTMLSpanElement;
  private autoplayTooltip!: HTMLSpanElement;
  private autoplayProgress?: HTMLDivElement;
  private autoplayProgressBar?: HTMLSpanElement;

  private side!: HTMLDivElement;
  private pageMode!: HTMLDivElement;
  private pageModeSingleBtn!: HTMLButtonElement;
  private pageModeSpreadBtn!: HTMLButtonElement;
  private pageModeSingleIcon!: HTMLElement;
  private pageModeSpreadIcon!: HTMLElement;
  private pageModeSingleTooltip!: HTMLSpanElement;
  private pageModeSpreadTooltip!: HTMLSpanElement;

  private settings!: SettingsPanel;
  private settingsContainer!: HTMLDivElement;
  private settingsButton!: HTMLButtonElement;
  private settingsIcon!: SVGSVGElement | HTMLElement;
  private settingsTooltip!: HTMLSpanElement;

  private prevPageTurnMode?: PageTurnMode;

  constructor(
    private callbacks: RendererCallbacks,
    private i18n: I18n,
    private mascot?: MascotOption
  ) {
    this.root = document.createElement("div");
    this.root.className = "comimi-controls-dock";
    this.root.dataset.overlay = "false";
    this.root.dataset.autoplay = "false";

    const bg = document.createElement("div");
    bg.className = "comimi-controls-bg";

    const mascotEl = renderRabbitMascot(this.mascot);
    const children: Node[] = [bg];
    if (mascotEl) children.push(mascotEl);
    children.push(this.buildSeek(), this.buildRow());
    this.root.append(...children);
  }

  getElement(): HTMLElement {
    return this.root;
  }

  update(state: ViewerState, isMobile: boolean): void {
    this.currentState = state;
    this.root.dataset.autoplay = String(state.autoPageTurnEnabled);

    // Seek
    const total = state.manga.pages.length;
    const totalDisplay = Math.max(1, total);
    const current = state.currentPageIndex + 1;
    const fillRatio = total <= 1 ? 0 : state.currentPageIndex / (total - 1);
    this.seekCurrent.textContent = String(current);
    this.seekTotal.textContent = ` / ${totalDisplay}`;
    this.seekFill.style.width = `${fillRatio * 100}%`;
    this.seekBar.dataset.direction = state.settings.readingDirection;
    this.seekInput.max = String(Math.max(0, total - 1));
    if (document.activeElement !== this.seekInput) {
      this.seekInput.value = String(state.currentPageIndex);
    }
    this.seekInput.dataset.direction = state.settings.readingDirection;

    // Autoplay
    this.autoplaySlider.dataset.active = String(state.autoPageTurnEnabled);
    const autoplayLabel = this.i18n.t("overlay.autoPageTurn");
    this.autoplayButton.setAttribute("aria-label", autoplayLabel);
    this.autoplayTooltip.textContent = autoplayLabel;

    if (state.autoPageTurnEnabled) {
      if (!this.autoplayProgress) {
        this.autoplayProgress = document.createElement("div");
        this.autoplayProgress.className = "comimi-autoplay-progress";
        this.autoplayProgressBar = document.createElement("span");
        this.autoplayProgressBar.className = "comimi-autoplay-progress-bar";
        this.autoplayProgress.append(this.autoplayProgressBar);
        this.autoplayContainer.append(this.autoplayProgress);
      }
      this.autoplayProgressBar!.style.animationDuration = `${state.settings.autoPageTurnIntervalMs}ms`;
    } else if (this.autoplayProgress) {
      this.autoplayProgress.remove();
      this.autoplayProgress = undefined;
      this.autoplayProgressBar = undefined;
    }

    // Page mode
    const isSpread = state.settings.pageTurnMode === "spread";
    this.pageModeSingleBtn.dataset.selected = String(!isSpread);
    this.pageModeSpreadBtn.dataset.selected = String(isSpread);

    const pageModeChanged =
      this.prevPageTurnMode !== undefined &&
      this.prevPageTurnMode !== state.settings.pageTurnMode;
    if (pageModeChanged) {
      const targetIcon = isSpread
        ? this.pageModeSpreadIcon
        : this.pageModeSingleIcon;
      this.applyPopAnimation(targetIcon);
    }

    this.pageModeSingleTooltip.textContent = this.i18n.t("pageMode.single");
    this.pageModeSpreadTooltip.textContent = this.i18n.t("pageMode.spread");
    this.pageMode.style.display = isMobile ? "none" : "";

    // Settings
    const settingsLabel = this.i18n.t("overlay.settings");
    this.settingsButton.setAttribute("aria-label", settingsLabel);
    this.settingsTooltip.textContent = settingsLabel;
    this.settingsContainer.dataset.open = String(state.panel === "settings");
    this.settings.update(state);

    this.prevPageTurnMode = state.settings.pageTurnMode;
  }

  private buildSeek(): HTMLDivElement {
    const wrap = document.createElement("div");
    wrap.className = "comimi-seek";

    const textWrap = document.createElement("div");
    textWrap.className = "comimi-seek-text";

    this.seekCurrent = document.createElement("span");
    this.seekCurrent.className = "comimi-seek-current";

    this.seekTotal = document.createElement("span");
    this.seekTotal.className = "comimi-seek-total";

    textWrap.append(this.seekCurrent, this.seekTotal);

    this.seekBar = document.createElement("div");
    this.seekBar.className = "comimi-seek-bar";
    this.seekBar.dataset.direction = "rtl";

    const seekTrack = document.createElement("div");
    seekTrack.className = "comimi-seek-track";

    this.seekFill = document.createElement("div");
    this.seekFill.className = "comimi-seek-fill";
    this.seekFill.style.width = "0%";
    seekTrack.append(this.seekFill);

    this.seekInput = document.createElement("input");
    this.seekInput.className = "comimi-seek-input";
    this.seekInput.type = "range";
    this.seekInput.min = "0";
    this.seekInput.max = "0";
    this.seekInput.step = "1";
    this.seekInput.value = "0";
    this.seekInput.setAttribute("aria-label", "Seek bar");
    this.seekInput.addEventListener("input", () => {
      this.callbacks.goToPage(Number(this.seekInput.value));
    });

    this.seekPreview = document.createElement("div");
    this.seekPreview.className = "comimi-seek-preview";
    this.seekPreview.dataset.show = "false";

    this.seekPreviewThumbs = document.createElement("div");
    this.seekPreviewThumbs.className = "comimi-seek-preview-thumbs";

    this.seekPreviewLabel = document.createElement("div");
    this.seekPreviewLabel.className = "comimi-seek-preview-label";

    this.seekPreview.append(this.seekPreviewThumbs, this.seekPreviewLabel);

    this.seekBar.addEventListener("mousemove", (event) =>
      this.updateSeekPreview(event)
    );
    this.seekBar.addEventListener("mouseleave", () => {
      this.seekPreview.dataset.show = "false";
    });

    this.seekBar.append(seekTrack, this.seekInput, this.seekPreview);
    wrap.append(textWrap, this.seekBar);
    return wrap;
  }

  private updateSeekPreview(event: MouseEvent): void {
    const state = this.currentState;
    if (!state) return;
    const total = state.manga.pages.length;
    if (total === 0) return;

    const rect = this.seekBar.getBoundingClientRect();
    if (rect.width === 0) return;
    const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    const rawRatio = x / rect.width;
    const ratio =
      state.settings.readingDirection === "rtl" ? 1 - rawRatio : rawRatio;
    const targetIndex = Math.min(
      total - 1,
      Math.max(0, Math.floor(ratio * total))
    );
    const indexes = getPageIndexesForPageIndex(state, targetIndex, false);
    const pages = indexes
      .map((index) => state.manga.pages[index])
      .filter((page): page is MangaPage => Boolean(page));

    this.refreshSeekPreviewThumbs(indexes, pages);

    const sorted = [...indexes].sort((a, b) => a - b);
    this.seekPreviewLabel.textContent =
      sorted.length > 1
        ? `${sorted[0] + 1} - ${sorted[sorted.length - 1] + 1}`
        : String(sorted[0] + 1);
    this.seekPreview.style.left = `${x}px`;
    this.seekPreview.dataset.show = "true";
  }

  private refreshSeekPreviewThumbs(
    indexes: number[],
    pages: MangaPage[]
  ): void {
    const key = indexes.join(",");
    if (this.seekPreviewKey === key) return;
    this.seekPreviewKey = key;

    this.seekPreviewThumbs.replaceChildren();
    for (const page of pages) {
      const thumb = document.createElement("div");
      thumb.className = "comimi-seek-preview-thumb";
      if (page.type === "image") {
        const img = document.createElement("img");
        img.src = page.thumbnailSrc ?? page.src;
        img.alt = "";
        img.draggable = false;
        thumb.append(img);
        thumb.dataset.kind = "image";
      } else {
        const text = document.createElement("span");
        text.textContent = this.i18n.t("pageList.htmlContent");
        thumb.append(text);
        thumb.dataset.kind = "html";
      }
      this.seekPreviewThumbs.append(thumb);
    }
  }

  private buildRow(): HTMLDivElement {
    const row = document.createElement("div");
    row.className = "comimi-controls-row";
    row.append(this.buildAutoplay(), this.buildSide());
    return row;
  }

  private buildAutoplay(): HTMLDivElement {
    this.autoplayContainer = document.createElement("div");
    this.autoplayContainer.className = "comimi-autoplay";

    this.autoplayButton = document.createElement("button");
    this.autoplayButton.type = "button";
    this.autoplayButton.className = "comimi-autoplay-button comimi-has-tooltip";
    this.autoplayButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.callbacks.toggleAutoPageTurn();
    });

    const win = document.createElement("span");
    win.className = "comimi-autoplay-window";

    this.autoplaySlider = document.createElement("span");
    this.autoplaySlider.className = "comimi-autoplay-slider";
    this.autoplaySlider.dataset.active = "false";

    const playIcon = icon("play");
    playIcon.classList.add("comimi-autoplay-icon", "comimi-autoplay-icon-play");
    const pauseIcon = icon("pause");
    pauseIcon.classList.add("comimi-autoplay-icon", "comimi-autoplay-icon-pause");
    this.autoplaySlider.append(playIcon, pauseIcon);
    win.append(this.autoplaySlider);

    this.autoplayTooltip = document.createElement("span");
    this.autoplayTooltip.className = "comimi-tooltip";

    this.autoplayButton.append(win, this.autoplayTooltip);
    this.autoplayContainer.append(this.autoplayButton);
    return this.autoplayContainer;
  }

  private buildSide(): HTMLDivElement {
    this.side = document.createElement("div");
    this.side.className = "comimi-controls-side";

    this.pageMode = document.createElement("div");
    this.pageMode.className = "comimi-page-mode";

    const pageModeWrapper = document.createElement("div");
    pageModeWrapper.className = "comimi-page-mode-wrapper";

    [
      this.pageModeSingleBtn,
      this.pageModeSingleIcon,
      this.pageModeSingleTooltip
    ] = this.buildPageModeButton("single", "one");
    [
      this.pageModeSpreadBtn,
      this.pageModeSpreadIcon,
      this.pageModeSpreadTooltip
    ] = this.buildPageModeButton("spread", "two");

    pageModeWrapper.append(this.pageModeSingleBtn, this.pageModeSpreadBtn);
    this.pageMode.append(pageModeWrapper);

    [
      this.settingsContainer,
      this.settingsButton,
      this.settingsIcon,
      this.settingsTooltip
    ] = this.buildSettings();
    this.settings = new SettingsPanel(this.callbacks, this.i18n);
    this.settingsContainer.append(this.settings.getElement());

    this.side.append(this.pageMode, this.settingsContainer);
    return this.side;
  }

  private buildPageModeButton(
    mode: PageTurnMode,
    iconName: IconName
  ): [HTMLButtonElement, HTMLElement, HTMLSpanElement] {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "comimi-page-mode-button comimi-has-tooltip";
    button.dataset.selected = "false";
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      this.callbacks.updateSettings({ pageTurnMode: mode });
    });

    const iconElement = icon(iconName);
    iconElement.classList.add("comimi-page-mode-icon");

    const tooltip = document.createElement("span");
    tooltip.className = "comimi-tooltip";

    button.append(iconElement, tooltip);
    return [button, iconElement as HTMLElement, tooltip];
  }

  private buildSettings(): [
    HTMLDivElement,
    HTMLButtonElement,
    HTMLElement,
    HTMLSpanElement
  ] {
    const container = document.createElement("div");
    container.className = "comimi-settings";
    container.dataset.open = "false";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "comimi-settings-button comimi-has-tooltip";
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = container.dataset.open === "true";
      this.callbacks.setPanel(isOpen ? "none" : "settings");
    });

    const iconElement = icon("settings");
    iconElement.classList.add("comimi-settings-icon");

    const tooltip = document.createElement("span");
    tooltip.className = "comimi-tooltip";

    button.append(iconElement, tooltip);
    container.append(button);
    return [container, button, iconElement as HTMLElement, tooltip];
  }

  private applyPopAnimation(element: HTMLElement): void {
    element.classList.remove("comimi-pop-animate");
    void element.offsetWidth;
    element.classList.add("comimi-pop-animate");
  }
}
