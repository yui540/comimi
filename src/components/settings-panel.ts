import { I18n } from "../i18n/i18n";
import type {
  ColorTheme,
  HideableControl,
  ReadingDirection,
  ViewerState
} from "../types";
import type { RendererCallbacks } from "../renderer/renderer-callbacks";
import { RangeSlider, Selectbox, ToggleSwitch } from "./inputs";
import { bindScrollFade } from "./scroll-fade";

export class SettingsPanel {
  private root: HTMLDivElement;
  private body: HTMLDivElement;
  private inner: HTMLDivElement;

  private titleEl: HTMLDivElement;
  private localeLabel: HTMLDivElement;
  private themeLabel: HTMLDivElement;
  private coverLabel: HTMLDivElement;
  private directionLabel: HTMLDivElement;
  private intervalLabel: HTMLDivElement;

  private localeSelect: Selectbox;
  private themeSelect: Selectbox;
  private coverToggle: ToggleSwitch;
  private directionSelect: Selectbox;
  private intervalSlider: RangeSlider;

  private staticValues: Partial<Record<HideableControl, HTMLDivElement>> = {};

  constructor(
    private callbacks: RendererCallbacks,
    private i18n: I18n,
    private hidden: ReadonlySet<HideableControl> = new Set()
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
    this.themeSelect = new Selectbox((theme) =>
      this.callbacks.updateSettings({ theme: theme as ColorTheme })
    );
    this.coverToggle = new ToggleSwitch((hasCover) =>
      this.callbacks.updateSettings({ hasCover })
    );
    this.directionSelect = new Selectbox((direction) =>
      this.callbacks.updateSettings({
        readingDirection: direction as ReadingDirection
      })
    );
    this.intervalSlider = new RangeSlider((seconds) =>
      this.callbacks.updateSettings({
        autoPageTurnIntervalMs: Math.max(1, seconds) * 1000
      })
    );

    this.intervalSlider.setRange(3, 30, 1);

    this.localeLabel = this.createLabel();
    this.themeLabel = this.createLabel();
    this.coverLabel = this.createLabel();
    this.directionLabel = this.createLabel();
    this.intervalLabel = this.createLabel();

    this.inner.append(
      this.titleEl,
      this.buildSection(
        "locale",
        this.localeLabel,
        this.localeSelect.getElement()
      ),
      this.buildSection(
        "theme",
        this.themeLabel,
        this.themeSelect.getElement()
      ),
      this.buildSection(
        "cover",
        this.coverLabel,
        this.coverToggle.getElement()
      ),
      this.buildSection(
        "direction",
        this.directionLabel,
        this.directionSelect.getElement()
      ),
      this.buildSection(
        "interval",
        this.intervalLabel,
        this.intervalSlider.getElement()
      )
    );

    this.body.append(this.inner);
    this.root.append(this.body);

    bindScrollFade(this.body);
  }

  update(state: ViewerState): void {
    this.titleEl.textContent = this.i18n.t("settings.title");
    this.localeLabel.textContent = "Language";
    this.themeLabel.textContent = this.i18n.t("settings.theme");
    this.coverLabel.textContent = this.i18n.t("settings.cover");
    this.directionLabel.textContent = this.i18n.t("settings.direction");
    this.intervalLabel.textContent = this.i18n.t("settings.interval");

    const localeOptions = [
      { label: "日本語", value: "ja" },
      { label: "English", value: "en" },
      { label: "简体中文", value: "zh-CN" },
      { label: "한국어", value: "ko" },
      { label: "ภาษาไทย", value: "th" },
      { label: "Indonesia", value: "id" }
    ];
    const directionOptions = [
      { label: this.i18n.t("settings.direction.rtl"), value: "rtl" },
      { label: this.i18n.t("settings.direction.ltr"), value: "ltr" }
    ];
    const themeOptions = [
      { label: this.i18n.t("settings.theme.light"), value: "light" },
      { label: this.i18n.t("settings.theme.dark"), value: "dark" }
    ];
    const intervalUnit = this.i18n.t("settings.interval.unit");
    const intervalSeconds = Math.round(
      state.settings.autoPageTurnIntervalMs / 1000
    );

    this.localeSelect.setOptions(localeOptions);
    this.themeSelect.setOptions(themeOptions);
    this.directionSelect.setOptions(directionOptions);
    this.intervalSlider.setUnit(intervalUnit);

    this.localeSelect.setValue(state.settings.locale);
    this.themeSelect.setValue(state.settings.theme);
    this.coverToggle.setChecked(state.settings.hasCover);
    this.directionSelect.setValue(state.settings.readingDirection);
    this.intervalSlider.setValue(intervalSeconds);

    this.setStaticValue(
      "locale",
      this.labelFor(localeOptions, state.settings.locale)
    );
    this.setStaticValue(
      "theme",
      this.labelFor(themeOptions, state.settings.theme)
    );
    this.setStaticValue("cover", state.settings.hasCover ? "ON" : "OFF");
    this.setStaticValue(
      "direction",
      this.labelFor(directionOptions, state.settings.readingDirection)
    );
    this.setStaticValue("interval", `${intervalSeconds}${intervalUnit}`);

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

  /**
   * 非表示指定された項目は編集UIの代わりに値を静的表示する。
   * 値の確認はできるが操作はできない。
   */
  private buildSection(
    key: HideableControl,
    label: HTMLDivElement,
    control: HTMLElement
  ): HTMLDivElement {
    if (this.hidden.has(key)) {
      const value = document.createElement("div");
      value.className = "comimi-settings-static-value";
      this.staticValues[key] = value;
      return this.section(label, value);
    }
    return this.section(label, control);
  }

  private setStaticValue(key: HideableControl, text: string): void {
    const value = this.staticValues[key];
    if (value) value.textContent = text;
  }

  private labelFor(
    options: { label: string; value: string }[],
    value: string
  ): string {
    return options.find((opt) => opt.value === value)?.label ?? value;
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
