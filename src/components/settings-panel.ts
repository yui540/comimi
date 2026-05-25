import { I18n } from "../i18n/i18n";
import type { ReadingDirection, ViewerState } from "../types";
import type { RendererCallbacks } from "../renderer/renderer-callbacks";
import { RangeSlider, Selectbox, ToggleSwitch } from "./inputs";

export class SettingsPanel {
  private root: HTMLDivElement;
  private body: HTMLDivElement;
  private inner: HTMLDivElement;

  private titleEl: HTMLDivElement;
  private localeLabel: HTMLDivElement;
  private coverLabel: HTMLDivElement;
  private directionLabel: HTMLDivElement;
  private animationLabel: HTMLDivElement;
  private intervalLabel: HTMLDivElement;

  private localeSelect: Selectbox;
  private coverToggle: ToggleSwitch;
  private directionSelect: Selectbox;
  private animationToggle: ToggleSwitch;
  private intervalSlider: RangeSlider;

  constructor(
    private callbacks: RendererCallbacks,
    private i18n: I18n
  ) {
    this.root = document.createElement("div");
    this.root.className = "comimi-settings-panel";
    this.root.dataset.open = "false";
    this.root.setAttribute("role", "dialog");
    this.root.addEventListener("click", (event) => event.stopPropagation());

    this.body = document.createElement("div");
    this.body.className = "comimi-settings-panel-body";

    this.inner = document.createElement("div");
    this.inner.className = "comimi-settings-panel-inner";

    this.titleEl = document.createElement("div");
    this.titleEl.className = "comimi-settings-panel-title";

    this.localeSelect = new Selectbox((locale) =>
      this.callbacks.updateSettings({ locale: String(locale) })
    );
    this.coverToggle = new ToggleSwitch((hasCover) =>
      this.callbacks.updateSettings({ hasCover })
    );
    this.directionSelect = new Selectbox((direction) =>
      this.callbacks.updateSettings({
        readingDirection: direction as ReadingDirection
      })
    );
    this.animationToggle = new ToggleSwitch((pageTurnAnimation) =>
      this.callbacks.updateSettings({ pageTurnAnimation })
    );
    this.intervalSlider = new RangeSlider((seconds) =>
      this.callbacks.updateSettings({
        autoPageTurnIntervalMs: Math.max(1, seconds) * 1000
      })
    );

    this.intervalSlider.setRange(3, 30, 1);

    this.localeLabel = this.createLabel();
    this.coverLabel = this.createLabel();
    this.directionLabel = this.createLabel();
    this.animationLabel = this.createLabel();
    this.intervalLabel = this.createLabel();

    this.inner.append(
      this.titleEl,
      this.section(this.localeLabel, this.localeSelect.getElement()),
      this.section(this.coverLabel, this.coverToggle.getElement()),
      this.section(this.directionLabel, this.directionSelect.getElement()),
      this.section(this.animationLabel, this.animationToggle.getElement()),
      this.section(this.intervalLabel, this.intervalSlider.getElement())
    );

    this.body.append(this.inner);
    this.root.append(this.body);
  }

  update(state: ViewerState): void {
    this.titleEl.textContent = this.i18n.t("settings.title");
    this.localeLabel.textContent = "Language";
    this.coverLabel.textContent = this.i18n.t("settings.cover");
    this.directionLabel.textContent = this.i18n.t("settings.direction");
    this.animationLabel.textContent = this.i18n.t("settings.animation");
    this.intervalLabel.textContent = this.i18n.t("settings.interval");

    this.localeSelect.setOptions([
      { label: "日本語", value: "ja" },
      { label: "English", value: "en" },
      { label: "한국어", value: "ko" }
    ]);
    this.directionSelect.setOptions([
      { label: this.i18n.t("settings.direction.rtl"), value: "rtl" },
      { label: this.i18n.t("settings.direction.ltr"), value: "ltr" }
    ]);
    this.intervalSlider.setUnit(this.i18n.t("settings.interval.unit"));

    this.localeSelect.setValue(state.settings.locale);
    this.coverToggle.setChecked(state.settings.hasCover);
    this.directionSelect.setValue(state.settings.readingDirection);
    this.animationToggle.setChecked(state.settings.pageTurnAnimation);
    this.intervalSlider.setValue(
      Math.round(state.settings.autoPageTurnIntervalMs / 1000)
    );

    this.root.dataset.open = String(state.panel === "settings");

    this.scheduleHeightUpdate();
  }

  getElement(): HTMLElement {
    return this.root;
  }

  private createLabel(): HTMLDivElement {
    const label = document.createElement("div");
    label.className = "comimi-settings-label";
    return label;
  }

  private section(label: HTMLDivElement, control: HTMLElement): HTMLDivElement {
    const wrap = document.createElement("div");
    wrap.className = "comimi-settings-section";
    wrap.append(label, control);
    return wrap;
  }

  private scheduleHeightUpdate(): void {
    const apply = () => {
      this.root.style.setProperty(
        "--comimi-settings-height",
        `${this.body.offsetHeight}px`
      );
    };
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => requestAnimationFrame(apply));
    } else {
      setTimeout(apply, 0);
    }
  }
}
