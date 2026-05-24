import { icon } from "./icons";

export interface SelectOption {
  label: string;
  value: string | number;
}

export class ToggleSwitch {
  private root: HTMLButtonElement;

  constructor(onChange: (checked: boolean) => void) {
    this.root = document.createElement("button");
    this.root.type = "button";
    this.root.className = "comimi-toggle-switch";
    this.root.dataset.checked = "false";

    const track = document.createElement("span");
    track.className = "comimi-toggle-track";
    const knob = document.createElement("span");
    knob.className = "comimi-toggle-knob";
    track.append(knob);

    const labelWrap = document.createElement("span");
    labelWrap.className = "comimi-toggle-label-wrap";
    const labelInner = document.createElement("span");
    labelInner.className = "comimi-toggle-label-inner";
    const on = document.createElement("span");
    on.className = "comimi-toggle-label comimi-toggle-label-on";
    on.textContent = "ON";
    const off = document.createElement("span");
    off.className = "comimi-toggle-label comimi-toggle-label-off";
    off.textContent = "OFF";
    labelInner.append(on, off);
    labelWrap.append(labelInner);

    this.root.append(track, labelWrap);

    this.root.addEventListener("click", (event) => {
      event.stopPropagation();
      const isChecked = this.root.dataset.checked === "true";
      onChange(!isChecked);
    });
  }

  setChecked(checked: boolean): void {
    this.root.dataset.checked = String(checked);
  }

  getElement(): HTMLButtonElement {
    return this.root;
  }
}

export class Selectbox {
  private root: HTMLDivElement;
  private select: HTMLSelectElement;
  private label: HTMLSpanElement;
  private options: SelectOption[] = [];

  constructor(onChange: (value: string | number) => void) {
    this.root = document.createElement("div");
    this.root.className = "comimi-selectbox";

    const bg = document.createElement("span");
    bg.className = "comimi-selectbox-bg";

    this.select = document.createElement("select");
    this.select.className = "comimi-selectbox-select";
    this.select.addEventListener("change", () => {
      const next = this.options.find(
        (opt) => String(opt.value) === this.select.value
      );
      if (next) onChange(next.value);
    });

    this.label = document.createElement("span");
    this.label.className = "comimi-selectbox-label";

    const arrowIcon = icon("arrow");
    arrowIcon.classList.add("comimi-selectbox-arrow");

    this.root.append(bg, this.select, this.label, arrowIcon);
  }

  setOptions(options: SelectOption[]): void {
    const currentValue = this.select.value;
    this.options = options;
    this.select.replaceChildren();
    for (const option of options) {
      const opt = document.createElement("option");
      opt.value = String(option.value);
      opt.textContent = option.label;
      this.select.append(opt);
    }
    if (currentValue) {
      this.setValue(currentValue);
    }
  }

  setValue(value: string | number): void {
    this.select.value = String(value);
    const matched = this.options.find(
      (opt) => String(opt.value) === String(value)
    );
    this.label.textContent = matched?.label ?? "";
  }

  getElement(): HTMLDivElement {
    return this.root;
  }
}

export class RangeSlider {
  private root: HTMLDivElement;
  private input: HTMLInputElement;
  private fill: HTMLDivElement;
  private valueLabel: HTMLSpanElement;
  private unit = "";
  private min = 0;
  private max = 100;

  constructor(onChange: (value: number) => void) {
    this.root = document.createElement("div");
    this.root.className = "comimi-range-slider";

    const rangeWrap = document.createElement("div");
    rangeWrap.className = "comimi-range-slider-wrap";

    const track = document.createElement("div");
    track.className = "comimi-range-slider-track";
    this.fill = document.createElement("div");
    this.fill.className = "comimi-range-slider-fill";
    this.fill.style.width = "0%";
    track.append(this.fill);

    this.input = document.createElement("input");
    this.input.className = "comimi-range-slider-input";
    this.input.type = "range";
    this.input.addEventListener("input", () =>
      onChange(Number(this.input.value))
    );

    rangeWrap.append(track, this.input);

    this.valueLabel = document.createElement("span");
    this.valueLabel.className = "comimi-range-slider-value";

    this.root.append(rangeWrap, this.valueLabel);
  }

  setRange(min: number, max: number, step = 1): void {
    this.min = min;
    this.max = max;
    this.input.min = String(min);
    this.input.max = String(max);
    this.input.step = String(step);
  }

  setUnit(unit: string): void {
    this.unit = unit;
    this.refreshLabel();
  }

  setValue(value: number): void {
    this.input.value = String(value);
    const progress =
      this.max === this.min
        ? 0
        : ((value - this.min) / (this.max - this.min)) * 100;
    this.fill.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
    this.refreshLabel();
  }

  private refreshLabel(): void {
    this.valueLabel.textContent = `${this.input.value}${this.unit}`;
  }

  getElement(): HTMLDivElement {
    return this.root;
  }
}
